import * as THREE from '/assets/js/three.js';


const W = 'KeyW'
const S = 'KeyS'
const A = 'KeyA'
const D = 'KeyD'
const MOUSEL = 'Mouse1'
const MOUSER = 'Mouse3'






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

		this.punched = false
		this.directionOffset = 0
		this.lockAction = 0


		// const
		this.fadeDurations = {
			'Run': 0.3,
			'Idle': 0.2,
			'Punch': 0.1,
			'ShieldIdle': 0.1
		}
		this.runVelocity = 10
		this.animationFactors = {
			'Run': 1.5,
			'Idle': 1,
			'Punch': 2,
			'ShieldIdle': 1
		}


		this.updateCameraTarget(0, 0)
	}

	sendData(socket, keys){
		socket.emit('requestUpdate', [keys, this.walkDirection.x, this.walkDirection.z, {x:this.model.rotation.x, y:this.model.rotation.y, z:this.model.rotation.z}])
	}

	updateMovement(x, y, z, velocity){

	    //move model & camera
	    const deltaX = x - this.model.position.x
	    const deltaZ = z - this.model.position.z

	    this.model.position.set(x, y, z)
	    this.updateCameraTarget(deltaX, deltaZ)
	}

	update(delta, keys, action){

		let play = action

		if(play == "Punch" && Math.abs(this.animationsMap[play].time-0.7)<0.1 && !this.punched){
			console.log(this.animationsMap[play].time)
			this.punched = 1
		}
		// if(play == "Punch" && this.animationsMap[play]._loopCount>0){
		// 	play = "Idle"
		// }
		// if(play !="Punch"){
		// 	this.punched = 0
		// }
		
		

		if(this.currentAction != play){
			const toPlay = this.animationsMap[play]
			const current = this.animationsMap[this.currentAction]


			current.fadeOut(this.fadeDurations[play])
			toPlay.reset().fadeIn(this.fadeDurations[play]).play()

			//console.log(this.animationsMap[this.currentAction])

			this.currentAction = play

		}

		if(this.mixer){
			this.mixer.update(delta * this.animationFactors[this.currentAction])
		}
		if(this.currentAction == 'Run'){
			//calculate towards camera direction
			let angleYCameraDirection = Math.atan2(
                    (this.camera.position.x - this.model.position.x), 
                    (this.camera.position.z - this.model.position.z))


			if(typeof(this.countDirectionOffset(keys)) == 'number'){
				this.directionOffset = this.countDirectionOffset(keys)
			}

			//rotate model
			this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + this.directionOffset)
            this.model.quaternion.rotateTowards(this.rotateQuarternion, 0.2)
            //console.log(this.model.rotation)

            //calculate direction
            this.camera.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, this.directionOffset)
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

	countDirectionOffset(keys) {

		let directionOffset = "nope"

        if (keys[W]) {
            if (keys[A]) {
                directionOffset = Math.PI / 4 // w+a
            } else if (keys[D]) {
                directionOffset = - Math.PI / 4 // w+d
            } else{
            	directionOffset = 0 // w
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
        }else{}

        return directionOffset
    }
}