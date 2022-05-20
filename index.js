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

const arenaSize = 45
const arenaCollisionOffset = 1
const punchOffset = 2

io.on('connection', (socket) => {
  playersData[socket.id] = {keys:{}, currentAction:"Idle", position:{x:0, y:0, z:0}, walkDirection:{x:0, y:0, z:0}, runVelocity:0.1 , hp:100}

  socket.emit('arenaSize', arenaSize)

  socket.on('punch', (Data)=>{
    const playerData = playersData[socket.id]
    //console.log(playerData.position.x+playerData.walkDirection.x, playerData.position.z+playerData.walkDirection.z)
    const x = playerData.walkDirection.x
    const z = playerData.walkDirection.z

    const newX = punchOffset/Math.sqrt(x*x + z*z)*x
    const newZ = punchOffset/Math.sqrt(x*x + z*z)*z
    io.emit('pointDamage', {x:playerData.position.x+newX, z:playerData.position.z+newZ})
  })

  socket.on('requestUpdate', (Data)=>{

    const keys = Data[0]

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

    if(dirPressed){
      const dirX = Data[1]
      const dirZ = Data[2]

      const vectorLength = Math.sqrt(dirX*dirX + dirZ*dirZ)

      const newDirX = dirX / vectorLength * playersData[socket.id].runVelocity
      const newDirZ = dirZ / vectorLength * playersData[socket.id].runVelocity

      playersData[socket.id].walkDirection = {x:newDirX, y:0, z:newDirZ}
    }


    const rotation = Data[3]
    playersData[socket.id].rotation = rotation


    

    io.emit("Data", [playersData])
    
  })

  socket.on('disconnect', () => {
    playersData[socket.id] = "disconnected"
  });
});


const loop = setInterval(()=>{
  for(let i in playersData){
    if(playersData[i] != "disconnected"){
      if(playersData[i].currentAction == "Run"){

        if(playersData[i].walkDirection.x){
          if(Math.abs(playersData[i].position.x + playersData[i].walkDirection.x) < arenaSize/2-arenaCollisionOffset){
            playersData[i].position.x += playersData[i].walkDirection.x
          }

        }if(playersData[i].walkDirection.z){
          if(Math.abs(playersData[i].position.z + playersData[i].walkDirection.z) < arenaSize/2-arenaCollisionOffset){
            playersData[i].position.z += playersData[i].walkDirection.z
          }

        }
      }
    }
  }
}, 20)



server.listen(app.get('port'), function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Running on port: ' + app.get('port')); }
});