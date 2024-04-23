const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    towerId: String,
    location: {
        lat: Number,
        long: Number
    },
    temperature: Number,
    powerSource: String,
    fuelStatus: Number,
    anomaly: Object,
    timestamp: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', sensorDataSchema);

module.exports = SensorData;
