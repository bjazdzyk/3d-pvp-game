import * as THREE from '/assets/js/three.js';
import {OrbitControls} from '/assets/js/OrbitControls.js'
import {GLTFLoader} from '/assets/js/GLTFLoader.js'
import {FontLoader} from '/assets/js/FontLoader.js'
import {TextGeometry} from '/assets/js/TextGeometry.js'
import { CharacterControls } from '/characterControls.js';
import { PointerLockControls } from '/assets/js/PointerLockControls.js'
import * as SkeletonUtils from '/assets/js/SkeletonUtils.js'
import { GuiManager } from '/Gui.js';
import { LobbyManager } from '/lobby.js';


const W = 'KeyW'
const S = 'KeyS'
const A = 'KeyA'
const D = 'KeyD'
const MOUSEL = 'Mouse1'
const MOUSER = 'Mouse3'
const SPACE = 'Space'
const SHIFT = 'ShiftLeft'


let socket = io();

const lobbyManager = new LobbyManager(socket)


 
//three js setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("skyblue");

document.body.appendChild(renderer.domElement);

let connectionState = 'none'

socket.on('con', ()=>{
  connectionState = 'lobby'
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
  );
  camera.position.z = -7
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.minDistance = 7
  orbit.maxDistance = 7
  orbit.enablePan = false
  orbit.minPolarAngle = Math.PI / 2.25
  orbit.maxPolarAngle = Math.PI / 2.25
  orbit.enableZoom = false
  orbit.enableDamping = true
  orbit.target = new THREE.Vector3(0, 1.5, 0)
  orbit.update();

  const dirLight = new THREE.DirectionalLight()
  dirLight.position.set(-10, 5, -10)
  dirLight.target.position.set(0, 0, 0)
  const dirLight2 = new THREE.DirectionalLight()
  dirLight2.position.set(10, 5, 10)
  dirLight2.target.position.set(0, 0, 0)
  scene.add(dirLight, dirLight2)
  scene.add(dirLight.target)
  const ambientLight = new THREE.AmbientLight(0xFFFFFF)
  scene.add(ambientLight)

  // const geometry = new THREE.BoxGeometry();
  // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  // const cube = new THREE.Mesh( geometry, material );
  // scene.add( cube );

  const assetLoader = new GLTFLoader()

  let lobbyPlayerModel, lobbyPlayerMixer, clips, actions = {}

  assetLoader.load('/assets/Wojownik.glb', function(gltf) {
    lobbyPlayerModel = gltf.scene;
    scene.add(lobbyPlayerModel);
    lobbyPlayerMixer = new THREE.AnimationMixer(lobbyPlayerModel);
    
    gltf.scene.traverse(c =>{
      c.castShadow = true
    })

    clips = gltf.animations
    for(let i=0; i<clips.length; i++){
      const clip = clips[i]
      const action = lobbyPlayerMixer.clipAction(clip)
      actions[clip.name] = action
      actions["Idle"].play()
    }

  }, undefined, function(error) {
      console.error(error);
  });

  const clock = new THREE.Clock()
  const animate = ()=>{
    orbit.update()
    if(lobbyPlayerMixer){
      lobbyPlayerMixer.update(clock.getDelta())
    }
    renderer.render(scene, camera)
  }
  renderer.setAnimationLoop(animate)

})



socket.on('joined', ()=>{
  connectionState = 'game'

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
  );
  camera.position.set(100, 90, 100);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.minDistance = 5
  orbit.maxDistance = 12
  orbit.enablePan = false
  orbit.minPolarAngle = Math.PI / 4
  orbit.maxPolarAngle = Math.PI / 2
  orbit.enableZoom = false
  orbit.update();







  //pointerLock & resize events
  const pointerLock = new PointerLockControls( camera, document.body)

  document.addEventListener( 'click', function () {
    pointerLock.lock();
  } );

  pointerLock.addEventListener( 'lock', function () {
    //
  } );

  pointerLock.addEventListener( 'unlock', function () {
    //
  } );
  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });







  //grass
  const loader = new THREE.TextureLoader()
  const planeTexture = loader.load('assets/grass.png')
  planeTexture.anisotropy = 0
  planeTexture.magFilter = THREE.NearestFilter;
  planeTexture.minFilter = THREE.NearestMipmapNearestFilter;
  planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
  planeTexture.offset.set( 0, 0 );
  planeTexture.repeat.set( 500, 500 );
  const planeGeometry = new THREE.PlaneGeometry( 1000, 1000 )
  const planeMaterial = new THREE.MeshBasicMaterial({
    map: planeTexture,
  });
  const plane = new THREE.Mesh( planeGeometry, planeMaterial )
  plane.rotation.x = -Math.PI/2
  scene.add( plane );










  //light
  const dirLight = new THREE.DirectionalLight()
  dirLight.position.set(0, 10, 0)
  dirLight.target.position.set(0, 0, 0)
  scene.add(dirLight)
  scene.add(dirLight.target)
  const ambientLight = new THREE.AmbientLight(0xFFFFFF)
  scene.add(ambientLight)








  //player class
  class Player{
    constructor(id, mod, mix, CControls){
      this.id = id
      this.model = mod
      this.mixer = mix
      this.characterControls = CControls

      this.currentAction = "Idle"
    }
  }




  const fontLoader = new FontLoader()
  let font
  fontLoader.load('/assets/font.json', (f)=>{
    font = f
    // const nickNameGeo = new TextGeometry(`AAAAA`, {
    //   font:font,
    //   size:1,
    //   height:0.0001
    // })
    // const nickNameMesh = new THREE.Mesh(nickNameGeo, new THREE.MeshPhongMaterial({ color:0x000000 }))
    // nickNameMesh.position.set(0, 1, 0)
    // scene.add(nickNameMesh)
  })




  const assetLoader = new GLTFLoader();
  //loading player model

  let playerModel, mixer, actions = {};
  let walking = false
  let characterControls
  let Bob
  let clips

  assetLoader.load('/assets/Wojownik.glb', function(gltf) {
    playerModel = gltf.scene;
    scene.add(playerModel);
    mixer = new THREE.AnimationMixer(playerModel);
    

    gltf.scene.traverse(c =>{
      c.castShadow = true
    })


    clips = gltf.animations
    for(let i=0; i<clips.length; i++){
      const clip = clips[i]
      const action = mixer.clipAction(clip)
      actions[clip.name] = action
    }

    characterControls = new CharacterControls(playerModel, mixer, actions, orbit, camera,  'Idle')
    Bob = new Player(socket.id, playerModel, mixer, characterControls)
    Bob.characterControls.sendData(socket, keys)

  }, undefined, function(error) {
      console.error(error);
  });





  //loading fence model & cloning
  let arenaSize
  const fenceOffset = 7.5
  let fenceModel

  socket.on('arenaSize', (size)=>{

    arenaSize = size

    assetLoader.load('/assets/fence.glb', function(gltf) {
      fenceModel = gltf.scene
      //scene.add(fenceModel)
    
    
      for(let i=-arenaSize/2+fenceOffset; i<arenaSize/2+fenceOffset; i+=fenceOffset){
        const fenceCloneN = SkeletonUtils.clone(fenceModel)
        fenceCloneN.position.set(-arenaSize/2, 0, i)
    
        const fenceCloneE = SkeletonUtils.clone(fenceModel)
        fenceCloneE.position.set(i, 0, arenaSize/2)
        fenceCloneE.rotation.y = Math.PI/2
    
        const fenceCloneS = SkeletonUtils.clone(fenceModel)
        fenceCloneS.position.set(arenaSize/2, 0, i)
    
        const fenceCloneW = SkeletonUtils.clone(fenceModel)
        fenceCloneW.position.set(i, 0, -arenaSize/2)
        fenceCloneW.rotation.y = Math.PI/2
        scene.add(fenceCloneN, fenceCloneE, fenceCloneS, fenceCloneW)
      }
    
    
      gltf.scene.traverse(c =>{
        c.castShadow = true
      })
    }, undefined, function(error) {
        console.error(error);
    })

  })


  const GM = new GuiManager(200)


  let playersData = {}
  const playerModels = {}
  const playerMixers = {}
  const playerActions = {}
  const playerCurrentActions = {}
  const playerNicknames = {}





  const clock = new THREE.Clock();

  function animate() {

    const delta = clock.getDelta()

    for(let i in playersData){
      if(playerNicknames[i]){
        playerNicknames[i].rotation.x = camera.rotation.x
        playerNicknames[i].rotation.y = camera.rotation.y
        playerNicknames[i].rotation.z = camera.rotation.z
      }
      if(playerMixers[i]){
        if(i != socket.id && characterControls){
          playerMixers[i].update(delta * characterControls.animationFactors[playerCurrentActions[i]])
        }
      }
    }

    if(characterControls){

      Bob.characterControls.update(socket, delta, keys, Bob.currentAction)

      const needsUpdate = (keys[W] || keys[S] || keys[A] || keys[D] || keys[MOUSEL] || keys[MOUSER]|| keys[SPACE] || keys[SHIFT] || Bob.currentAction == 'Dodge' || Bob.currentAction == 'DodgePunch')
      if(needsUpdate){
        Bob.characterControls.sendData(socket, keys)
      }

    }
    GM.update(Date.now())
  	renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);


  const pointDamage = (x, y, z, radius)=>{
    //particles etc
  }



  socket.on('pointDamage', (Data)=>{
    pointDamage(Data.x, Data.y, Data.z, Data.ratius)
  })

  GM.setPPdelay(Date.now(), 1)
  socket.on('powerPunchDelay', (Data)=>{
    const delay = Data.delay
    GM.setPPdelay(Date.now(), delay)
  })



  socket.on("Data", (Data)=>{

    
    playersData = Data[0]


    if(playersData[socket.id].maxHp != GM.maxHealth){
      GM.setMaxHp(playersData[socket.id].maxHp)

    }
    if(playersData[socket.id].hp != GM.hp){
      GM.setHp(playersData[socket.id].hp, GM.maxHealth)
    }


    //animations
    if(Bob){
      Bob.currentAction = playersData[socket.id].currentAction
    }

    //movement
    if(Bob){

      const x = playersData[socket.id].position.x
      const y = playersData[socket.id].position.y
      const z = playersData[socket.id].position.z
      Bob.characterControls.updateMovement(x, y, z)
    }

    for(let i in playersData){

      if(playersData[i] == "disconnected"){
        if(playerModels[i]){
          scene.remove(playerModels[i])
          scene.remove(playerNicknames[i])

          playerModels[i] = null
          playerNicknames[i] = null
        }
      }else{
        if(playerModels[i]){
          playerModels[i].position.set(playersData[i].position.x, playersData[i].position.y, playersData[i].position.z)
          playerNicknames[i].position.set(playersData[i].position.x, playersData[i].position.y+3, playersData[i].position.z)
          const rotation = playersData[i].rotation
          if(rotation){
            playerModels[i].rotation.x = playersData[i].rotation.x
            playerModels[i].rotation.y = playersData[i].rotation.y
            playerModels[i].rotation.z = playersData[i].rotation.z
          }
          


          if(playersData[i].currentAction != playerCurrentActions[i]){
            const toPlay = playerActions[i][playersData[i].currentAction]
            const current = playerActions[i][playerCurrentActions[i]]

            //console.log(playersData[i].currentAction, playerCurrentActions[i])
            
            if(playersData[i].currentAction == "Death"){
              toPlay.setLoop(THREE.LoopOnce)
              toPlay.clampWhenFinished = true
              toPlay.enable = true
            }
            current.fadeOut(characterControls.fadeDurations[playersData[i].currentAction])
            toPlay.reset().fadeIn(characterControls.fadeDurations[playersData[i].currentAction]).play()

            playerCurrentActions[i] = playersData[i].currentAction

          }
        }else{//nowy gracz
          if(i == socket.id){

          }else{
            console.log(`${playersData[i].nick}`.toUpperCase())
            const nickNameGeo = new TextGeometry(`${playersData[i].nick}`.toUpperCase(), {
              font:font,
              size:0.25,
              height:0.00001
            })
            const nickNameMesh = new THREE.Mesh(nickNameGeo, new THREE.MeshPhongMaterial({ color:0x000000 }))
            
            playerNicknames[i] = nickNameMesh
            scene.add(playerNicknames[i])
            console.log(nickNameMesh)

            
            if(playerModel){
              const playerClone = SkeletonUtils.clone(playerModel)
              playerClone.position.set(playersData[i].position.x, playersData[i].position.y, playersData[i].position.z)
              scene.add(playerClone)
              playerModels[i] = playerClone

              const cloneMixer = new THREE.AnimationMixer(playerClone);
              const cloneActions = {}

              for(let i=0; i<clips.length; i++){
                const clip = clips[i]
                const action = cloneMixer.clipAction(clip)
                cloneActions[clip.name] = action
              }

              
              playerCurrentActions[i] = playersData[i].currentAction
              playerMixers[i] = cloneMixer
              playerActions[i] = cloneActions

              if(playerCurrentActions[i] == 'Death'){
                playerActions[i][playerCurrentActions[i]].setLoop(THREE.LoopOnce)
                playerActions[i][playerCurrentActions[i]].clampWhenFinished = true

                playerActions[i][playerCurrentActions[i]].time = playerActions[i][playerCurrentActions[i]]._clip.duration
              }

              playerActions[i][playerCurrentActions[i]].play()


              
            }

          }
        }
      }
    }
  })









  //keyboard events
  const keys = {}

  document.addEventListener("keydown", e =>{
  	keys[e.code] = true
  })
  document.addEventListener("keyup", e =>{
  	keys[e.code] = null
    if(characterControls){
      Bob.characterControls.sendData(socket, keys)
    }
  })
  document.addEventListener('mousedown', e=>{
    keys[`Mouse${e.which}`] = true
  })
  document.addEventListener('mouseup', e=>{
    keys[`Mouse${e.which}`] = null
    if(characterControls){
      Bob.characterControls.sendData(socket, keys)
    }
  })


  document.addEventListener('mousemove', e =>{
    camera.translateX(e.movementX/-15)
    camera.translateY(e.movementY/20)
    orbit.update()
  })
})