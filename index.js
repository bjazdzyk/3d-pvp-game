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
const SHIFTL = 'ShiftLeft'


app.set('port', (process.env.PORT || 8080));

app.use(express.static('public'));


const playersData = {}

const arenaSize = 45
const arenaCollisionOffset = 1
const punchOffset = 2
const punchRadius = 1.3
const shieldDamageAbsorption = 0.8
const powerPunchDamageFactor = 1.5
const powerPunchRadius = 3

io.on('connection', (socket) => {
  socket.emit('con')
  socket.on('requestJoin', (Data)=>{

    const nick = Data.nick
    const skin = Data.skin
    console.log(`${nick} joined the game`)

    playersData[socket.id] = {
      nick:nick,
      skin:skin,
      keys:{},
      currentAction:"Idle",
      position:{x:0, y:0, z:0}, 
      walkDirection:{x:0, y:0, z:-1}, 
      velocity:{'Run':0.15, 'Jump':0.12, 'Dodge':0.18, 'DodgePunch':0.13}, 
      maxHp:200, 
      hp:200, 
      lockAction:false, 
      damage: 40, 
      alive:true, 
      punchTimeStamp:0, 
      shieldTimeStamp:0, 
      jumpTimeStamp:0, 
      punchedTimeStamp:0, 
      powerPunchedTimeStamp:0, 
      powerPunchTimeStamp:0, 
      dodgeTimeStamp:0,
      powerPunch: false, 
      dodgePunch: false,
      powerPunchDelay:9000
    }

    socket.emit('joined', playersData[socket.id].skin)
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

          const newDirX = dirX / vectorLength
          const newDirZ = dirZ / vectorLength

          playersData[socket.id].walkDirection = {x:newDirX, y:0, z:newDirZ}
        }


        const rotation = Data[3]
        playersData[socket.id].rotation = rotation
      }

      

      io.emit("Data", [playersData])
      
    })
  })
  

  socket.on('disconnect', () => {
    playersData[socket.id] = "disconnected"
  });
});







const loop = setInterval(()=>{

  for(let i in playersData){
    if(playersData[i] != "disconnected"){
      if(playersData[i].alive){
        
        if(Date.now() - playersData[i].powerPunchedTimeStamp <= 1600){
          if(Date.now() - playersData[i].powerPunchedTimeStamp <= 800){
            playersData[i].currentAction = 'PowerPunched'
          }else{
            playersData[i].currentAction = 'StandUp'
          }

          if(!playersData[i].lockAction){
            io.emit("Data", [playersData])
          }
          playersData[i].lockAction = true


        }else if(Date.now() - playersData[i].punchedTimeStamp <= 330){
          playersData[i].currentAction = 'Punched'

          if(!playersData[i].lockAction){
            io.emit("Data", [playersData])
          }
          playersData[i].lockAction = true


        }else if((playersData[i].currentAction == "Dodge" && Date.now() - playersData[i].dodgeTimeStamp <= 900) || (playersData[i].currentAction == "DodgePunch" && Date.now() - playersData[i].dodgeTimeStamp <= 1000)){
          
          if(Math.floor((Date.now() - playersData[i].dodgeTimeStamp)/20)== 40 && playersData[i].dodgePunch){
            //console.log("Dodge Punch!")
            
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
                if(d < punchRadius  && playersData[j].currentAction != 'Dodge' && playersData[j].currentAction != 'DodgePunch'){
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
                    playersData[j].hp = 0
                    playersData[j].currentAction = "Death"
                  }
                  io.emit("Data", [playersData])
                }
              }
            }
          }
          if(Date.now() - playersData[i].dodgeTimeStamp <= 300){
            if(playersData[i].keys[MOUSEL]){
              playersData[i].dodgePunch = true
            }
          }

          if(playersData[i].dodgePunch){
            playersData[i].currentAction = 'DodgePunch'
          }else{
            playersData[i].currentAction = 'Dodge'
          }

          if(!playersData[i].lockAction){
            io.emit("Data", [playersData])
          }
          playersData[i].lockAction = true

        }else if(Date.now() - playersData[i].shieldTimeStamp <= 250){
          playersData[i].currentAction = 'ShieldProtect'

          if(!playersData[i].lockAction){
            io.emit("Data", [playersData])
          }
          playersData[i].lockAction = true


        }else if((playersData[i].currentAction == 'Jump' && Date.now() - playersData[i].jumpTimeStamp <= 550) || (playersData[i].currentAction == 'PowerPunch' && Date.now() - playersData[i].jumpTimeStamp <= 800)){

          if(Math.floor((Date.now() - playersData[i].jumpTimeStamp)/20)==25 && playersData[i].powerPunch){
            //console.log("Power Punch!!!")
            //powerPunch
            const playerData = playersData[i]
            const x = playerData.walkDirection.x
            const z = playerData.walkDirection.z

            // const newX = punchOffset/Math.sqrt(x*x + z*z)*x
            // const newZ = punchOffset/Math.sqrt(x*x + z*z)*z
            playersData[i].powerPunchTimeStamp = Date.now()
            io.to(i).emit('powerPunchDelay', {delay:playersData[i].powerPunchDelay})
            //console.log(io.sockets)

            for(let j in playersData){
              if(i!=j && playersData[j].position){
                const dX  = Math.abs(playersData[j].position.x - playerData.position.x)
                const dY  = Math.abs(playersData[j].position.y - 0)
                const dZ  = Math.abs(playersData[j].position.z - playerData.position.z)

                const d = Math.sqrt(dY*dY + Math.sqrt(dX*dX + dZ*dZ))
                //console.log(d)
                if(d < powerPunchRadius && playersData[j].currentAction != 'Dodge' && playersData[j].currentAction != 'DodgePunch'){
                  //io.sockets.sockets.get(j)
                  //j-ofiara i-atacker

                  io.emit('pointDamage', {id:i, x:playerData.position.x, y:0, z:playerData.position.z, punchRadius})

                  if(playersData[j].currentAction == 'ShieldIdle'){
                    playersData[j].hp -= playerData.damage*powerPunchDamageFactor*(1 - shieldDamageAbsorption)
                    playersData[j].punchedTimeStamp = Date.now()
                  }else{
                    playersData[j].hp -= playersData[i].damage*powerPunchDamageFactor
                    playersData[j].powerPunchedTimeStamp = Date.now()
                  }
                  if(playersData[j].hp<=0){
                    playersData[j].hp = 0
                    playersData[j].alive = false
                    playersData[j].currentAction = "Death"
                  }
                  io.emit("Data", [playersData])
                }
              }
            }
            
          }
          if(Date.now() - playersData[i].jumpTimeStamp >= 300 && Date.now() - playersData[i].jumpTimeStamp <= 400){
            if(playersData[i].keys[MOUSEL] && Date.now() - playersData[i].powerPunchTimeStamp >= playersData[i].powerPunchDelay){
              playersData[i].powerPunch = true
            }
          }
          if(playersData[i].powerPunch){
            playersData[i].currentAction = 'PowerPunch'
          }else{
            playersData[i].currentAction = 'Jump'
          }

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
                if(d < punchRadius  && playersData[j].currentAction != 'Dodge' && playersData[j].currentAction != 'DodgePunch'){
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
                    playersData[j].hp = 0
                    playersData[j].alive = false
                    playersData[j].currentAction = "Death"
                  }
                  io.emit("Data", [playersData])
                }
              }
            }
          }
        }else{
          playersData[i].dodgePunch = false
          playersData[i].powerPunch = false

          const keys = playersData[i].keys

          const dirPressed = (keys[W] || keys[S] || keys[A] || keys[D])
          const spacePressed = (keys[SPACE])
          const shiftPressed = (keys[SHIFTL])
          const mouseLeftPressed = (!!playersData[i].keys[MOUSEL])
          const mouseRightPressed = (!!playersData[i].keys[MOUSER])

          let play = ''
          if(spacePressed){
            play = 'Jump'
          }else{
            if(mouseRightPressed){
              play = 'ShieldIdle'
            }else{
              if(mouseLeftPressed && Date.now() - playersData[i].punchTimeStamp >= 800){
                play = 'Punch'
              }else if(shiftPressed && Date.now() - playersData[i].dodgeTimeStamp >= 1500){
                play = 'Dodge'
              }else{
                if(dirPressed){
                  play = 'Run'
                }else{
                  play = 'Idle'
                }
              }
            }
          }
          if(playersData[i].lockAction){
            play = playersData[i].currentAction
          }
          // if(playersData[i].lockAction && (playersData[i].currentAction == 'PowerPunched' || playersData[i].currentAction == 'StandUp')){
          //   play = playersData[i].currentAction

          // }else if(playersData[i].lockAction && playersData[i].currentAction == 'Punched'){
          //   play = 'Punched'

          // }else if(playersData[i].lockAction && playersData[i].currentAction == 'ShieldProtect'){
          //   play = 'ShieldProtect'

          // }
          else if(!playersData[i].lockAction && play == 'Jump'){
            playersData[i].jumpTimeStamp = Date.now()

          }else if(!playersData[i].lockAction && play == 'Dodge'){
            playersData[i].dodgeTimeStamp = Date.now()

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

        const curAct = playersData[i].currentAction

        if(dirPressed && (curAct == "Run" || curAct == "Jump")|| curAct == "Dodge" || curAct == "DodgePunch"){

          if(playersData[i].walkDirection.x){
            if(Math.abs(playersData[i].position.x + playersData[i].walkDirection.x*playersData[i].velocity[curAct]) < arenaSize/2-arenaCollisionOffset){
              playersData[i].position.x += playersData[i].walkDirection.x*playersData[i].velocity[curAct]
            }

          }if(playersData[i].walkDirection.z){
            if(Math.abs(playersData[i].position.z + playersData[i].walkDirection.z*playersData[i].velocity[curAct]) < arenaSize/2-arenaCollisionOffset){
              playersData[i].position.z += playersData[i].walkDirection.z*playersData[i].velocity[curAct]
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