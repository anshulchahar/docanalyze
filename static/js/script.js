document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('pdfFiles');
    const fileList = document.getElementById('fileList');
    const loadingSection = document.getElementById('loading');
    const resultsSection = document.getElementById('results');
    const downloadBtn = document.getElementById('download-btn');
    
    // Display selected files in the list
    fileInput.addEventListener('change', function() {
        fileList.innerHTML = '';
        if (this.files.length > 0) {
            const header = document.createElement('p');
            header.textContent = `Selected files (${this.files.length}):`;
            fileList.appendChild(header);
            
            const list = document.createElement('ul');
            for (let i = 0; i < this.files.length; i++) {
                const item = document.createElement('li');
                item.textContent = this.files[i].name;
                list.appendChild(item);
            }
            fileList.appendChild(list);
        }
    });
    
    // Handle form submission
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Hide previous results and show loading
        resultsSection.style.display = 'none';
        loadingSection.style.display = 'flex';
        
        const formData = new FormData();
        const apiKey = document.getElementById('apiKey').value;
        
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
            
            const result = await response.json();
            
            if (response.ok) {
                displayResults(result);
            } else {
                alert('Error: ' + result.error);
                loadingSection.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during analysis. Please try again.');
            loadingSection.style.display = 'none';
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
            const infoHeader = document.createElement('h4');
            infoHeader.textContent = 'Analyzed Files:';
            fileInfoElement.appendChild(infoHeader);
            
            const infoList = document.createElement('ul');
            data.fileInfo.forEach(file => {
                const item = document.createElement('li');
                item.textContent = `${file.filename} (${file.character_count} characters)`;
                infoList.appendChild(item);
            });
            fileInfoElement.appendChild(infoList);
        }
        
        // Fill in the result sections
        document.getElementById('summary').innerHTML = data.summary.replace(/\n/g, '<br>');
        
        const keyPointsList = document.getElementById('key-points');
        keyPointsList.innerHTML = '';
        
        if (data.keyPoints && data.keyPoints.length > 0) {
            data.keyPoints.forEach(point => {
                const li = document.createElement('li');
                li.textContent = point;
                keyPointsList.appendChild(li);
            });
        }
        
        document.getElementById('detailed-analysis').innerHTML = data.detailedAnalysis.replace(/\n/g, '<br>');
        document.getElementById('recommendations').innerHTML = data.recommendations.replace(/\n/g, '<br>');
        
        // Fill in document comparison section (new for multi-document support)
        const comparisonElement = document.getElementById('document-comparison');
        if (data.documentComparison && data.documentComparison.trim()) {
            comparisonElement.innerHTML = data.documentComparison.replace(/\n/g, '<br>');
            comparisonElement.parentElement.style.display = 'block';
        } else {
            comparisonElement.innerHTML = 'No document comparison available (only one document was analyzed).';
            comparisonElement.parentElement.style.display = data.fileInfo && data.fileInfo.length > 1 ? 'block' : 'none';
        }
    }
    
    // Handle download button
    downloadBtn.addEventListener('click', function() {
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
        let fileInfoText = 'Analyzed Files:\n';
        for (let i = 0; i < fileInfoItems.length; i++) {
            fileInfoText += '- ' + fileInfoItems[i].innerText + '\n';
        }
        
        // Compile full report
        const fullReport = 
            'PDF DOCUMENT ANALYSIS REPORT\n\n' +
            fileInfoText + '\n\n' +
            'SUMMARY:\n' + summaryText + '\n\n' +
            'KEY POINTS:\n' + keyPointsText + '\n\n' +
            (documentComparisonText ? 'DOCUMENT COMPARISON:\n' + documentComparisonText + '\n\n' : '') +
            'DETAILED ANALYSIS:\n' + detailedAnalysisText + '\n\n' +
            'RECOMMENDATIONS:\n' + recommendationsText;
        
        // Create and download file
        const blob = new Blob([fullReport], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document-analysis-report.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});