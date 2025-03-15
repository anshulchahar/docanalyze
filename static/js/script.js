document.addEventListener('DOMContentLoaded', function () {
  const uploadForm = document.getElementById('upload-form');
  const fileInput = document.getElementById('pdfFiles');
  const dropArea = document.getElementById('drop-area');
  const fileList = document.getElementById('fileList');
  const loadingSection = document.getElementById('loading');
  const resultsSection = document.getElementById('results-window');
  const errorMessage = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  const downloadBtn = document.getElementById('download-btn');
  const themeToggle = document.getElementById('theme-toggle');

  // Theme switching functionality
  function initTheme() {
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
  }

  initTheme();

  themeToggle.addEventListener('change', function () {
    const newTheme = this.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // Drag and drop functionality
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    dropArea.classList.add('active');
  }

  function unhighlight() {
    dropArea.classList.remove('active');
  }

  dropArea.addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
  }

  // Click on dropzone to trigger file input
  dropArea.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', function () {
    handleFiles(this.files);
  });

  function handleFiles(files) {
    // Validate file types (only PDFs)
    const validFiles = Array.from(files).filter(file => file.type === 'application/pdf');

    if (validFiles.length === 0) {
      showError('Please select PDF files only.');
      return;
    }

    // Update file list display
    updateFileList(validFiles);

    // Set the files to the input element for form submission
    const dataTransfer = new DataTransfer();
    validFiles.forEach(file => {
      dataTransfer.items.add(file);
    });
    fileInput.files = dataTransfer.files;
  }

  function updateFileList(files) {
    fileList.innerHTML = '';

    if (files.length > 0) {
      Array.from(files).forEach((file, index) => {
        const fileSize = formatFileSize(file.size);
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';

        fileItem.innerHTML = `
          <div class="file-info">
            <span class="file-name"><i class="fas fa-file-pdf"></i> ${file.name}</span>
            <span class="file-size">${fileSize}</span>
          </div>
          <button type="button" class="file-delete" data-index="${index}">
            <i class="fas fa-times"></i>
          </button>
        `;

        // Add delete button functionality
        const deleteBtn = fileItem.querySelector('.file-delete');
        deleteBtn.addEventListener('click', function () {
          const idx = parseInt(this.getAttribute('data-index'));
          removeFile(idx);
        });

        fileList.appendChild(fileItem);
      });
    }
  }

  function removeFile(index) {
    const dt = new DataTransfer();
    const files = fileInput.files;

    for (let i = 0; i < files.length; i++) {
      if (i !== index) {
        dt.items.add(files[i]);
      }
    }

    fileInput.files = dt.files;
    updateFileList(fileInput.files);
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 5000);
  }

  // Handle form submission
  uploadForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    errorMessage.style.display = 'none';
    resultsSection.style.display = 'none';

    // Validate inputs
    if (!fileInput.files || fileInput.files.length === 0) {
      showError('Please select at least one PDF file for analysis.');
      return;
    }

    const apiKey = document.getElementById('apiKey').value;
    if (!apiKey) {
      showError('Please enter your Gemini API key.');
      return;
    }

    // Show loading and start progress
    loadingSection.style.display = 'flex';
    const progressBar = document.getElementById('progressBar');
    let progress = 0;

    const progressInterval = setInterval(() => {
      if (progress < 90) {
        progress += Math.random() * 10;
        progressBar.style.width = `${Math.min(progress, 90)}%`;
      }
    }, 500);

    const formData = new FormData();

    // Add all files to form data
    const files = fileInput.files;
    for (let i = 0; i < files.length; i++) {
      formData.append('pdfFiles', files[i]);
    }

    formData.append('apiKey', apiKey);

    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      progressBar.style.width = '100%';

      const result = await response.json();

      if (response.ok) {
        displayResults(result);
      } else {
        loadingSection.style.display = 'none';
        showError(result.error || 'An error occurred during analysis.');
      }
    } catch (error) {
      clearInterval(progressInterval);
      loadingSection.style.display = 'none';
      console.error('Error:', error);
      showError('Network error occurred. Please check your connection and try again.');
    }
  });

  // Function to display results
  function displayResults(data) {
    // Hide loading and show results
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'block';

    // Display file info
    const fileInfoElement = document.getElementById('fileInfo');
    fileInfoElement.innerHTML = '';

    if (data.fileInfo && data.fileInfo.length > 0) {
      const infoHeader = document.createElement('h3');
      infoHeader.className = 'section-title';
      infoHeader.textContent = 'Documents Analyzed';
      fileInfoElement.appendChild(infoHeader);

      const infoList = document.createElement('ul');
      data.fileInfo.forEach(file => {
        const item = document.createElement('li');
        item.innerHTML = `<strong>${file.filename}</strong> (${formatNumber(file.character_count)} characters)`;
        infoList.appendChild(item);
      });
      fileInfoElement.appendChild(infoList);
    }

    // Fill in the result sections
    document.getElementById('summary').innerHTML = formatText(data.summary);

    const keyPointsList = document.getElementById('key-points');
    keyPointsList.innerHTML = '';

    if (data.keyPoints && Array.isArray(data.keyPoints) && data.keyPoints.length > 0) {
      data.keyPoints.forEach(point => {
        const li = document.createElement('li');
        li.innerHTML = point;
        keyPointsList.appendChild(li);
      });
    } else if (data.keyPoints && typeof data.keyPoints === 'string') {
      // Handle case where keyPoints might be a string
      const points = data.keyPoints.split('\n')
        .filter(p => p.trim())
        .map(p => p.replace(/^[-•]\s*/, '').trim());

      points.forEach(point => {
        if (point) {
          const li = document.createElement('li');
          li.innerHTML = point;
          keyPointsList.appendChild(li);
        }
      });
    }

    document.getElementById('detailed-analysis').innerHTML = formatText(data.detailedAnalysis);
    document.getElementById('recommendations').innerHTML = formatText(data.recommendations);

    // Fill in document comparison section
    const comparisonElement = document.getElementById('document-comparison');
    const comparisonSection = document.getElementById('comparison-section');

    if (data.documentComparison && data.documentComparison.trim()) {
      comparisonElement.innerHTML = formatText(data.documentComparison);
      comparisonSection.style.display = 'block';
    } else {
      comparisonSection.style.display = data.fileInfo && data.fileInfo.length > 1 ? 'block' : 'none';
      comparisonElement.innerHTML = data.fileInfo && data.fileInfo.length > 1 ?
        'No explicit comparison was provided by the AI.' :
        'Document comparison is only available when analyzing multiple PDFs.';
    }

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  function formatText(text) {
    if (!text) return '';

    // Convert line breaks to HTML
    let formatted = text.replace(/\n/g, '<br>');

    // Bold headings (lines that are all uppercase or end with a colon)
    formatted = formatted.replace(/^([A-Z][A-Z\s]+)(?=<br>|$)/gm, '<strong>$1</strong>');
    formatted = formatted.replace(/^(.*?:)(?=<br>|$)/gm, '<strong>$1</strong>');

    return formatted;
  }

  function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
  }

  // Handle download button
  downloadBtn.addEventListener('click', function () {
    const summaryText = document.getElementById('summary').innerText;
    const keyPointsItems = document.getElementById('key-points').getElementsByTagName('li');
    let keyPointsText = '';
    for (let i = 0; i < keyPointsItems.length; i++) {
      keyPointsText += '- ' + keyPointsItems[i].innerText + '\n';
    }

    const documentComparisonText = document.getElementById('document-comparison').innerText;
    const detailedAnalysisText = document.getElementById('detailed-analysis').innerText;
    const recommendationsText = document.getElementById('recommendations').innerText;

    // Create file info section
    const fileInfoItems = document.getElementById('fileInfo').getElementsByTagName('li');
    let fileInfoText = 'DOCUMENTS ANALYZED:\n';
    for (let i = 0; i < fileInfoItems.length; i++) {
      fileInfoText += '- ' + fileInfoItems[i].innerText + '\n';
    }

    // Compile full report with new name
    const fullReport =
      'SOLVA DOCUMENT ANALYSIS REPORT\n\n' +
      fileInfoText + '\n\n' +
      'EXECUTIVE SUMMARY:\n' + summaryText + '\n\n' +
      'KEY POINTS:\n' + keyPointsText + '\n\n' +
      (documentComparisonText ? 'DOCUMENT COMPARISON:\n' + documentComparisonText + '\n\n' : '') +
      'DETAILED ANALYSIS:\n' + detailedAnalysisText + '\n\n' +
      'RECOMMENDATIONS:\n' + recommendationsText;

    // Create and download file with new name prefix
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `solva-analysis-${timestamp}.txt`;

    const blob = new Blob([fullReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Add a subtle animation for sun elements
  const sunElements = document.querySelectorAll('.fa-sun');
  sunElements.forEach(sun => {
    if (!sun.classList.contains('toggle-icon')) {
      sun.addEventListener('mouseover', function () {
        this.style.transform = 'rotate(180deg)';
        this.style.transition = 'transform 1s';
      });

      sun.addEventListener('mouseout', function () {
        this.style.transform = 'rotate(0deg)';
        this.style.transition = 'transform 1s';
      });
    }
  });
});