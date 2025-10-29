/* eslint-disable no-undef */
const socket = io();
const nameInput = document.getElementById("name-input")
const cliqueInput = document.getElementById("clique-name-input")
const cliqueKeyInput = document.getElementById("clique-key-input")
const joinButtonEl = document.getElementById("join-btn")
const createButtonEl = document.getElementById("create-btn")
const spinnerContainer = document.getElementById("spinner-container")

function cleanUp(){
    loadingRoom = false;
    createButtonEl.disabled = false;
    joinButtonEl.disabled = false
    spinnerContainer.classList.add("hidden");
    spinnerContainer.classList.remove("flex");
}



async function HandleCreateRoom(){
    const username = nameInput.value
    const cliqueName = cliqueInput.value
    const cliqueKey = cliqueKeyInput.value
    if (username.trim().length==0) return toastr.warning(`Pls provide a name to create a clique`)
    if (cliqueKey.trim().length==0) return toastr.warning(`Pls provide a key`)
    if (cliqueName.trim().length==0) return toastr.warning(`What do you want to name your Clique`)
    spinnerContainer.classList.remove("hidden");
    spinnerContainer.classList.add("flex");
    createButtonEl.disabled = true;
    socket.emit("CreateClique",{cliqueKey,username,cliqueName})
}

function handleLogin(data){
    cleanUp()
    const room  = data.room;
    const user = data.user;
    const color = data.colorHex
    sessionStorage.setItem('room', JSON.stringify(room));
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('color', JSON.stringify(color));
    toastr.success(data.message);
    window.location.href = `/room?index=${encodeURIComponent(room.name)}`;
}

socket.on("CliqueCreated", (data) => {
    handleLogin(data)
});

socket.on("Error", (data) => {
    cleanUp()
    toastr.warning(data.message || "Please check your inputs");
});

socket.on("midSessionError", (data) => {
    cleanUp()
    toastr.warning(data.message || "A session is currently going on in the clique");
    setTimeout(()=>{
        toastr.success("Previous game session is over, you can join clique now")
    },data.timeLeft*1000)
});


async function HandleJoinRoom(){
    const username = nameInput.value
    const cliqueName = cliqueInput.value
    const cliqueKey = cliqueKeyInput.value
    if (username.trim().length==0) return toastr.warning(`Pls provide a name to join a clique`)
    if (cliqueKey.trim().length==0) return toastr.warning(`Pls provide a key`)
    if (cliqueName.trim().length==0) return toastr.warning(`Pls provide a Clique name`)
    spinnerContainer.classList.remove("hidden");
    spinnerContainer.classList.add("flex");
    joinButtonEl.disabled = true;
    socket.emit("joinClique",{cliqueKey,username,cliqueName})
}

socket.on("JoinedClique", (data) => {
    handleLogin(data)
});



joinButtonEl.addEventListener('click',HandleJoinRoom)
createButtonEl.addEventListener('click',HandleCreateRoom)
