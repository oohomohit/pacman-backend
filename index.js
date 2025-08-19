import dotenv from "dotenv"
import express from 'express';
import { app } from './app.js'
import cors from 'cors';
import connectDB from "./connectDB.js";

// Load environment variables
dotenv.config({
    path: './.env'
})

// CORS configuration for Vercel
const corsOptions = {
  origin: [
    `http://localhost:${process.env.PORT || 5000}`,
    `${process.env.FRONTEND_URL}`, // Replace with your actual frontend URL
    // Add any other domains you need
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Essential middleware for POST requests
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Get port from environment or default to 5000
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