import express from "express"
import dotenv from "dotenv";
import  connectDb   from "./config/db.js";
import cookieParser from "cookie-parser";
import { notFound, globalErrorHandler } from "./middleware/errorMiddleware.js";
import mainRoute from "./routes/mainRoute.js";
import "./models/userModels.js";
import "./models/doctorModels.js";   // 👈 VERY IMPORTANT
import "./models/healthRecord.js";
import "./models/consultantModel.js";

dotenv.config();
connectDb();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended : true}));

app.use("/api",mainRoute);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
