#!/bin/bash

API_PORT="5150"
PID=$(lsof -t -i :$API_PORT)
if [ -n "$PID" ]; then
    echo "Found existing process (PID: $PID) on port $API_PORT. Killing it..."
    kill "$PID"
    sleep 1
else
    echo "Port $API_PORT is clear."
fi

echo "--- Starting Backend Setup and Run (dotnet) ---"
cd api
dotnet restore
dotnet run

API_PID=$!

cd ..

echo "Waiting 3 seconds for API to start..."
sleep 3

echo "--- Starting Frontend Setup and Run (Vite) ---"

cd frontend
npm install
npm run dev

echo "Stopping background API process (PID: $API_PID)..."
kill $API_PID

echo "Script finished."