import express from "express";
import { getMeasurements, createMeasurement, runSegmentation } from "../controllers/measurementsController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticate); // Protect all routes
router.get("/", getMeasurements);
router.post("/", createMeasurement);
router.post("/:id/run", runSegmentation);
// Add more routes as needed

export default router;