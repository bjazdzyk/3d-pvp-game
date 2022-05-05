import * as THREE from '/assets/js/three.js';
import {OrbitControls} from '/assets/js/OrbitControls.js'
import {GLTFLoader} from '/assets/js/GLTFLoader.js'
import { CharacterControls } from '/characterControls.js';
import { PointerLockControls } from '/assets/js/PointerLockControls.js'


const W = 'KeyW'
const S = 'KeyS'
const A = 'KeyA'
const D = 'KeyD'
const MOUSEL = 'Mouse1'
const MOUSER = 'Mouse3'


let socket = io();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xA3A3A3);

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



let mixer, actions = {}, activeAction, previousAction;
let walking = false
let characterControls
let Bob


assetLoader.load('/assets/Wojownik.glb', function(gltf) {
  const model = gltf.scene;
  scene.add(model);
  mixer = new THREE.AnimationMixer(model);
  

  gltf.scene.traverse(c =>{
    c.castShadow = true
  })


  const clips = gltf.animations
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



function fadeToAction( name, duration ) {

  previousAction = activeAction;
  activeAction = actions[ name ];

  if ( previousAction !== activeAction ) {

    previousAction.fadeOut( duration );

  }

  activeAction
    .reset()
    .setEffectiveTimeScale( 1 )
    .setEffectiveWeight( 1 )
    .fadeIn( duration )
    .play();

}




const clock = new THREE.Clock();

function animate() {
  if(characterControls){

    Bob.characterControls.update(clock.getDelta(), keys, Bob.currentAction)

    const needsUpdate = (keys[W] || keys[S] || keys[A] || keys[D] || keys[MOUSEL] || keys[MOUSER])
    if(needsUpdate){
      Bob.characterControls.sendData(socket, keys)
    }

  }


	renderer.render(scene, camera);
}

socket.on("Data", (Data)=>{
  
  const playersData = Data[0]

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