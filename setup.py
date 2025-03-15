from setuptools import setup, find_packages

setup(
    name="docanalyze",
    version="0.1.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "flask>=2.3.3",
        "pypdf>=4.0.1",
        "google-generativeai>=0.3.0",
        "python-dotenv>=1.0.0",
    ],
    extras_require={
        'dev': [
            'pytest>=7.0.0',
            'pytest-cov>=4.0.0',
            'flake8>=6.0.0',
            'pre-commit>=3.3.2',
        ],
        'docs': [
            'mkdocs>=1.5.3',
            'mkdocs-material>=9.4.6',
            'pymdown-extensions>=10.3',
            'mkdocstrings>=0.23.0',
            'mkdocstrings-python>=1.7.3',
        ],
    },
    python_requires='>=3.9',
    entry_points={
        'console_scripts': [
            'docanalyze=app:app',  # Updated to use the root app.py
        ],
    },
    author="Anshul Chahar",
    author_email="",
    description="A document analysis tool powered by Google's Gemini AI",
    long_description=open('README.md').read(),
    long_description_content_type="text/markdown",
    url="https://github.com/anshulchahar/docanalyze",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
    ],
)