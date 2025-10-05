We can quickly run a y-websocket server using the command below. This will start a server on port 1234.

Method 1: Run via npm
```bash
npm install
set HOST=localhost
set PORT=1234 
npx y-websocket
```

Method 2: Run via Docker image
running this docker image directly will start the y-websocket server
```bash
docker run -p 1234:1234 alokinplc/y-websocket:latest
```
