import * as THREE from '/assets/js/three.js';
import {OrbitControls} from '/assets/js/OrbitControls.js'
import {GLTFLoader} from '/assets/js/GLTFLoader.js'

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

renderer.setClearColor(0xA3A3A3);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(2, 1.5, 2);
orbit.update();

const grid = new THREE.GridHelper(30, 30);
scene.add(grid);


const ambientLight = new THREE.AmbientLight(0xFFFFFF)
scene.add(ambientLight)


const assetLoader = new GLTFLoader();

let mixer, actions={}, activeAction;

assetLoader.load('/assets/Wojownik.glb', function(gltf) {
  const model = gltf.scene;
  scene.add(model);
  mixer = new THREE.AnimationMixer(model);
  
  const clips = gltf.animations
  for(let i=0; i<clips.length; i++){
    const clip = clips[i]
    const action = mixer.clipAction(clip)
    actions[clip.name] = action
  }
  console.log(actions)
  activeAction = actions['Idle']
  activeAction.play()

}, undefined, function(error) {
    console.error(error);
});

const clock = new THREE.Clock();
function animate() {
  if(mixer){
    mixer.update(clock.getDelta());
  }
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});