import express from "express"
import cookieParser from "cookie-parser";
import routes from "./routes.js";

const app = express()

app.use(express.static("public"))
app.use(cookieParser());

app.use("/", routes);


export { app };