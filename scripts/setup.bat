@echo off

echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
venv\Scripts\activate

echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo Installing Node.js dependencies...
npm install

echo Setup complete! Activate the virtual environment with: venv\Scripts\activate
pause