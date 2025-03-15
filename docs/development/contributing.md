# Contributing to DocAnalyze

This guide provides information for developers who want to contribute to the DocAnalyze project.

## Development Environment Setup

### Prerequisites

- Python 3.9 or higher
- Node.js 14 or higher
- Git

### Setting Up the Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/docanalyze.git
   cd docanalyze
   ```

2. Set up the Python environment:
   ```bash
   # Create a virtual environment
   python -m venv venv

   # Activate the virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt
   ```

3. Set up the JavaScript environment:
   ```bash
   npm install
   ```

4. Configure environment variables:
   Create a `.env` file in the project root with the following content:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   FLASK_ENV=development
   DEBUG=True
   ```

## Development Workflow

### Running the Development Server

1. Start the Flask development server:
   ```bash
   python app.py
   ```
   The server will be accessible at http://localhost:5000

2. For frontend development with hot reload:
   ```bash
   npm run dev
   ```

### Code Style

This project follows:
- PEP 8 style guide for Python code
- Standard JS style for JavaScript code

We use pre-commit hooks to enforce code style. Install them with:
```bash
pre-commit install
```

### Submitting Changes

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them with descriptive commit messages:
   ```bash
   git commit -m "Add feature: description of your changes"
   ```

3. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request against the main repository's `main` branch

## Pull Request Guidelines

- Ensure all tests pass
- Update documentation for any changed functionality
- Include tests for new features
- Follow the existing code style
- Keep pull requests focused on a single concern

## Project Structure

```
docanalyze/
├── app.py                  # Flask application entry point
├── pdf_processor.py        # PDF processing functionality
├── gemini_api_handler.py   # Gemini API integration
├── static/                 # Static assets
│   ├── css/                # CSS stylesheets
│   └── js/                 # JavaScript files
├── templates/              # HTML templates
├── tests/                  # Test suite
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```