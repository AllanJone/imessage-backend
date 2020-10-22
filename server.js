// Import
import express from 'express'
import mongoose from 'mongoose'
import pusher from 'pusher'
import cors from 'cors'

import mongoData from './mongoData.js'

// App Config
const app = express()
const port = process.env.port || 9000

// Middlewares
app.use(cors())
app.use(express.json())

//Db Config
const mongoURI = 'mongodb+srv://admin:41qElIJOV3849Bk5@cluster0.pkv8n.mongodb.net/imessageDB?retryWrites=true&w=majority';

mongoose.connect(mongoURI,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

mongoose.connection.once('open',()=>{
    console.log('DB Connected')
})

//API Routes
app.get('/',(req,res)=>res.status(200).send('Hello World!'))

//Listen
app.listen(port,()=>console.log(`Listening on localhost:${port}`))