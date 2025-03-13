from setuptools import setup, find_packages

setup(
    name="docanalyze",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        # Add your dependencies here
        "flask",
        "PyPDF2",  # Consider using "pypdf" instead due to deprecation warning
        "google-generativeai",
    ],
)