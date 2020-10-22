// Import
import express from 'express'
import mongoose, { mongo } from 'mongoose'
import pusher from 'pusher'
import cors from 'cors'

// App Config
const app = express()
const port = process.env.port || 9000

// Middlewares
app.use(cors())
app.use(express.json())

//Db Config
const mongoURI = '';

mongoose.connect(mongoURI,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

//API Routes
app.get('/',(req,res)=>res.status(200).send('Hello World!'))

//Listen
app.listen(port,()=>console.log(`'Listening on localhost:${port}`))