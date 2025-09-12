const socket = io();
let memberList = []
const memberContainer = document.getElementById("memberListContainer")
const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggleSidebar");
const roomNameEl = document.getElementById("roomName");
const sidebarHeadEl = document.getElementById("sidebar-head")
const messageForm= document.getElementById("message-form")
const messageInput= document.getElementById("message-input")



let isCollapsed = false;
const room = JSON.parse(sessionStorage.getItem("room"));
const user = JSON.parse(sessionStorage.getItem("user"))


window.addEventListener('DOMContentLoaded',async()=>{ 
    const room = JSON.parse(sessionStorage.getItem("room"))
    const user = JSON.parse(sessionStorage.getItem("user"))
    const roomName = room.name
    console.log(roomName)
    if (room && user) {
        socket.emit("joinClique", {cliqueKey: room.clique_key,
            username: user.name, isFirstConn: false
        });
    }
    if (user && user.role === 2) { 
        document.getElementById("question-Button").classList.remove("hidden");
        document.getElementById("question-Button").classList.add("flex");
    }
    try {
        const response = await fetch(`/room/guests/fetch/${encodeURIComponent(roomName)}`)
        const data = await response.json()
        if (!response.ok){
            console.log(data.message)
            return toastr.error(data.message)
        }
        console.log(data.members)
        if (data.members.length>0){
            memberList = data.members
            renderSidebarMembers()
        }
        return
    } 
    catch (error) {
        console.log('error fetching members',error)
        return toastr.error('error fetching members')
    }
})

function renderSidebarMembers(){
    memberContainer.innerHTML = ""
    memberList.forEach((member) => {
        const memberEl = `
        <div class="flex justify-between items-center w-full">
            <div class="flex gap-2 justify-center items-center">
                <div class="w-10 h-10 capitalize rounded-full flex justify-center items-center text-white" style="background-color: ${member.color_hex};">
                    ${member.name.slice(0,1)}
                </div>
                <p class="capitalize hideOnCollapse">${member.name}</p>
            </div>
            <div class="flex gap-2 items-center hideOnCollapse">
                ${ member.id == user.id? `<div class="w-3 h-3 bg-accent-green rounded-full"></div>` : ""}
                ${ member.role === 2? `<div class="text-sm text-white px-2 bg-accent-blue rounded-sm">GM</div>`: ""}
            </div>
        </div>`
        memberContainer.insertAdjacentHTML("beforeend", memberEl)
    })
}


socket.on("userJoined", (data) => {
    toastr.info(data.message);
    console.log(`${data.newUser.name} joined the room`);
    const alreadyInList = memberList.some(m=>m.id === data.newUser.id)
    if (alreadyInList) return
    memberList.push({ id: data.newUser.id, name: data.newUser.name, role: data.newUser.role || 1,color_hex:data.colorHex.hexcode || '#57A8A8' }); 
    renderSidebarMembers();
});



toggleSidebar.addEventListener("click", () => {
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
        sidebar.classList.remove("w-64");
        sidebar.classList.add("w-16");

        sidebarHeadEl.classList.remove("justify-between");
        sidebarHeadEl.classList.add("flex-col-reverse", "justify-center");

        memberContainer.classList.remove("p-6");
        memberContainer.classList.add("p-2");

        roomNameEl.textContent = room.name.charAt(0).toUpperCase();

        document.querySelectorAll(".hideOnCollapse").forEach(el => {
            el.classList.add("hidden");
        });
    } else {
        sidebar.classList.remove("w-16");
        sidebar.classList.add("w-64");

        sidebarHeadEl.classList.remove("flex-col-reverse", "justify-center");
        sidebarHeadEl.classList.add("justify-between");

        memberContainer.classList.remove("p-2");
        memberContainer.classList.add("p-6");

        roomNameEl.textContent = room.name;

        document.querySelectorAll(".hideOnCollapse").forEach(el => {
            el.classList.remove("hidden");
        });
    }
});

messageForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    const message = messageInput.value
    if (message.trim().length==0) return
    console.log(message)
    socket.emit("ChatMessage",{user,message,timeStamp:Date.now()})
    messageInput.value = ""
})