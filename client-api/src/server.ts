import http from "http";
import app from "./app";
import dotenv from "dotenv";
import { initSocket } from "./sockets/socket";
import { startScrapers } from "./scrapers/scheduler";

// Load environment variables
dotenv.config();

// Create HTTP server using Express app
const server = http.createServer(app);

// initialize Socket.IO
initSocket(server);



// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Start scrapers
  startScrapers();
});