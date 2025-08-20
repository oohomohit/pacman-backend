import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import routes from "./routes.js";

const app = express()

const corsOptions = {
  origin: [
    // Your production frontend URL
    `${process.env.FRONTEND_URL}`,
    
    // Add any other Vercel URLs for your frontend
    `${process.env.FRONTEND_GIT_URL}`,

    process.env.CORS_ORIGIN,

    `http://localhost:${process.env.PORT || 3000}`
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser());

app.use("/", routes);


export { app };