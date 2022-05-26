const joinContainer = document.createElement("d")
joinContainer.setAttribute("id", "joinContainer")

const nicknameField = document.createElement("input")
nicknameField.setAttribute("id", "nicknameField")
nicknameField.setAttribute("type", "text")
nicknameField.setAttribute("maxLength", "20")
nicknameField.setAttribute("placeholder", "nickname")


const joinButton = document.createElement("div")
joinButton.setAttribute("id", "joinButton")
joinButton.innerHTML = "JOIN"


const skinSwitchRight = document.createElement("div")
skinSwitchRight.setAttribute("id", "skinSwitchRight")
skinSwitchRight.setAttribute("class", "skinSwitch")
skinSwitchRight.innerHTML = ">"

const skinSwitchLeft = document.createElement("div")
skinSwitchLeft.setAttribute("id", "skinSwitchLeft")
skinSwitchLeft.setAttribute("class", "skinSwitch")
skinSwitchLeft.innerHTML = "<"

const skinSwitchContainer = document.createElement("div")
skinSwitchContainer.setAttribute("id", "skinSwitchContainer")


//pointerLock & resize events


export class LobbyManager{
	constructor(socket){
		this.skin = "Bob"
		this.socket = socket
		
		joinContainer.appendChild(nicknameField)
		joinContainer.appendChild(joinButton)

		skinSwitchContainer.appendChild(skinSwitchLeft)
		skinSwitchContainer.appendChild(skinSwitchRight)

		document.body.appendChild(skinSwitchContainer)

		document.body.appendChild(joinContainer)

		joinButton.addEventListener('click', (e)=>{
			joinContainer.style["display"] = "none"
			skinSwitchContainer.style["display"] = "none"
			let nick = "Unknown"
			if(nicknameField.value){
				nick = nicknameField.value
			}
			this.socket.emit('requestJoin', {nick:nick, skin:this.skin})
		})
		skinSwitchRight.addEventListener('click', (e)=>{
			this.changeSelected = 1
		})
		skinSwitchLeft.addEventListener('click', (e)=>{
			this.changeSelected = -1
		})
	}
}