@echo off
echo Starting TERRAS Backend Services...

start "Auth Service (Port 3001)" cmd /k "cd services\auth && npm run dev"
start "Room Service (Port 3002)" cmd /k "cd services\room && npm run dev"
start "Booking Service (Port 3003)" cmd /k "cd services\booking && npm run dev"

echo All services started!
echo Auth: http://localhost:3001
echo Room: http://localhost:3002
echo Booking: http://localhost:3003
pause
