// React components
function ModemAnimation({ active }) {
  return (
    React.createElement("div", { className: "modem" },
      React.createElement("div", { className: `modem-light ${active ? 'active' : ''}` }),
      React.createElement("div", { className: `modem-light ${active ? 'active' : ''}` }),
      React.createElement("div", { className: `modem-light ${active ? 'active' : ''}` }),
      React.createElement("div", { className: `modem-light ${active ? 'active' : ''}` })
    )
  );
}

function Window({ title, children }) {
  return (
    React.createElement("div", { className: "window" },
      React.createElement("div", { className: "window-title" },
        React.createElement("span", null, title),
        React.createElement("div", { className: "window-title-buttons" },
          React.createElement("div", { className: "title-button" }, "_"),
          React.createElement("div", { className: "title-button" }, "□"),
          React.createElement("div", { className: "title-button" }, "×")
        )
      ),
      React.createElement("div", { className: "window-body" }, children)
    )
  );
}

function App() {
  const [file, setFile] = React.useState(null);
  const [apiKey, setApiKey] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState('');
  const [results, setResults] = React.useState(null);
  const [startSound] = React.useState(new Audio('https://www.myinstants.com/media/sounds/dialup.mp3'));

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!apiKey) {
      setError('Please enter your API key');
      return;
    }

    setError('');
    setResults(null);
    setLoading(true);
    simulateProgress();

    try {
      // Play dialup sound
      startSound.play().catch(e => console.log('Audio play failed:', e));

      const formData = new FormData();
      formData.append('pdfFile', file);
      formData.append('apiKey', apiKey);

      const response = await fetch('/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze PDF');
      }

      setResults({
        summary: data.summary,
        keyPoints: data.keyPoints,
        detailedAnalysis: data.detailedAnalysis,
        recommendations: data.recommendations || data.detailedInfo
      });

      setProgress(100);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    "div",
    { className: "app-container" },
    React.createElement(
      "div",
      { className: "marquee" },
      React.createElement(
        "p",
        null,
        "Welcome to the 90's PDF Analyzer! Upload your PDF and get instant analysis with the power of AI! * Built with Gemini API * Totally radical! * Information superhighway!"
      )
    ),

    React.createElement(
      "h1",
      { style: { textAlign: 'center', textShadow: '3px 3px 0px rgba(0,0,0,0.5)' } },
      "<< 90's PDF ANALYZER >>"
    ),

    React.createElement(
      Window,
      { title: "Upload.exe" },
      React.createElement(
        "form",
        { onSubmit: handleSubmit },
        React.createElement("label", { htmlFor: "pdfFile" }, "SELECT YOUR PDF FILE:"),
        React.createElement("input", {
          type: "file",
          id: "pdfFile",
          accept: ".pdf",
          onChange: handleFileChange
        }),

        React.createElement("label", { htmlFor: "apiKey" }, "GEMINI API KEY:"),
        React.createElement("input", {
          type: "text",
          id: "apiKey",
          value: apiKey,
          onChange: handleApiKeyChange,
          placeholder: "Enter your Google Gemini API key here"
        }),

        React.createElement(
          "button",
          {
            type: "submit",
            disabled: loading
          },
          loading ? 'ANALYZING...' : 'ANALYZE NOW!'
        ),

        loading && React.createElement(
          React.Fragment,
          null,
          React.createElement("p", null, "Connecting to neural network..."),
          React.createElement(
            "div",
            { className: "progress-container" },
            React.createElement("div", {
              className: "progress-bar",
              style: { width: `${progress}%` }
            })
          ),
          React.createElement(ModemAnimation, { active: loading })
        )
      )
    ),

    error && React.createElement(
      "div",
      { className: "error-message" },
      React.createElement("strong", null, "ERROR:"),
      " ",
      error
    ),

    results && React.createElement(
      Window,
      { title: "Analysis_Results.txt" },
      React.createElement(
        "div",
        { className: "results" },
        React.createElement("h3", { className: "section-title" }, "EXECUTIVE SUMMARY"),
        React.createElement("div", { style: { whiteSpace: 'pre-line' } }, results.summary),

        React.createElement("h3", { className: "section-title" }, "KEY POINTS"),
        React.createElement(
          "div",
          null,
          results.keyPoints.map((point, index) =>
            React.createElement("div", { key: index, className: "key-point" }, point)
          )
        ),

        React.createElement("h3", { className: "section-title" }, "DETAILED ANALYSIS"),
        React.createElement("div", { style: { whiteSpace: 'pre-line' } }, results.detailedAnalysis),

        React.createElement("h3", { className: "section-title" }, "RECOMMENDATIONS"),
        React.createElement("div", { style: { whiteSpace: 'pre-line' } }, results.recommendations)
      )
    )
  );
}

// Initialize the React app
document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    React.createElement(App, null),
    document.getElementById('app')
  );
});
