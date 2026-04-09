import express from "express"
import { config } from "dotenv";
import  { connectDb }  from "./config/db.js"

config();
connectDb;

const app = express();

app.use(express.json);
app.use(express.urlencoded.json);
app.use();

export default app
