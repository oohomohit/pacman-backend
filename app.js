import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import routes from "./routes.js";

const app = express()

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true
    }
))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser());

app.use("/", routes);


export { app };