import * as THREE from '/assets/js/three.js';
import {OrbitControls} from '/assets/js/OrbitControls.js'
import {GLTFLoader} from '/assets/js/GLTFLoader.js'
import { CharacterControls } from '/characterControls.js';
import { PointerLockControls } from '/assets/js/PointerLockControls.js'
import * as SkeletonUtils from '/assets/js/SkeletonUtils.js'

const W = 'KeyW'
const S = 'KeyS'
const A = 'KeyA'
const D = 'KeyD'
const MOUSEL = 'Mouse1'
const MOUSER = 'Mouse3'


let socket = io();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("skyblue");

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(12, 15, 12);


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

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.minDistance = 10
orbit.maxDistance = 15
orbit.enablePan = false
orbit.maxPolarAngle = Math.PI / 2 - 0.05
orbit.update();


const grid = new THREE.GridHelper(50, 50);
scene.add(grid);


const dirLight = new THREE.DirectionalLight()
dirLight.position.set(0, 10, 0)
dirLight.target.position.set(0, 0, 0)
scene.add(dirLight)
scene.add(dirLight.target)
const ambientLight = new THREE.AmbientLight(0xFFFFFF)
scene.add(ambientLight)


const assetLoader = new GLTFLoader();

class Player{
  constructor(id, mod, mix, CControls){
    this.id = id
    this.model = mod
    this.mixer = mix
    this.characterControls = CControls

    this.currentAction = "Idle"
  }
}



let model, mixer, actions = {};
let walking = false
let characterControls
let Bob
let clips

assetLoader.load('/assets/Wojownik.glb', function(gltf) {
  model = gltf.scene;
  scene.add(model);
  mixer = new THREE.AnimationMixer(model);
  

  gltf.scene.traverse(c =>{
    c.castShadow = true
  })


  clips = gltf.animations
  for(let i=0; i<clips.length; i++){
    const clip = clips[i]
    const action = mixer.clipAction(clip)
    actions[clip.name] = action
  }

  characterControls = new CharacterControls(model, mixer, actions, orbit, camera,  'Idle')
  Bob = new Player(socket.id, model, mixer, characterControls)

}, undefined, function(error) {
    console.error(error);
});




let playersData = {}
const playerModels = {}
const playerMixers = {}
const playerActions = {}
const playerCurrentActions = {}


const clock = new THREE.Clock();

function animate() {

  const delta = clock.getDelta()

  for(let i in playersData){
    if(playerMixers[i]){
      if(i != socket.id && characterControls){
        playerMixers[i].update(delta * characterControls.animationFactors[playerCurrentActions[i] ])
      }
    }
  }

  if(characterControls){

    Bob.characterControls.update(delta, keys, Bob.currentAction)

    const needsUpdate = (keys[W] || keys[S] || keys[A] || keys[D] || keys[MOUSEL] || keys[MOUSER])
    if(needsUpdate){
      Bob.characterControls.sendData(socket, keys)
    }

  }
	renderer.render(scene, camera);
}







socket.on("Data", (Data)=>{

  
  playersData = Data[0]

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
        playerModels[i] = null
      }
    }else{
      if(playerModels[i]){
        playerModels[i].position.set(playersData[i].position.x, playersData[i].position.y, playersData[i].position.z)
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
          current.fadeOut(characterControls.fadeDurations[playersData[i].currentAction])
          toPlay.reset().fadeIn(characterControls.fadeDurations[playersData[i].currentAction]).play()

          playerCurrentActions[i] = playersData[i].currentAction

        }
      }else{//nowy gracz
        if(i == socket.id){

        }else{
          if(model){
            const playerClone = SkeletonUtils.clone(model)
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

            playerActions[i][playerCurrentActions[i]].play()


            
          }

        }
      }
    }
  }
})

renderer.setAnimationLoop(animate);




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



window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});