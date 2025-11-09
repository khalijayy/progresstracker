import Measurement from "../models/Measurement.js";
import axios from "axios"; // For calling Raspberry Pi API

export const getMeasurements = async (req, res) => {
  const measurements = await Measurement.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(measurements);
};

export const createMeasurement = async (req, res) => {
  const measurement = new Measurement({ user: req.user._id });
  await measurement.save();
  res.status(201).json(measurement);
};

export const runSegmentation = async (req, res) => {
  const { id } = req.params;
  const measurement = await Measurement.findById(id);
  if (!measurement) return res.status(404).json({ message: "Measurement not found" });

  measurement.status = "segmenting";
  await measurement.save();

  // Trigger Raspberry Pi (replace with your API endpoint)
  try {
    const response = await axios.post("http://your-raspberry-pi-ip:port/run-segmentation", { measurementId: id });
    // Assume Raspberry Pi responds with dimensions, images, etc.
    measurement.dimensions = response.data.dimensions;
    measurement.weight = response.data.weight;
    measurement.images = response.data.images; // Array of URLs
    measurement.status = "completed";
    await measurement.save();
    res.json(measurement);
  } catch (error) {
    measurement.status = "failed";
    await measurement.save();
    res.status(500).json({ message: "Segmentation failed" });
  }
};

// Add more: getMeasurementById, update, delete, generateDieline, etc.