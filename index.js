import dotenv from "dotenv"
import express from 'express';
import { app } from './app.js'
import cors from 'cors';
import connectDB from "./connectDB.js";

// Load environment variables
dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB()
    .then(() => {
        // Add error handling for the server
        const server = app.listen(PORT, () => {
            console.log(`⚙️ Server is running at port: ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Handle server errors
        server.on('error', (err) => {
            console.error('❌ Server error:', err);
            if (err.code === 'EACCES') {
                console.error(`❌ Permission denied on port ${PORT}. Try using a different port.`);
            } else if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use. Try a different port.`);
            }
            process.exit(1);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('👋 SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('💤 Process terminated');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('👋 SIGINT received, shutting down gracefully');
            server.close(() => {
                console.log('💤 Process terminated');
                process.exit(0);
            });
        });
    })
    .catch((err) => {
        console.log("❌ MONGO db connection failed !!! ", err);
        process.exit(1);
    })