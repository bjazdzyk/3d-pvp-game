import * as THREE from '/assets/js/three.js';

export class CharacterControls{
	constructor(model, mixer, animationsMap, orbitControl, camera, defaultState){
		this.model = model
		this.mixer = mixer
		this.animationsMap = animationsMap
		this.orbitControl = orbitControl
		this.camera = camera
		this.defaultState = defaultState

		// state
		this.currentAction = this.defaultState
		this.animationsMap[this.currentAction].play()

		// temporary data
		this.walkDirection = new THREE.Vector3()
		this.rotateAngle = new THREE.Vector3(0, 1, 0)
		this.rotateQuarternion = new THREE.Quaternion()
		this.cameraTarget = new THREE.Vector3()

		// const
		this.fadeDuration = 0.2
		this.runVelocity = 5


		this.updateCameraTarget(0, 0)
	}

	update(delta, keys){
		const dirPressed = (keys.get('KeyW') || keys.get('KeyS') || keys.get('KeyA') || keys.get('KeyD'))

		let play = ''
		if(dirPressed){
			play = 'Run'
		}else{
			play = 'Idle'
		}

		if(this.currentAction != play){
			const toPlay = this.animationsMap[play]
			const current = this.animationsMap[this.currentAction]


			current.fadeOut(this.fadeDuration)
			toPlay.reset().fadeIn(this.fadeDuration).play()

			this.currentAction = play

		}

		if(this.mixer){this.mixer.update(delta)}


	}

	updateCameraTarget(moveX, moveZ){
		//move camera
		this.camera.position.x += moveX
		this.camera.position.z += moveZ

		//update camera target
		this.cameraTarget.x = this.model.position.x
		this.cameraTarget.y = this.model.position.y+1
		this.cameraTarget.z = this.model.position.z
		this.orbitControl.target = this.cameraTarget
		this.orbitControl.update()
	}
}