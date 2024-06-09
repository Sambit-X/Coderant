import express from 'express';
import { createServer } from 'http';
import cors from 'cors'
import { Server } from 'socket.io';

const app = express();
app.use(express.json());
app.use(cors())

const server = createServer(app)
const io = new Server(server,{
    cors:{
        header:"https://coderant.onrender.com"
    }
});

const connectedUsers = [];
var correctAnswer=0;
var c =0;
io.on('connection', (socket) => {
    connectedUsers[c] = socket.id;
    c=c+1;
    console.log('No of Users Connected : ',c);
    console.log("Users : ",connectedUsers)
    
    if(c<2){
        io.emit("Game Status","Waiting for Players");
    }
    if(c==2){
        const a = Math.floor(Math.random() * 10);
        const b = Math.floor(Math.random() * 10);
        correctAnswer=a+b;
        io.emit("Game Status",{
            status: "Game Starting",
            question: "What is "+a+"+"+b+"?",
        });
        
    }
    socket.on("Submit Answer", (answer,userId) => {
        if (answer == correctAnswer) {
            io.to(userId).emit("Game Result", "win");
            console.log(userId," Win");
            for(var i=0;i<2;i++){
                if(connectedUsers[i]!=userId){
                    console.log(connectedUsers[i]," Lost");
                    io.to(connectedUsers[i]).emit("Game Result", "lost");
                }
            }
        }
    });

    socket.on('disconnect', () => {
        io.emit(c=c-1);
        console.log('user disconnected');
    });
});

server.listen(5000, () => {
    console.log(`Socket Server at : http://localhost:5000`)
})
