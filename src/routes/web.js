import express from "express";
import homeController from "../controllers/homeController"
let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", homeController.getHomePage);
    //set up get started button, whitelisted domain
    router.post("/setup-profile", homeController.setupProfile);
    //setup persistent menu
    router.post("/setup-persistent-menu", homeController.setupPersistentMenu);
    router.get("/webhook", homeController.getWebhook);
    router.post("/webhook", homeController.postWebhook);
    return app.use("/", router);
}

module.exports = initWebRoutes;