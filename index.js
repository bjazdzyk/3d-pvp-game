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
const SPACE = 'Space'


app.set('port', (process.env.PORT || 8080));

app.use(express.static('public'));


const playersData = {}

const arenaSize = 45
const arenaCollisionOffset = 1
const punchOffset = 2
const punchRadius = 1.3
const shieldDamageAbsorption = 0.8

io.on('connection', (socket) => {
  playersData[socket.id] = {keys:{}, currentAction:"Idle", position:{x:0, y:0, z:0}, walkDirection:{x:0, y:0, z:-1}, runVelocity:0.15 , maxHp:200, hp:200, lockAction:false, damage: 40, alive:true, punchTimeStamp:0, shieldTimeStamp:0, jumpTimeStamp:0, punchedTimeStamp:0}

  socket.emit('arenaSize', arenaSize)


  socket.on('requestUpdate', (Data)=>{
    if(playersData[socket.id].alive){
      const keys = Data[0]

      playersData[socket.id].keys = keys

      const dirPressed = (keys[W] || keys[S] || keys[A] || keys[D])
      const spacePressed = (keys[SPACE])
      const mouseLeftPressed = (!!playersData[socket.id].keys[MOUSEL])
      const mouseRightPressed = (!!playersData[socket.id].keys[MOUSER])


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
    }

    

    io.emit("Data", [playersData])
    
  })

  socket.on('disconnect', () => {
    playersData[socket.id] = "disconnected"
  });
});









const loop = setInterval(()=>{

  for(let i in playersData){
    if(playersData[i] != "disconnected"){
      if(playersData[i].alive){
        
        if(Date.now() - playersData[i].punchedTimeStamp <= 300){
          playersData[i].currentAction = 'Punched'

          if(!playersData[i].lockAction){
            io.emit("Data", [playersData])
          }
          playersData[i].lockAction = true


        }else if(Date.now() - playersData[i].shieldTimeStamp <= 200){
          playersData[i].currentAction = 'ShieldProtect'

          if(!playersData[i].lockAction){
            io.emit("Data", [playersData])
          }
          playersData[i].lockAction = true


        }else if(Date.now() - playersData[i].jumpTimeStamp <= 600){
          playersData[i].currentAction = 'Jump'

          if(!playersData[i].lockAction){
            io.emit("Data", [playersData])
          }
          playersData[i].lockAction = true
        }else if(Date.now() - playersData[i].punchTimeStamp <= 600){
          //console.log("lock")

          playersData[i].currentAction = 'Punch'

          if(!playersData[i].lockAction){
            io.emit("Data", [playersData])
          }
          playersData[i].lockAction = true
          if(Math.floor((Date.now() - playersData[i].punchTimeStamp)/20) == 17){
            const playerData = playersData[i]
            const x = playerData.walkDirection.x
            const z = playerData.walkDirection.z

            const newX = punchOffset/Math.sqrt(x*x + z*z)*x
            const newZ = punchOffset/Math.sqrt(x*x + z*z)*z


            for(let j in playersData){
              if(i!=j && playersData[j].position){
                const dX  = Math.abs(playersData[j].position.x - (playerData.position.x+newX))
                const dY  = Math.abs(playersData[j].position.y - 0)
                const dZ  = Math.abs(playersData[j].position.z - (playerData.position.z+newZ))

                const d = Math.sqrt(dY*dY + Math.sqrt(dX*dX + dZ*dZ))
                //console.log(d)
                if(d < punchRadius){
                  //io.sockets.sockets.get(j)
                  //j-ofiara i-atacker

                  io.emit('pointDamage', {id:i, x:playerData.position.x+newX, y:0, z:playerData.position.z+newZ, punchRadius})

                  if(playersData[j].currentAction == 'ShieldIdle'){
                    playersData[j].hp -= playersData[i].damage*(1 - shieldDamageAbsorption)
                    playersData[j].shieldTimeStamp = Date.now()
                  }else{
                    playersData[j].hp -= playersData[i].damage
                    playersData[j].punchedTimeStamp = Date.now()
                    
                  }
                  if(playersData[j].hp<=0){
                    playersData[j].alive = false
                    playersData[j].currentAction = "Death"
                  }
                  io.emit("Data", [playersData])
                }
              }
            }
          }
        }else{
          

          const keys = playersData[i].keys

          const dirPressed = (keys[W] || keys[S] || keys[A] || keys[D])
          const spacePressed = (keys[SPACE])
          const mouseLeftPressed = (!!playersData[i].keys[MOUSEL])
          const mouseRightPressed = (!!playersData[i].keys[MOUSER])

          let play = ''
          if(spacePressed){
            play = 'Jump'
          }else{
            if(mouseRightPressed){
              play = 'Idle'
            }else{
              if(mouseLeftPressed){
                play = 'Punch'
              }else{
                if(dirPressed){
                  play = 'Run'
                }else{
                  play = 'ShieldIdle'
                }
              }
            }
          }
          
          if(playersData[i].lockAction && playersData[i].currentAction == 'Punched'){
            play = 'Punched'
          }else if(playersData[i].lockAction && playersData[i].currentAction == 'ShieldProtect'){
            play = 'ShieldProtect'
          }else if(!playersData[i].lockAction && play == 'Jump'){
            playersData[i].jumpTimeStamp = Date.now()
          }else if(!playersData[i].lockAction && play == 'Punch'){
            playersData[i].punchTimeStamp = Date.now()
          }

          if(playersData[i].currentAction != play){
            playersData[i].currentAction = play
            io.emit("Data", [playersData])
          }
          playersData[i].currentAction = play
          playersData[i].lockAction = false
        }

        const keys = playersData[i].keys
        const dirPressed = (keys[W] || keys[S] || keys[A] || keys[D])

        if(dirPressed && (playersData[i].currentAction == "Run" || playersData[i].currentAction == "Jump")){

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
  }
}, 20)



server.listen(app.get('port'), function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Running on port: ' + app.get('port')); }
});