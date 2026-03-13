import { Server } from "socket.io";

let io: Server;

/*
Initialize Socket.IO
This runs once when the server starts
*/
export const initSocket = (server: any) => {
    io = new Server(server, {
        cors: {
        origin: "*"
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
};

/*
Access the existing Socket.IO instance
*/
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};