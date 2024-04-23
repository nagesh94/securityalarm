const { random } = require("lodash")
const amqp = require("amqplib")

const generateSensorData = () => {
  const towerId = "t123" 
  const location = { lat: random(-90, 90,true), long: random(-180, 180,true) }
  const temperature = random(0, 50) 
  const powerSource = random() > 0.5 ? "DG" : "Electric"
  const fuelStatus = random(0, 100) 
  const timestamp=new Date()

  const anomaly = checkAnomaly(
    (data = { temperature, powerSource, fuelStatus,timestamp })
  )

  return {
    towerId,
    location,
    temperature,
    powerSource,
    fuelStatus,
    anomaly,
    timestamp,
  }
}

let dgStartTime = null
let dgDuration = 0

const checkAnomaly = (data) => {
  let anamolies = { status: false,fuelStatus:'normal',temprature:'normal',powerSource:"normal" }
  if (data.temperature > 45) {
   
    anamolies.status = true
    anamolies.temperature = data.temperature
  }
  if (data.fuelStatus < 20) {
  
    anamolies.status = true
    anamolies.fuelStatus = data.fuelStatus
   
  }
  console.log(dgStartTime)
  if (data.powerSource =="DG") {
    if (!dgStartTime) {
      dgStartTime = data.timestamp
    } else {
      const dgDuration = (data.timestamp - dgStartTime) / (1000*60*60)
      if (dgDuration >= 2) {
        anamolies.status = true
        anamolies.powerSource= "DG for 2 hours"
      }
    }
  } else {
    dgStartTime = null 
    dgDuration = 0 
  }
  return anamolies
}
console.log("heerer")
const publishToQueue = async () => {
  const connection = await amqp.connect("amqp://localhost")
  const channel = await connection.createChannel()
  const queue = "sensor_data"

  setInterval(() => {
    const sensorData = generateSensorData()
    console.log(JSON.stringify(sensorData))
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(sensorData)))
  }, 5000)
}

publishToQueue()
