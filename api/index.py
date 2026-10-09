from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        response_data = {
            "status": "healthy",
            "portal": "Coimbatore CityConnect Smart City API",
            "path": self.path
        }
        self.wfile.write(json.dumps(response_data).encode('utf-8'))
        return
