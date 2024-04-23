const {app}=require('./app')
const mongoose=require('mongoose')

mongoose.connect('mongodb://localhost:27017/x').then(() => {
    console.log("Connected to MongoDB");
}).catch(err => console.error("MongoDB connection error:", err));


app.listen(3001,()=>{
    console.log("server has been connected")
})