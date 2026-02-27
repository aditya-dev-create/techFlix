#!/bin/bash

# Kill existing processes on key ports
echo "Closing existing services..."
lsof -ti :8080,4000,8545,5432,6379 | xargs kill -9 2>/dev/null

# 1. Start Docker (DB & Redis)
echo "Starting Databases (Postgres & Redis)..."
cd backend && docker compose up -d db redis
cd ..

# 2. Start Blockchain Node
echo "Starting Local Blockchain (Hardhat)..."
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/blockchain && npx hardhat node"'

# 3. Start Backend API
echo "Starting Backend API..."
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/backend && npm run dev"'

# 4. Start Frontend
echo "Starting Frontend..."
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"' && npm run dev"'

echo "------------------------------------------------"
echo "Project is being hosted at:"
echo "Frontend: http://localhost:8080"
echo "Backend:  http://localhost:4000"
echo "Blockchain: http://127.0.0.1:8545"
echo "------------------------------------------------"
