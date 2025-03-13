from setuptools import setup, find_packages

setup(
    name="docanalyze",
    version="0.1.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "flask",
        "pypdf>=4.0.0",  # Updated from PyPDF2
        "google-generativeai",
    ],
)