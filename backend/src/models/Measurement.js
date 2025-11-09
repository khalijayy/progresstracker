import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'segmenting', 'completed', 'failed'],
    default: 'pending'
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  weight: Number,
  images: [{
    type: String  // URLs to the stored images
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Measurement = mongoose.model('Measurement', measurementSchema);

export default Measurement;