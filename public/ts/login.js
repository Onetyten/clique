const nameInput = document.getElementById("name-input")
const roomIndexInput = document.getElementById("room-index-input")
const joinButtonEl = document.getElementById("join-btn")
const createButtonEl = document.getElementById("create-btn")





function HandleJoinRoom(){
    const username = nameInput.value
    const roomIndex = parseInt(roomIndexInput.value)
    console.log(`user ${username} joined clique ${roomIndex}`)
}

function HandleCreateRoom(){
    const username = nameInput.value
    console.log(`user ${username} created a new clique`) 
}
joinButtonEl.addEventListener('click',HandleJoinRoom)
createButtonEl.addEventListener('click',HandleCreateRoom)