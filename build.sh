#!/bin/bash
# build.sh — builds frontend then starts backend
# Used by Render to deploy everything as one service

echo "📦 Installing frontend dependencies..."
cd frontend
npm install

echo "🔨 Building React frontend..."
npm run build

echo "✅ Frontend built!"
cd ..

echo "🐍 Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "🚀 Starting server..."
uvicorn main:app --host 0.0.0.0 --port $PORT
