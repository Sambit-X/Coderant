const express = require('express')
const cors = require('cors')
const { execJava } = require('./code.js');

const io = require('socket.io')(3000, {
  cors: {
    header: ["http://localhost:3000"]
  }
})

const app = express()
app.use(cors());

const rooms = {};

io.on('connection', async socket => {
  
  console.log(`User connected: ${socket.id}`);
  // Handle joining a random room
  socket.on('joinRandomRoom', () => {
    let roomToJoin = findOrCreateRoom();
    // Join the room
    socket.join(roomToJoin.id);
    console.log(`Socket ${socket.id} joined room ${roomToJoin.id}`);
    // Emit 'roomFull' event if the room is full
    if (roomToJoin.isFull) {
      
      const a = Math.floor(Math.random() * 10);
      const b = Math.floor(Math.random() * 10);
      correctAnswer = a + b;
      roomToJoin.question=`Write a function to find the sum of ${a} and ${b}.`
      roomToJoin.answer=correctAnswer;
      io.to(roomToJoin.id).emit('status',{body: "Match Started", question:roomToJoin.question});
    }
    else{
      io.to(roomToJoin.id).emit('status',{body: "Finding Players"});
    }

    socket.on("runAnswer", (answer,language) => {
      if(language=="java"){
        execJava(answer)
        .then(output => {
          io.to(socket.id).emit('showOutput', output);
        })
      }
      
    });

    socket.on("submitAnswer", (answer, language) => {
      const room = rooms[roomToJoin.id];
      if (!room || room.winnerDeclared) return;
      if(language=="java"){
        execJava(answer)
        .then(output => {
          console.log(output.trim(),typeof(output.trim())," ",room.answer,typeof(room.answer))
          if (output.trim()== room.answer) {
            
            io.to(socket.id).emit('result', 'You win!',1);
            room.players.forEach(playerId => {
              if (playerId !== socket.id) {
                io.to(playerId).emit('result', 'You lose!',0);
              }
            });
            room.winner = socket.id; // Declare the winner
          } else {
            socket.emit('result', 'Wrong answer, try again!',2);
          }
        })
      }
      

      console.log(room);
    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);

      // Remove the user from the room they were in
      const room = rooms[roomToJoin.id];
      const temp = JSON.parse(JSON.stringify(room));

      if (room) {
        const index = room.players.indexOf(socket.id);
        if (index !== -1) {
          room.players.splice(index, 1);
          
          // Notify the other player if opponent has left
          if (room.players.length > 0) {
            socket.to(roomToJoin.id).emit('result',"Opponent Player Disconnected. You Win.");
            temp.winner = roomToJoin.players[0];
          } else {
            // Delete the room if no players are left
            delete rooms[roomToJoin.id];
            console.log(`Room ${roomToJoin.id} deleted`);
          }
        }
      }
      console.log(temp);
    });
  });

  // Function to find or create a new room
  function findOrCreateRoom() {
    // Look for an available room
    let roomToJoin = Object.values(rooms).find(room => !room.isFull);

    // If no available room, create a new one
    if (!roomToJoin) {
      const roomId = generateRoomId();
      roomToJoin = {
        createdAt: new Date().toISOString(),
        id: roomId,
        players: [],
        question: "",
        answer: "",
        isFull: false,
        winner:""
      };
      rooms[roomId] = roomToJoin;
    }

    // Add the current socket to the room
    roomToJoin.players.push(socket.id);

    // Check if room becomes full
    if (roomToJoin.players.length === 2) {
      roomToJoin.isFull = true;
    }

    return roomToJoin;
  }

  // Function to generate a unique room ID (simple example)
  function generateRoomId() {
    return Math.random().toString(36).substr(2, 9); // Example of generating random room ID
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(8080, () => {
  console.log(`Server on http://localhost:8080`)
})