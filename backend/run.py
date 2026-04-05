# Library Management System
# Developed by Ahmed Youssef
# Copyright 2026 Ahmed Youssef. All rights reserved.

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
