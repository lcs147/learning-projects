
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
dotnet restore
dotnet run -- "Jwt:Key=ImUUqGjuzQACQciNEJydxXybdqotjKsH" # for learning