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

//leaderBoard
const leaderBoardContainer = document.createElement('div')
leaderBoardContainer.setAttribute("id", "leaderBoardContainer")
const leaderBoardElements = []


const ppctx = powerPunchDelay.getContext('2d')


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

		this.PPdelay = 1000

		document.body.appendChild(playerIcon)
		document.body.appendChild(playerNickname)
		document.body.appendChild(playerHealthContainer)
		document.body.appendChild(powerPunchDelay)
		document.body.appendChild(leaderBoardContainer)
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
	update(now){

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
	    	console.log(leaderBoardArray)
	    	console.log(leaderBoardArray.length-1, leaderBoardElements.length)
	    	for(let i=0; i<Math.max(leaderBoardArray.length-1, leaderBoardElements.length); i++){
	    		if(leaderBoardArray[i] && leaderBoardArray[i][0]){
	    			if(leaderBoardElements[i]){
	    				leaderBoardElements[i].children[0].innerHTML = `${leaderBoardArray[i][0]}`
	    				leaderBoardElements[i].children[1].innerHTML = `${leaderBoardArray[i][1]}`
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
	    			console.log(leaderBoardElements[i])
	    			leaderBoardElements[i].remove()
	    		}
	    	}



	    }

	}
	setNick(nickname){
		this.nickname = nickname
		playerNickname.innerHTML = `${nickname}`

	}
}