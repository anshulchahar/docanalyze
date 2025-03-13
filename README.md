# DocAnalyze

A retro-themed PDF document analysis tool powered by Google's Gemini AI.

## Overview

DocAnalyze transforms your PDF documents into structured insights using artificial intelligence. Upload your PDF, and the application will analyze the content to provide:

* Concise executive summary
* Key takeaway points
* Detailed topical analysis
* Actionable recommendations

All presented in a nostalgic 90s-style user interface that brings a fun twist to document analysis.

## Features

* **PDF Text Extraction:** Automatically extracts text content from uploaded PDFs
* **AI-Powered Analysis:** Uses Google's Gemini 1.5 Pro to generate comprehensive document analysis
* **Structured Output:** Presents information in well-organized sections for easy consumption
* **Retro UI:** Enjoy a throwback to the 90s computing era with the vintage interface
* **CI/CD Pipeline:** Automated testing and deployment with GitHub Actions

## Getting Started

### Prerequisites

* Python 3.7+
* Google Gemini API key

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/anshulchahar/docanalyze.git
    cd docanalyze
    ```

2.  Install the required dependencies:

    ```bash
    pip install -r requirements.txt
    ```

3.  Run the Flask application:

    ```bash
    python app.py
    ```

4.  Open your browser and navigate to:

    ```
    http://127.0.0.1:5000/
    ```

### Usage

1.  Open the application in your web browser.
2.  Upload your PDF document using the file selector.
3.  Enter your Google Gemini API key.
4.  Click "ANALYZE NOW!" and wait for the processing to complete.
5.  Review the structured analysis results.

## Technologies Used

* **Backend:** Python, Flask
* **Frontend:** HTML, CSS, React (no build tools)
* **PDF Processing:** PyPDF2
* **AI Analysis:** Google Generative AI (Gemini)
* **CI/CD:** GitHub Actions
* **Code Quality:** Flake8, ESLint, pre-commit hooks

## Development

### Code Quality Tools

This project uses several code quality tools to maintain consistent standards:

#### Linting

- **Python:** Flake8 is used to ensure Python code follows PEP 8 style guidelines
- **JavaScript:** ESLint checks JavaScript code quality

To run linting manually:

```bash
# For Python
flake8 .

# For JavaScript
npm run lint
```

#### Pre-commit Hooks

Pre-commit hooks automatically check code quality before each commit. To set up:

1. Install pre-commit:
   ```bash
   pip install pre-commit
   ```

2. Install the git hooks:
   ```bash
   pre-commit install
   ```

Now, each time you commit, the hooks will run to verify your changes meet the project's quality standards.

## Continuous Integration

This project uses GitHub Actions for continuous integration. The workflow:
- Runs on every push to the main branch and pull requests
- Sets up Python and Node.js environments
- Installs dependencies
- Lints Python code with flake8
- Lints JavaScript with ESLint
- Ready for automated testing when tests are added

You can see the workflow configuration in `.github/workflows/ci.yml`.

## Development Setup

### Setting up the development environment

1. Clone the repository:
   ```bash
   git clone https://github.com/anshulchahar/docanalyze.git
   cd docanalyze
   ```

2. Set up a virtual environment:
   ```bash
   # Create a virtual environment
   python -m venv venv
   
   # Activate it (macOS/Linux)
   source venv/bin/activate
   
   # Or on Windows
   venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Install Node.js dependencies
   npm install
   ```

4. Run the application:
   ```bash
   python app.py
   ```

5. Access the application at http://127.0.0.1:5000/

### Quick setup (macOS/Linux)
Alternatively, use the provided setup script:
```bash
./setup.sh
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Acknowledgments

* Google Generative AI for powering the document analysis
* Inspired by the aesthetic of 90s computing