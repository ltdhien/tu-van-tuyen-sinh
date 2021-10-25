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


let port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log("App is runing at the port: " + port);
})