import * as THREE from '/assets/js/three.js';
import {OrbitControls} from '/assets/js/OrbitControls.js'
import { PointerLockControls } from '/assets/js/PointerLockControls.js'
import {GLTFLoader} from '/assets/js/GLTFLoader.js'
import {FontLoader} from '/assets/js/FontLoader.js'
import {TextGeometry} from '/assets/js/TextGeometry.js'
import { CharacterControls } from '/characterControls.js';
import * as SkeletonUtils from '/assets/js/SkeletonUtils.js'
import { GuiManager } from '/Gui.js';
import { LobbyManager } from '/lobby.js';
import {TWEEN} from '/assets/js/Tween.js'


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


const skinNames = {1:'Bob', 2:'Tina'}
const modelUrls = {'Bob':'/assets/Wojownik.glb', 'Tina':'/assets/Girl.glb'}

socket.on('con', ()=>{
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
  orbit.enabled = false
  orbit.target = new THREE.Vector3(0, 1.5, 0)
  orbit.update();



  const pointerLock = new PointerLockControls( camera, document.body)

  joinButton.addEventListener( 'click', function () {
    pointerLock.lock();
  } );

  pointerLock.addEventListener( 'lock', function () {
  //
  } );

  pointerLock.addEventListener( 'unlock', function () {
  //
  } );




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


  const color = 0xaaaaaa;  // white
  const near = 10;
  const far = 13
  scene.fog = new THREE.Fog(color, near, far);



  const assetLoader = new GLTFLoader()

  let lobbyPlayerModels = {}, lobbyPlayerMixers = {}, clips = {}, actions = {}

  for(let i in skinNames){
    assetLoader.load(modelUrls[skinNames[i]], function(gltf) {
      gltf.scene.traverse(c =>{
        c.castShadow = true
      })

      lobbyPlayerModels[skinNames[i]] = gltf.scene;
      lobbyPlayerModels[skinNames[i]].position.x = (i-1)*-5
      lobbyPlayerModels[skinNames[i]].position.z = (i-1)*5
      scene.add(lobbyPlayerModels[skinNames[i]]);
      lobbyPlayerMixers[skinNames[i]] = new THREE.AnimationMixer(lobbyPlayerModels[skinNames[i]]);
      actions[skinNames[i]] = {}
      
      clips[skinNames[i]] = gltf.animations
      for(let j=0; j<clips[skinNames[i]].length; j++){
        const clip = clips[skinNames[i]][j]
        const action = lobbyPlayerMixers[skinNames[i]].clipAction(clip)
        actions[skinNames[i]][clip.name] = action
        
      }
      actions[skinNames[i]]["Idle"].play()

    }, undefined, function(error) {
        console.error(error);
    });
  }


  let selected = 1

  const clock = new THREE.Clock()
  const animate = (time)=>{
    TWEEN.update(time)
    orbit.update()
    const delta = clock.getDelta()
    for(let i in lobbyPlayerMixers){
      if(lobbyPlayerMixers[i]){
        lobbyPlayerMixers[i].update(delta)
      }
    }
    renderer.render(scene, camera)
    const d = lobbyManager.changeSelected
    if(d){
      if(skinNames[selected+d]){
        for(let i in lobbyPlayerModels){
          let coords = {x:lobbyPlayerModels[i].position.x, z:lobbyPlayerModels[i].position.z}

          let endCoords = {}
          if(coords.x + d > 0){
            endCoords.z = coords.z + 5*d
            //lobbyPlayerModels[i].position.z += 5*d
          }else{
            endCoords.z = coords.z + 5*d*-1
            //lobbyPlayerModels[i].position.z += 5*d*-1
          }
          endCoords.x = coords.x + 5*d
          //lobbyPlayerModels[i].position.x += 5*d

          let tween = new TWEEN.Tween(coords)
            .to(endCoords, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(()=>{
              lobbyPlayerModels[i].position.x = coords.x
              lobbyPlayerModels[i].position.z = coords.z
            })
            .start()
        }
        selected += d
        lobbyManager.skin = skinNames[selected]
        lobbyManager.changeSelected = 0
      }
    }
  }
  renderer.setAnimationLoop(animate)

})



socket.on('joined', (skin)=>{
  const GM = new GuiManager(skin, socket)
  GM.connectionState = 'game'

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
  );
  camera.position.set(100, 90, 100);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.minDistance = 10
  orbit.maxDistance = 12
  orbit.enablePan = false
  orbit.minPolarAngle = Math.PI / 6
  orbit.maxPolarAngle = Math.PI / 2
  orbit.enableZoom = false
  orbit.update();


  const pointerLock = new PointerLockControls( camera, document.body)

  window.addEventListener( 'click', function () {
    if(GM.connectionState == 'game'){
      pointerLock.lock();
    }
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
  const planeMaterial = new THREE.MeshStandardMaterial({
    map: planeTexture,
  });
  const plane = new THREE.Mesh( planeGeometry, planeMaterial )
  plane.rotation.x = -Math.PI/2
  plane.receiveShadow = true
  scene.add( plane );










  //light
  const dirLight = new THREE.DirectionalLight(0xffffff, 5)
  dirLight.position.set(20, 50, 20)
  dirLight.target.position.set(0, 0, 0)
  dirLight.castShadow = true
  dirLight.scale.set(20, 20, 20)
  var side = 50;
  dirLight.shadow.camera.top = side;
  dirLight.shadow.camera.bottom = -side;
  dirLight.shadow.camera.left = side;
  dirLight.shadow.camera.right = -side;
  dirLight.shadow.bias = -0.0001
  dirLight.shadowMapWidth = 1024 * 2;
  dirLight.shadowMapHeight = 1024 * 2;

  scene.add(dirLight)
  scene.add(dirLight.target)


  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 2)
  scene.add(ambientLight)

  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.enabled = true
  renderer.toneMapping = THREE.ReinhardToneMapping
  //renderer.toneMappingExposure = 1








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
  })




  const assetLoader = new GLTFLoader();
  //loading player model

  let skins = {}, mixers = {}, actions = {};
  let walking = false
  let characterControls
  let Bob
  let clips = {}

  for(let i in skinNames){
    assetLoader.load(modelUrls[skinNames[i]], function(gltf) {
      gltf.scene.children[0].traverse(c =>{
        c.castShadow = true
      })


      skins[skinNames[i]] = gltf.scene;
      clips[skinNames[i]] = gltf.animations


      if(skinNames[i] == skin){
        scene.add(skins[skinNames[i]]);
        mixers[skinNames[i]] = new THREE.AnimationMixer(skins[skinNames[i]]);
        
        actions[skinNames[i]] = {}
        

        
        for(let j=0; j<clips[skinNames[i]].length; j++){
          const clip = clips[skinNames[i]][j]
          const action = mixers[skinNames[i]].clipAction(clip)
          actions[skinNames[i]][clip.name] = action
        }

        characterControls = new CharacterControls(skins[skin], mixers[skin], actions[skin], orbit, camera,  'Idle')
        Bob = new Player(socket.id, skins[skin], mixers[skin], characterControls)
        Bob.characterControls.sendData(socket, keys)
      }

    }, undefined, function(error) {
        console.error(error);
    });
  }




  //loading fence model & cloning & trees
  let arenaSize
  const fenceOffset = 7.5
  let fenceModel
  let treeModel
  let treeMixers =[]

  socket.on('arenaSize', (size)=>{

    arenaSize = size

    assetLoader.load('/assets/fence.glb', function(gltf) {
      gltf.scene.children[0].traverse(c =>{
        c.castShadow = true
      })
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
    
    
      
    }, undefined, function(error) {
        console.error(error);
    })



    

    assetLoader.load('/assets/tree.glb', (gltf)=>{
      gltf.scene.traverse(c =>{
        c.castShadow = true
      })
      treeModel = gltf.scene


      for(let i=-50; i<50; i+=15){
        for(let j=-50; j<50; j+=15){
          const x = i + Math.random()*10
          const z = j + Math.random()*10
          if((x<-arenaSize/2-2 || x>arenaSize/2+2) || (z<-arenaSize/2-2 || z>arenaSize/2+2)){
            const treeClone = SkeletonUtils.clone(treeModel)
            treeClone.position.set(x, 0, z)
            treeClone.rotation.y = Math.random()*2*Math.PI
            let size = Math.random()*2+0.3
            treeClone.scale.set(size, size, size)
            scene.add(treeClone)

            // const treeMixer = new THREE.AnimationMixer(treeClone)
            // const treeActions = {}
            // clips['tree'] = gltf.animations
            // for(let k=0; k<clips['tree'].length; k++){
            //   const clip = clips['tree'][k]
            //   const action = treeMixer.clipAction(clip)
            //   treeActions[clip.name] = action
            // }
            // treeActions["Idle"].play()

            // treeMixers.push(treeMixer)
          }
        }
      }

    }, undefined, function(error) {
        console.error(error);
    })

  })


  


  let playersData = {}
  const playerModels = {}
  const playerMixers = {}
  const playerActions = {}
  const playerCurrentActions = {}
  const playerNicknames = {}





  const clock = new THREE.Clock();

  function animate(time) {
    TWEEN.update(time)

    const delta = clock.getDelta()

    for(let i of treeMixers){
      i.update(delta*(Math.random()*0.1+0.5))
    }

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


  const pointDamage = (dx, dy, dz, radius)=>{
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    //const sprite = new THREE.TextureLoader().load( '/assets/punchParticle.png' );
    const sprites = [
      new THREE.TextureLoader().load( '/assets/particle1.png' ),
      new THREE.TextureLoader().load( '/assets/particle2.png' ),
      new THREE.TextureLoader().load( '/assets/particle3.png' ),
    ]
    for(let j=0; j<3; j++){
      for ( let i = 0; i < radius*15; i ++ ) {

        const y = Math.random() / 5;

        const r = Math.random() /2
        const angle = Math.random() * Math.PI * 2

        const x = Math.cos(angle)*r
        const z = Math.sin(angle)*r
        // const x = Math.random() - 0.5;
        // const y = Math.random() / 5;
        // const z = Math.random() - 0.5;

        vertices.push( x, y, z );

      }

      geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

      let material = new THREE.PointsMaterial( { size: 0.5, sizeAttenuation: true, map: sprites[j], transparent:true, opacity:1 } );
      material.color.setHSL( 0.2, 1, 0.4 );

      const particles = new THREE.Points( geometry, material );
      particles.position.set(dx, dy, dz)
      particles.scale.set(0.5, 0.5, 0.5)
      material.opacity = 1
      scene.add( particles );

      const time = radius*500

      let t = {s:0.5}
      let sTween = new TWEEN.Tween(t)
        .to({s:radius*3}, time)
        .easing(TWEEN.Easing.Back.Out)
        .onUpdate(()=>{
          particles.scale.set(t.s, t.s, t.s)
        })
        .start()
        .onComplete(()=>{
          scene.remove(particles)
        })

      let opTween = new TWEEN.Tween(material)
        .to({opacity:0}, time)
        .easing(TWEEN.Easing.Circular.Out)
        .start()
    }
  }



  socket.on('pointDamage', (Data)=>{
    pointDamage(Data.x, Data.y, Data.z, Data.radius)
  })

  socket.on('leaderBoard', (LB)=>{
    GM.leaderBoard = LB
    GM.updateLeaderBoard = true
  })

  GM.setPPdelay(Date.now(), 1)
  GM.setHdelay(Date.now(), 1)

  socket.on('powerPunchDelay', (Data)=>{
    const delay = Data.delay
    GM.setPPdelay(Date.now(), delay)
  })


  socket.on('healDelay', (Data)=>{
    const delay = Data.delay
    GM.setHdelay(Date.now(), delay)
  })


  socket.on('healCloud', (Pos)=>{
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const sprite = new THREE.TextureLoader().load( '/assets/healParticle.png' )
    for ( let i = 0; i < 40; i ++ ) {

        const y = Math.random() -0.5;

        const r = Math.random() /2
        const angle = Math.random() * Math.PI * 2

        const x = Math.cos(angle)*r
        const z = Math.sin(angle)*r
        // const x = Math.random() - 0.5;
        // const y = Math.random() / 5;
        // const z = Math.random() - 0.5;

        vertices.push( x, y, z );

      }

      geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

      let material = new THREE.PointsMaterial( { size: 0.5, sizeAttenuation: true, map: sprite, transparent:true, opacity:1 } );
      //material.color.setHSL(1, 2, 1);

      const particles = new THREE.Points( geometry, material );
      particles.position.set(Pos.x, Pos.y, Pos.z)
      particles.scale.set(0.5, 0.5, 0.5)
      material.opacity = 1
      scene.add( particles );

      const time = 750

      let t = {s:0.5}
      let sTween = new TWEEN.Tween(t)
        .to({s:4}, time)
        .easing(TWEEN.Easing.Back.Out)
        .onUpdate(()=>{
          particles.scale.set(t.s, t.s, t.s)
        })
        .start()
        .onComplete(()=>{
          scene.remove(particles)
        })

      let opTween = new TWEEN.Tween(material)
        .to({opacity:0}, time)
        .easing(TWEEN.Easing.Circular.Out)
        .start()
  })

  //let last = Date.now()
  socket.on("Data", (Data, movement=false)=>{
    //console.log(Date.now()-last)
    //last = Date.now()

    
    playersData = Data[0]
    //console.log(Date.now() - playersData[socket.id].deathTimeStamp )
    if(!playersData[socket.id].alive){
      if(Date.now() - playersData[socket.id].deathTimeStamp < 3000){
        GM.connectionState = "death"
      }

    }else{
      GM.connectionState = "game"
    }

    if(playersData[socket.id].nick != GM.nickname){
      GM.setNick(playersData[socket.id].nick)
    }

    if(playersData[socket.id].maxHp != GM.maxHealth){
      GM.setMaxHp(playersData[socket.id].maxHp)

    }
    if(playersData[socket.id].hp != GM.hp){
      GM.setHp(playersData[socket.id].hp)
    }


    //animations
    if(Bob){
      Bob.currentAction = playersData[socket.id].currentAction
    }

    //movement
    if(movement){
      if(Bob){

        const startX = Bob.model.position.x
        const startY = Bob.model.position.y
        const startZ = Bob.model.position.z

        const x = playersData[socket.id].position.x
        const y = playersData[socket.id].position.y
        const z = playersData[socket.id].position.z
        Bob.characterControls.updateMovement(x, y, z)
        
        const coords = {x:startX, y:startY, z:startZ}
        const endCoords = {x:x, y:y, z:z}

        let tween = new TWEEN.Tween(coords)
          .to(endCoords, 100)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onUpdate(()=>{
            Bob.characterControls.updateMovement(coords.x, coords.y, coords.z)
          })
          .start()

      }
    }

    for(let i in playersData){

      if(playersData[i] == "disconnected"){
        if(playerModels[i]){
          scene.remove(playerModels[i])
          playerModels[i] = null

          
        }
        if(playerNicknames[i]){
          scene.remove(playerNicknames[i])
          playerNicknames[i] = null
        }
      }else{
        if(playerModels[i]){
          //playerModels[i].position.set(playersData[i].position.x, playersData[i].position.y, playersData[i].position.z)

          const startX = playerModels[i].position.x
          const startY = playerModels[i].position.y
          const startZ = playerModels[i].position.z

          const x = playersData[i].position.x
          const y = playersData[i].position.y
          const z = playersData[i].position.z
          
          const coords = {x:startX, y:startY, z:startZ}
          const endCoords = {x:x, y:y, z:z}

          let tween = new TWEEN.Tween(coords)
            .to(endCoords, 100)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(()=>{
              if(playerModels[i]){
                playerModels[i].position.set(coords.x, coords.y, coords.z)
                playerNicknames[i].position.set(coords.x, coords.y+3, coords.z)
              }
            })
            .start()

          
          const rotation = playersData[i].rotation
          if(rotation){
            playerModels[i].rotation.x = playersData[i].rotation.x
            playerModels[i].rotation.y = playersData[i].rotation.y
            playerModels[i].rotation.z = playersData[i].rotation.z
          }
          


          if(playersData[i].currentAction != playerCurrentActions[i] && playerActions[i]){
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
            if(!playerNicknames[i] && font){
              const nickNameGeo = new TextGeometry(`${playersData[i].nick}`.toUpperCase(), {
                font:font,
                size:0.25,
                height:0.00001
              })
              const nickNameMesh = new THREE.Mesh(nickNameGeo, new THREE.MeshPhongMaterial({ color:0x000000 }))
              
              playerNicknames[i] = nickNameMesh
              scene.add(playerNicknames[i])
            }

            const skin = playersData[i].skin
            if(skins[skin]){
              const playerClone = SkeletonUtils.clone(skins[skin])
              playerClone.position.set(playersData[i].position.x, playersData[i].position.y, playersData[i].position.z)
              scene.add(playerClone)
              playerModels[i] = playerClone

              const cloneMixer = new THREE.AnimationMixer(playerClone);
              const cloneActions = {}
              for(let i=0; i<clips[skin].length; i++){
                const clip = clips[skin][i]
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
    if(e.code == "KeyQ"){
      socket.emit('healMe')
    }
  	keys[e.code] = true
  })
  document.addEventListener("keyup", e =>{
  	keys[e.code] = null
    if(Bob.characterControls){
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
    if(GM.connectionState == "game"){
      camera.translateX(e.movementX/-15)
      camera.translateY(e.movementY/20)
      orbit.update()
    }
    
  })
})