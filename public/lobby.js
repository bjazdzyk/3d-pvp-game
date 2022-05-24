
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

export class LobbyManager{
	constructor(socket){
		this.skin = "Bob"
		this.socket = socket
		
		joinContainer.appendChild(nicknameField)
		joinContainer.appendChild(joinButton)

		document.body.appendChild(joinContainer)

		joinButton.addEventListener('click', (e)=>{
			joinContainer.style["display"] = "none"
			let nick = "Unknown"
			if(nicknameField.value){
				nick = nicknameField.value
			}
			console.log(nick)
			this.socket.emit('requestJoin', nick)
		})
	}
}