//playerIcon
const playerIcon = document.createElement("div")
const playerIconUrl = "assets/icon.png"
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


export class GuiManager{
	constructor(maxHealth){
		this.nickname = "Unknown"
		this.maxHealth = maxHealth
		this.hp = maxHealth
		playerHealthContainer.style["width"] = `${this.maxHealth + 10}px`
		playerHealthBar.style["width"] = `${this.hp}px`


		this.PPdelay = 1000

		document.body.appendChild(playerIcon)
		document.body.appendChild(playerNickname)
		document.body.appendChild(playerHealthContainer)
		document.body.appendChild(powerPunchDelay)
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

	}
	setNick(nickname){
		this.nickname = nickname
		playerNickname.innerHTML = `${nickname}`

	}
}