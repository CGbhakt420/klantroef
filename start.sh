#!/bin/bash

echo "Starting Klantroef Media Streaming Platform..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo ".env file not found. Creating from template..."
    cp env.example .env
    echo ".env file created. Please edit it to set your JWT_SECRET."
    echo ""
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Start the server
echo "Starting server on port 3000..."
echo "Health check: http://localhost:3000/health"
echo "API documentation: See README.md"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm start
