const playerIcon = document.createElement("div")
const playerIconUrl = "assets/icon.png"
playerIcon.setAttribute("id", "playerIcon")
playerIcon.style["background-image"] = `url(${playerIconUrl})`

document.body.appendChild(playerIcon)



const playerHealthContainer = document.createElement("div")
playerHealthContainer.setAttribute("id", "playerHealthContainer")

document.body.appendChild(playerHealthContainer)



const playerHealthBar = document.createElement("div")
playerHealthBar.setAttribute("id", "playerHealthBar")


playerHealthContainer.appendChild(playerHealthBar)

export class HealthManager{
	constructor(maxHealth){
		this.maxHealth = maxHealth
		this.hp = maxHealth
		playerHealthContainer.style["width"] = `${this.maxHealth + 10}px`
		playerHealthBar.style["width"] = `${this.hp}px`
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
}