console.log("GuiGui")


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
playerHealthBar.style["width"] = "150px"

playerHealthContainer.appendChild(playerHealthBar)
