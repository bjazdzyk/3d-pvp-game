
const joinButton = document.createElement("div")
joinButton.setAttribute("id", "joinButton")
joinButton.style['padding'] = "10px"
joinButton.innerHTML = "JOIN"

export class LobbyManager{
	constructor(socket){
		this.skin = "Bob"
		this.socket = socket
		
		document.body.appendChild(joinButton)

		joinButton.addEventListener('click', (e)=>{
			joinButton.style["display"] = "none"
			this.socket.emit('requestJoin')
		})
	}
}