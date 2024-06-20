import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { MongoClient } from 'mongodb';
import 'dotenv/config'

const app = express();

//Middlewares
app.use(express.json());
app.use(cors())


//Mongo DB Connection
const uri="mongodb+srv://sambitmondal02:JDLR8Q3ZIqKR8GLt@cluster0.zuxdug7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const client = new MongoClient(uri);
client.connect(() => {
    console.log("MongoDB Connection Success!");
});

const dbname = 'authorizer'
const db = client.db(dbname);
const collection = db.collection('users');

//Socket Server
const server = createServer(app)
const io = new Server(server, {
    cors: {
        header: "https://coderant.onrender.com"
    }
});

const connectedUsers_clerk = [];
const connectedUsers = [];
var correctAnswer = 0;
var c = 0;

io.on('connection', async (socket) => {
    console.log('A client connected');

    socket.on('user', (msg) => {

        
        connectedUsers[c] = socket.id;

        if(connectedUsers_clerk.includes(msg.clerk_id)){
            console.log("Same User trying to connect")
            
        }
        else{
            connectedUsers[c] = socket.id;
            connectedUsers_clerk[c] = msg.clerk_id;

        c = c + 1;
        console.log('No of Users Connected : ', c);
        console.log("Users : ", connectedUsers)
        console.log("Clerk Users : ", connectedUsers_clerk)

        if (c < 2) {
            io.emit("Game Status", "Waiting for Players");
        }
        if (c == 2) {
            const a = Math.floor(Math.random() * 10);
            const b = Math.floor(Math.random() * 10);
            correctAnswer = a + b;
            io.emit("Game Status", {
                status: "Game Starting",
                question: "What is " + a + "+" + b + "?",
            });

        }
        socket.on("Submit Answer", (answer, userId) => {
            if (answer == correctAnswer) {
                io.to(userId).emit("Game Result", "win");
                console.log(userId, " Win");
                for (var i = 0; i < 2; i++) {
                    if (connectedUsers[i] != userId) {
                        console.log(connectedUsers[i], " Lost");
                        io.to(connectedUsers[i]).emit("Game Result", "lost");
                    }
                }
            }
        });
        socket.on('disconnect', () => {
            connectedUsers_clerk.splice(0, connectedUsers_clerk.length);;
            connectedUsers.splice(0, connectedUsers.length);;
            io.emit(c = c - 1);
            console.log('user disconnected');
        });
    }

    });
    socket.on('disconnect', () => {
        
        console.log('user disconnected');
    });



});




app.post('/signup', async (req, res) => {
    const { clerk_id, username, score } = req.body;
    const find = await collection.findOne({ clerk_id });
    if (find) {
        console.log("Existing User Signed Up", find)
    }
    else {
        req.body.score = 0;
        await collection.insertOne(req.body);
        console.log("New User Signed Up! User Added to Database", req.body)
    }
})


//Listening to Server
const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log(`Socket Server at : http://localhost:5000`)
})
