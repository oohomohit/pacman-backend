import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import routes from "./routes.js";

const app = express()

// const corsOptions = {
  
// };

app.use(cors({origin: [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_GIT_URL,
    process.env.CORS_ORIGIN,
    `http://localhost:3000`
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser());

app.use("/", routes);


export { app };