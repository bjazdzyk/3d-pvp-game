import * as THREE from '/assets/js/three.js';


const W = 'KeyW'
const S = 'KeyS'
const A = 'KeyA'
const D = 'KeyD'


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
		this.fadeDuration = 0.3
		this.runVelocity = 10
		this.runAnimationFactor = 5/3


		this.updateCameraTarget(0, 0)
	}

	update(delta, keys){
		const dirPressed = (keys[W] || keys[S] || keys[A] || keys[D])

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

		if(this.mixer){
			if(this.currentAction == 'Run'){
				this.mixer.update(delta * this.runAnimationFactor)
			}else{
				this.mixer.update(delta)
			}
		}
		if(this.currentAction == 'Run'){
			//calculate towards camera direction
			let angleYCameraDirection = Math.atan2(
                    (this.camera.position.x - this.model.position.x), 
                    (this.camera.position.z - this.model.position.z))
			console.log(angleYCameraDirection)


			var directionOffset = this.directionOffset(keys)

			//rotate model
			this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset)
            this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2)

            //calculate direction
            this.camera.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)

            const velocity = this.runVelocity

            //move model & camera
            const moveX = this.walkDirection.x * velocity * delta
            const moveZ = this.walkDirection.z * velocity * delta
            this.model.position.x += moveX
            this.model.position.z += moveZ
            this.updateCameraTarget(moveX, moveZ)


		}


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

	directionOffset(keys) {
        var directionOffset = 0 // w

        if (keys[W]) {
            if (keys[A]) {
                directionOffset = Math.PI / 4 // w+a
            } else if (keys[D]) {
                directionOffset = - Math.PI / 4 // w+d
            }
        } else if (keys[S]) {
            if (keys[A]) {
                directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
            } else if (keys[D]) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
            } else {
                directionOffset = Math.PI // s
            }
        } else if (keys[A]) {
            directionOffset = Math.PI / 2 // a
        } else if (keys[D]) {
            directionOffset = - Math.PI / 2 // d
        }

        return directionOffset
    }
}