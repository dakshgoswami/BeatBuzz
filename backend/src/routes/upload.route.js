import express from "express";
import  uploadFile  from "../controller/upload.controller.js";  // Import uploadFile controller
import  io  from "../lib/socket.js";  // Import io instance

const router = express.Router();

router.post("/", uploadFile(io));  // Pass io to uploadFile

export default router;
