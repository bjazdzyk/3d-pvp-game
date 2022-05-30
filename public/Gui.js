Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};

const iconUrls = {'Bob':"/assets/bobIcon.png", 'Tina':"/assets/tinaIcon.png"}


//playerIcon
const playerIcon = document.createElement("div")
const playerIconUrl = "assets/bobIcon.png"
playerIcon.setAttribute("id", "playerIcon")
playerIcon.style["background-image"] = `url(${playerIconUrl})`


//playerNickname
const playerNickname = document.createElement("div")
playerNickname.setAttribute("id", "playerNickname")


//playerHealthContainer
const playerHealthContainer = document.createElement("div")
playerHealthContainer.setAttribute("id", "playerHealthContainer")


//playerHealthBar
const playerHealthBar = document.createElement("div")
playerHealthBar.setAttribute("id", "playerHealthBar")
playerHealthContainer.appendChild(playerHealthBar)

//powerPunchDelay
const powerPunchDelay = document.createElement('canvas')
powerPunchDelay.setAttribute("id", "powerPunchDelay")
powerPunchDelay.width = 100
powerPunchDelay.height = 100

const ppctx = powerPunchDelay.getContext('2d')

//healDelay
const healDelay = document.createElement('canvas')
healDelay.setAttribute("id", "healDelay")
healDelay.width = 100
healDelay.height = 100

const hctx = healDelay.getContext('2d')

//leaderBoard
const leaderBoardContainer = document.createElement('div')
leaderBoardContainer.setAttribute("id", "leaderBoardContainer")
const leaderBoardElements = []

//deathScreen
const deathScreen = document.createElement('div')
deathScreen.setAttribute("id", "deathScreen")

const reJoinButton = document.createElement('div')
reJoinButton.setAttribute("id", "reJoinButton")

const deathScreenDisplayer = document.createElement('div')
deathScreenDisplayer.setAttribute("id", "deathScreenDisplayer")







export class GuiManager{
	constructor(skin, socket){
		this.socket = socket
		this.nickname = "Unknown"
		this.previousSkin = 'Bob'
		this.playerSkin = skin
		this.maxHealth = 0
		this.hp = 0
		playerHealthContainer.style["width"] = `${this.maxHealth + 10}px`
		playerHealthBar.style["width"] = `${this.hp}px`

		this.leaderBoard = {}
		this.updateLeaderBoard = false

		this.PPtimeStamp = 0
		this.HtimeStamp = 0
		this.PPdelay = 1000
		this.Hdelay = 1000
		this.previousConnectionState = "lobby"
		this.connectionState = "lobby"

		document.body.appendChild(playerIcon)
		document.body.appendChild(playerNickname)
		document.body.appendChild(playerHealthContainer)
		document.body.appendChild(powerPunchDelay)
		document.body.appendChild(healDelay)
		document.body.appendChild(leaderBoardContainer)
		document.body.appendChild(deathScreen)
		document.body.appendChild(reJoinButton)

		reJoinButton.addEventListener('click', (e)=>{
			console.log(reJoinButton.innerHTML)
			if(reJoinButton.innerHTML == "JOIN"){
				
				this.socket.emit('reJoin', {nick:this.nickname, skin:this.skin})
			}
		})
	}

	setMaxHp(value){
		this.maxHealth = value
		this.hp = Math.min(this.hp, this.maxHealth)
		playerHealthContainer.style["width"] = `${this.maxHealth + 10}px`
		playerHealthBar.style["width"] = `${this.hp}px`
	}

	setHp(value){
		this.hp = Math.min(this.maxHealth, value)
		playerHealthBar.style["width"] = `${this.hp}px`
	}
	setPPdelay(now, delay){
		this.PPtimeStamp = now
		this.PPdelay = delay
	}
	setHdelay(now, delay){
		this.HtimeStamp = now
		this.Hdelay = delay
	}
	update(now){
		//power punch delay
		ppctx.clearRect(0, 0, 100, 100)
		ppctx.save();
	    ppctx.beginPath();
	    ppctx.moveTo(50, 50)
	    ppctx.arc(50, 50, 40, 0, 2*Math.PI);
	    ppctx.closePath();
	    ppctx.clip()

	    const PPimageTR = new Image()
		PPimageTR.src = "assets/powerPunchIconTR.png"
	    ppctx.drawImage(PPimageTR, -10, -10, 120, 120)

	    ppctx.beginPath();
	    ppctx.moveTo(50, 50)
	    ppctx.arc(50, 50, 40, 0, 2*Math.PI);
	    ppctx.clip();
	    ppctx.closePath();
	    ppctx.restore();

		ppctx.save();
	    ppctx.beginPath();
	    ppctx.moveTo(50, 50)
	    ppctx.arc(50, 50, 40, 1.5*Math.PI, (2*((now - this.PPtimeStamp)/this.PPdelay)+1.5)*Math.PI);
	    ppctx.closePath();
	    ppctx.clip()

	    const PPimage = new Image()
		PPimage.src = "assets/powerPunchIcon.png"
	    ppctx.drawImage(PPimage, -10, -10, 120, 120)

	    ppctx.beginPath();
	    ppctx.moveTo(50, 50)
	    ppctx.arc(50, 50, 40, 1.5*Math.PI, (2*((now - this.PPtimeStamp)/this.PPdelay)+1.5)*Math.PI);
	    ppctx.clip();
	    ppctx.closePath();
	    ppctx.restore();


	    //heal delay
	    hctx.clearRect(0, 0, 100, 100)
		hctx.save();
	    hctx.beginPath();
	    hctx.moveTo(50, 50)
	    hctx.arc(50, 50, 40, 0, 2*Math.PI);
	    hctx.closePath();
	    hctx.clip()

	    const HimageTR = new Image()
		HimageTR.src = "assets/healIconTR.png"
	    hctx.drawImage(HimageTR, 10, 10, 80, 80)

	    hctx.beginPath();
	    hctx.moveTo(50, 50)
	    hctx.arc(50, 50, 40, 0, 2*Math.PI);
	    hctx.clip();
	    hctx.closePath();
	    hctx.restore();

		hctx.save();
	    hctx.beginPath();
	    hctx.moveTo(50, 50)
	    hctx.arc(50, 50, 40, 1.5*Math.PI, (2*((now - this.HtimeStamp)/this.Hdelay)+1.5)*Math.PI);
	    hctx.closePath();
	    hctx.clip()

	    const Himage = new Image()
		Himage.src = "assets/healIcon.png"
	    hctx.drawImage(Himage, 10, 10, 80, 80)

	    hctx.beginPath();
	    hctx.moveTo(50, 50)
	    hctx.arc(50, 50, 40, 1.5*Math.PI, (2*((now - this.HtimeStamp)/this.Hdelay)+1.5)*Math.PI);
	    hctx.clip();
	    hctx.closePath();
	    hctx.restore();




	    if(this.previousSkin != this.playerSkin){
	    	playerIcon.style["background-image"] = `url(${iconUrls[this.playerSkin]})`
	    	this.previousSkin = this.playerSkin
	    }
	    if(this.updateLeaderBoard){
	    	this.updateLeaderBoard = false

	    	let leaderBoardArray = [[null, -1]]

	    	for(let i in this.leaderBoard){
	    		for(let j=0; j<leaderBoardArray.length; j++){
	    			if(this.leaderBoard[i]){
		    			if(this.leaderBoard[i][1]>leaderBoardArray[j][1]){
		    				leaderBoardArray.insert(j, this.leaderBoard[i])
		    				j = leaderBoardArray.length
		    			}
	    			}
	    		}
	    	}
	    	// console.log(leaderBoardArray)
	    	// console.log(leaderBoardArray.length-1, leaderBoardElements.length)
	    	for(let i=0; i<Math.max(leaderBoardArray.length-1, leaderBoardElements.length); i++){
	    		if(leaderBoardArray[i] && leaderBoardArray[i][0]){
	    			if(leaderBoardElements[i]){
	    				leaderBoardElements[i].children[0].innerHTML = `${leaderBoardArray[i][0]}`
	    				leaderBoardElements[i].children[1].innerHTML = `<b>${leaderBoardArray[i][1]}</b>`
	    			}else{
	    				leaderBoardElements.push(document.createElement("div"))
	    				leaderBoardElements[i].setAttribute("class", "leaderBoardSpot")
	    				
	    				const nick = document.createElement("div")
	    				nick.setAttribute("class", "leaderBoardNick")
	    				nick.innerHTML = `${leaderBoardArray[i][0]}`

	    				const kills = document.createElement("div")
	    				kills.setAttribute("class", "leaderBoardKills")
	    				kills.innerHTML = `<b>${leaderBoardArray[i][1]}</b>`

	    				leaderBoardElements[i].appendChild(nick)
	    				leaderBoardElements[i].appendChild(kills)
	    				leaderBoardContainer.appendChild(leaderBoardElements[i])
	    			}
	    		}else{
	    			//console.log(leaderBoardElements[i])
	    			leaderBoardElements[i].remove()
	    		}
	    	}



	    }

	    if(this.connectionState == 'death'){
	    	deathScreen.style["display"] = "block"
	    	reJoinButton.style["display"] = "block"
	    	if(this.previousConnectionState != "death"){
	    		this.previousConnectionState = "death"
	    		this.deathTimeStamp = Date.now()
	    	}

	    	let reJoinButtonValue = Math.floor(Math.max(0, this.deathTimeStamp + 6000 - Date.now())/1000)
	    	if(reJoinButtonValue == 0){
	    		reJoinButtonValue = "JOIN"
	    	}else{
	    		reJoinButtonValue = `${reJoinButtonValue}`
	    	}
	    	reJoinButton.innerHTML = reJoinButtonValue

	    }else{
		    deathScreen.style["display"] = "none"
		    reJoinButton.style["display"] = "none"
		    this.previousConnectionState = this.connectionState
		    
	    }


	}
	setNick(nickname){
		this.nickname = nickname
		playerNickname.innerHTML = `${nickname}`

	}
}