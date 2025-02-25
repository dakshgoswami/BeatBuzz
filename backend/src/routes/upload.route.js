import express from "express";
import uploadFile  from "../controller/upload.controller.js";

const router = express.Router();

// File upload route
router.post("/", uploadFile);

export default router;
