const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

scene.background = new THREE.Color( 0xa7faf2 );


const dirLight = new THREE.DirectionalLight()
dirLight.position.set(10, 10, 10)
dirLight.target.position.set(0, 0, 0)
scene.add(dirLight)
scene.add(dirLight.target)
const ambientLight = new THREE.AmbientLight(0xFFFFFF)
scene.add(ambientLight)


camera.position.set(2, 2, 2)

const grid = new THREE.GridHelper(30, 30)
scene.add(grid)

const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.update();



// Instantiate a loader
const loader = new THREE.GLTFLoader();

// Load a glTF resource
loader.load(
  // resource URL
  'assets/wojownik.glb',
  // called when the resource is loaded
  function ( gltf ) {

    scene.add( gltf.scene );

    gltf.animations; // Array<THREE.AnimationClip>
    gltf.scene; // THREE.Group
    gltf.scenes; // Array<THREE.Group>
    gltf.cameras; // Array<THREE.Camera>
    gltf.asset; // Object

  },
  // called while loading is progressing
  function ( xhr ) {

    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

  },
  // called when loading has errors
  function ( error ) {

    console.log( 'An error happened' );

  }
);


function animate() {
  requestAnimationFrame( animate );

  renderer.render( scene, camera );
};
animate()