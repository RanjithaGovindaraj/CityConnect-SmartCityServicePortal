import sys
import os

# Include parent directory in python path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend_server import app

# Export wsgi app and handler for Vercel Serverless Function
app.debug = False
handler = app
