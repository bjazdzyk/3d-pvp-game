import * as THREE from '/assets/js/three.js';
import {OrbitControls} from '/assets/js/OrbitControls.js'
import {GLTFLoader} from '/assets/js/GLTFLoader.js'
import { CharacterControls } from '/characterControls.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xA3A3A3);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(7, 4, 7);


const orbit = new OrbitControls(camera, renderer.domElement);
orbit.minDistance = 7
orbit.maxDistance = 15
orbit.enablePan = false

orbit.maxPolarAngle = Math.PI / 2 - 0.05
orbit.update();

const grid = new THREE.GridHelper(30, 30);
scene.add(grid);


const dirLight = new THREE.DirectionalLight()
dirLight.position.set(10, 10, 10)
dirLight.target.position.set(0, 0, 0)
scene.add(dirLight)
scene.add(dirLight.target)
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
scene.add(ambientLight)


const assetLoader = new GLTFLoader();

let mixer, actions = {}, activeAction, previousAction;
let walking = false
let characterControls


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
    characterControls.update(clock.getDelta(), keys)
  }
	renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);



const keys = {}

document.addEventListener("keydown", e =>{
	keys[e.code] = true
})
document.addEventListener("keyup", e =>{
	keys[e.code] = null
})



window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});