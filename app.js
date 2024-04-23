const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const amqp = require('amqplib');
const SensorData = require('./models/SensorData');
const WebSocket = require('ws');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


let wsClient;


const wss = new WebSocket.Server({ port: 3002 });

wss.on('connection', (ws) => {
    console.log('Client connected');
    wsClient = ws;

    ws.on('close', () => {
        console.log('Client disconnected');
        wsClient = null;
    });
});


const sendDataToFrontend = (data) => {
    // console.log(wsClient)
    if (wsClient) {
        wsClient.send(JSON.stringify(data));
    }
};


const consumeFromQueue = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'sensor_data';

        await channel.assertQueue(queue, { durable: false });

        channel.consume(queue, async (msg) => {
            const sensorData = JSON.parse(msg.content.toString());
            await SensorData.create(sensorData);

        
            sendDataToFrontend(sensorData);

            channel.ack(msg);
        });
    } catch (error) {
        console.error('Error consuming data from queue:', error);
    }
};

consumeFromQueue()

module.exports = { app, wss };
