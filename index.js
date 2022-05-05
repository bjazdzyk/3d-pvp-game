const express = require('express')
const path = require('path')
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


const W = 'KeyW'
const S = 'KeyS'
const A = 'KeyA'
const D = 'KeyD'
const MOUSEL = 'Mouse1'
const MOUSER = 'Mouse3'


app.set('port', (process.env.PORT || 8080));

app.use(express.static('public'));


const playersData = {}


io.on('connection', (socket) => {
  playersData[socket.id] = {keys:{}, currentAction:"Idle"}

  socket.on('requestUpdate', (keys)=>{

    playersData[socket.id].keys = keys

    const dirPressed = (keys[W] || keys[S] || keys[A] || keys[D])
    const mouseLeftPressed = (!!keys[MOUSEL])
    const mouseRightPressed = (!!keys[MOUSER])

    let play = ''
    if(mouseRightPressed){
      play = 'ShieldIdle'
    }else{
      if(mouseLeftPressed){
        play = 'Punch'
      }else{
        if(dirPressed){
          play = 'Run'
        }else{
          play = 'Idle'
        }
      }
    }

    playersData[socket.id].currentAction = play
    console.log(playersData)

    io.emit("Data", [socket.id, playersData])
  })

  socket.on('disconnect', () => {
    playersData[socket.id] = "disconnected"
    console.log('user disconnected');
  });
});


server.listen(app.get('port'), function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Running on port: ' + app.get('port')); }
});