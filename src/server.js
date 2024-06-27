import express from "express";
import "./config/db_mongoDB.js"
import "./config/db_mysql.js"
import router from "./router/index.js";
import cors from "cors";
import bodyParser from "body-parser";
import { PORT } from "./config/config.js";
import fileUpload from "express-fileupload";

const app = express();

app.use(cors());
app.use(fileUpload());

app.use(bodyParser.json({extended: true}))
app.use(bodyParser.urlencoded({extended: true,limit: "500mb",parameterLimit: 500}))
app.use("/api",router);
app.use("/api/upload",express.static("asstes"));
app.listen(PORT,()=>{
    console.log("Server running on http://localhost:3000");
})