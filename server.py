#!/usr/bin/env python3
"""Simple static file server for the digital book"""

import http.server
import socketserver
import os
import mimetypes
from wsgiref.simple_server import make_server
from wsgiref.util import setup_testing_defaults
from wsgiref.simple_server import WSGIRequestHandler, WSGIServer
from wsgiref import util
import posixpath
import urllib.parse

PORT = int(os.environ.get('PORT', 3000))

class WSGIRequestHandler(WSGIRequestHandler):
    def address_string(self):
        # Disable reverse DNS lookups
        return self.client_address[0]

def application(environ, start_response):
    # Set up base environment
    setup_testing_defaults(environ)
    
    # Get the path from the URL
    path = environ.get('PATH_INFO', '').lstrip('/')
    
    # Map root to index.html
    if not path:
        path = 'index.html'
    
    # Get the absolute path to the content directory
    base_dir = os.path.abspath(os.path.dirname(__file__))
    
    # Handle /content/ prefix in the path
    if path.startswith('content/'):
        path = path[8:]  # Remove 'content/' prefix
    
    # Construct full path to the requested file
    full_path = os.path.abspath(os.path.join(base_dir, 'content', path))
    
    # Security check: prevent directory traversal
    try:
        # Normalize paths for comparison
        full_path = os.path.normpath(full_path)
        content_dir = os.path.normpath(os.path.join(base_dir, 'content'))
        
        # Ensure the file is within the content directory
        common_path = os.path.commonpath([full_path, content_dir])
        if common_path != content_dir:
            print(f'Security check failed: {full_path} is not in {content_dir}')
            start_response('403 Forbidden', [('Content-Type', 'text/plain')])
            return [b'403 Forbidden: Access denied']
    except ValueError as e:
        print(f'Path validation error: {e}')
        start_response('403 Forbidden', [('Content-Type', 'text/plain')])
        return [b'403 Forbidden: Invalid path']
    
    # Check if file exists
    if not os.path.isfile(full_path):
        start_response('404 Not Found', [('Content-Type', 'text/plain')])
        return [b'404 Not Found']
    
    # Determine MIME type
    mime_type, _ = mimetypes.guess_type(full_path)
    if mime_type is None:
        mime_type = 'application/octet-stream'
    
    # Read and return the file
    try:
        with open(full_path, 'rb') as f:
            file_data = f.read()
        
        headers = [
            ('Content-Type', mime_type),
            ('Access-Control-Allow-Origin', '*'),
            ('Access-Control-Allow-Methods', 'GET, OPTIONS'),
            ('Access-Control-Allow-Headers', 'Content-Type'),
        ]
        
        start_response('200 OK', headers)
        return [file_data]
    except Exception as e:
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        return [str(e).encode()]

# For Gunicorn
app = application

if __name__ == "__main__":
    # For local development
    with make_server('', PORT, app, handler_class=WSGIRequestHandler) as httpd:
        print(f"Serving on port {PORT}...")
        httpd.serve_forever()