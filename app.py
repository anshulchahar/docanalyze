"""
DocAnalyze - Main application entry point
"""
import os
from docanalyze import create_app

# Create the Flask application instance
app = create_app(os.environ.get('FLASK_ENV', 'default'))

@app.cli.command()
def test():
    """Run the unit tests."""
    import unittest
    tests = unittest.TestLoader().discover('tests')
    unittest.TextTestRunner(verbosity=2).run(tests)

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'])
