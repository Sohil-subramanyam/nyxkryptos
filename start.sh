#!/bin/bash

# Nyx Kryptos Quick Start Script
# This script helps you set up and run Nyx Kryptos locally

echo "🔐 Nyx Kryptos - Decentralized Steganographic Vault"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔑 Environment Setup"
echo "-------------------"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp -v .env.local.example .env.local 2>/dev/null || echo "NEXT_PUBLIC_APP_NAME=Nyx Kryptos
API_KEY=your_gemini_api_key_here" > .env.local
    echo "✅ Created .env.local"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🔗 Get Your Google Gemini API Key"
echo "--------------------------------"
echo "Visit: https://aistudio.google.com/app/apikey"
echo "Then edit .env.local and update API_KEY value"
echo ""

# Check if API_KEY is set
if grep -q "your_gemini_api_key_here" .env.local; then
    echo "⚠️  API_KEY not configured in .env.local"
    echo "Please add your Gemini API key before running the app"
    echo ""
fi

echo "🚀 Starting Development Server"
echo "-----------------------------"
echo "Server will run at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

exit 0
