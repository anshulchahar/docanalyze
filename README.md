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

## Getting Started

### Prerequisites

* Python 3.7+
* Google Gemini API key

### Installation

1.  Clone the repository:

    ```bash
    git clone [https://github.com/anshulchahar/docanalyze.git](https://github.com/anshulchahar/docanalyze.git)
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
    [http://127.0.0.1:5000/](http://127.0.0.1:5000/)
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