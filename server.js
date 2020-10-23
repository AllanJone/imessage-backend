// Import
import express from 'express'
import mongoose from 'mongoose'
import Pusher from 'pusher'
import cors from 'cors'

import mongoData from './mongoData.js'

// App Config
const app = express()

const pusher = new Pusher({
  appId: '1095567',
  key: '352ad8ab9793f4f53cc6',
  secret: '01613833a83b18b6abb7',
  cluster: 'ap3',
  encrypted: true
})

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

    const changeStream = mongoose.connection.collection('conversations').watch()

    changeStream.on('change',(change)=>{
        if(change.operationType === 'insert'){
            pusher.trigger('chats','newChat',{
                'change': change
            })
        }
        else if(change.operationType === 'update'){
            pusher.trigger('messages','newMessage',{
                'change':change
            })
        }
        else{
            console.log('Error Triggering Pusher')
        }
    })
})

//API Routes
app.get('/',(req,res)=>res.status(200).send('Hello World!'))

app.post('/new/conversation',(req,res)=>{
    const dbData = req.body

    mongoData.create(dbData,(err,data)=>{
        if(err){
            console.log('Error While Creating Message...')
            console.log(err)

            res.status(500).send(err)
        }
        else{
            res.status(201).send(data)
        }
    })
})

app.post('/new/message',(req,res)=>{
    mongoData.updateOne(
        {_id:req.query.id},
        {$push:{conversation:req.body}},
        (err,data)=>{
            if(err){
                console.log('Error Saving Message...')
                console.log(err)                

                res.status(500).send(err)
            }
            else{
                res.status(201).send(data)
            }
        }
    )
})

app.get('/get/conversationList',(req,res)=>{
    mongoData.find((err,data)=>{
        if(err){
            console.log('Error Getting Conversation List...')
            console.log(err) 

            res.status(500).send(err)
        }
        else{
            data.sort((b,a)=>{
                return a.timestamp - b.timestamp
            })

            let conversations = []

            data.map((conversationData)=>{
                const conversationInfo = {
                    id: conversationData._id,
                    name:conversationData.chatName,
                    timestamp: conversationData.conversation[0].timestamp
                }

                conversations.push(conversationInfo)
            })

            res.status(200).send(conversations)
        }
    })
})

app.get('/get/conversation',(req,res)=>{
    const id = req.query.id

    mongoData.find({_id:id},(err,data)=>{
        if(err){
            console.log(`Error Getting Conversation_${id}...`)
            console.log(err) 

            res.status(500).send(err)
        }
        else{
            res.status(200).send(data)
        }
    })
})

app.get('/get/lastMessage',(req,res)=>{
    const id = req.query.id

    mongoData.find({_id:id},(err,data)=>{
        if(err){
            console.log(`Error Getting LastMessage_${id}...`)
            console.log(err) 

            res.status(500).send(err)
        }
        else{
            let conversationData = data[0].conversation

            conversationData.sort((b,a)=>{
                return a.timestamp - b.timestamp
            })

            res.status(200).send(conversationData[0])
        }
    })
})

//Listen
app.set('port', process.env.PORT || 9000);
app.listen(app.get('port'), function () {
  console.log('Express server Listening on port ' + app.get('port'));
});