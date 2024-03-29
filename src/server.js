require("dotenv").config();
import express from "express";
import bodyParser from "body-parser";
import configViewEngine from "./config/viewEngine";
import initWebRoutes from "./routes/web";

let app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//config view engine
configViewEngine(app);
//config web route
initWebRoutes(app);


let port = process.env.PORT || 3030;

app.listen(port, () => {
    console.log("App is running at the port: " + port);
})