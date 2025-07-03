#!/usr/bin/env python3
"""
Simple script to run the Flask backend server
"""

if __name__ == '__main__':
    from app import app
    print("Starting Hunt Console Backend...")
    print("API will be available at: http://localhost:5000")
    print("Health check: http://localhost:5000/api/health")
    app.run(debug=True, host='0.0.0.0', port=5000)