const WebSocket = require('websocket').server;
const http = require('http');

const server = http.createServer((request, response) => {
  // Handle HTTP requests here
});

const webSocketServer = new WebSocket({
  httpServer: server,
});

webSocketServer.on('request', (request) => {
  const connection = request.accept(null, request.origin);

  connection.on('message', (message) => {
    // Handle incoming WebSocket messages here
  });

  connection.on('close', (reasonCode, description) => {
    // Handle WebSocket connection closure here
  });
});

server.listen(3001, () => {
  console.log('WebSocket server is listening on port 3001');
});