import { Server as HTTPServer } from "http";
import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: HTTPServer) => {
    io = new Server(server, {
        cors: {
            origin: [
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "http://127.0.0.1:5501",
                "http://localhost:5501",
            ],
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};