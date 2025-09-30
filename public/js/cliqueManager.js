/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const socket = io();
let memberList = [];
const messageList = [];
const memberContainers = document.querySelectorAll(".memberListContainer");
const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggleSidebar");
const roomNameEl = document.getElementById("roomName");
const sidebarHeadEl = document.getElementById("sidebar-head");
const messageForm= document.getElementById("message-form");
const messageInput= document.getElementById("message-input");
const chatContainer = document.getElementById("chatContainer");
const QuestionBtn = document.getElementById("question-Button");
const questionContainer = document.getElementById("question-form-container");
const questionCancelBtn = document.getElementById("question-cancel-btn");
const questionInput = document.getElementById("question-input");
const answerInput = document.getElementById("answer-input");
const askBtn = document.getElementById("ask-btn");
const gameQuestionCtn = document.getElementById("game-question-container");
const gameQuestionEl = document.getElementById("game-question-el");
const questionLoadingDots = document.getElementById("question-loading-dots")
const counterBanner = document.getElementById("counter-banner")
const bannerNumberEl = document.getElementById("banner-num")
// let questionDisabled = JSON.parse(sessionStorage.getItem('questionDisabled')) || false;
let questionDisabled = false;
const countdownEl = document.getElementById("countdown-el");
const countdownContainer = document.getElementById("countdown-ctn");
let inSession = false;
let isAnswerMode = false;
const questionModeBtn = document.getElementById("questionmode-btn");
const answerModeBtn = document.getElementById("answermode-btn");
const messageLoader = document.getElementById("message-loader")
let questionInterval;
let currentEndTime;
let triesLeft = 3;
// general setup
let isCollapsed = false;
const room = JSON.parse(sessionStorage.getItem("room"));
const user = JSON.parse(sessionStorage.getItem("user"))
const color = JSON.parse(sessionStorage.getItem("color"))
let currentSession = JSON.parse(sessionStorage.getItem("currentSession"))
const mobileMiniSidebarBtn = document.getElementById("open-mobile-sidebar");
const mobileSidebar = document.getElementById("mobile-sidebar");
const mobileSidebarCloser = document.getElementById("mobile-sidebar-closer");
const pulser = document.getElementById("pulser")

window.addEventListener('DOMContentLoaded',async()=>{ 
    console.log(roomName)
    if (room && user) {
        socket.emit("joinClique", {cliqueKey: room.clique_key,
            username: user.name, isFirstConn: false
        });
    }
    if (user && user.role === 2) { 
        answerModeBtn.classList.add("hidden")
        document.getElementById("question-Button").classList.remove("hidden");
        document.getElementById("question-Button").classList.add("flex");
    }
    getMemberList()
})

async function getMemberList () {
    try {
        const response = await fetch(`/room/guests/fetch/${encodeURIComponent(room.name)}`)
        const data = await response.json()
        if (!response.ok){
            console.log(data.message)
            return toastr.error(data.message)
        }
        console.log(data.members)
        if (data.members.length>0){
            memberList = data.members
            const getUserFromMember = data.members.filter(data=>data.id == user.id)[0]
            if (getUserFromMember.role == 1){
                document.getElementById("question-Button").classList.add("hidden");
                document.getElementById("question-Button").classList.remove("flex");
                answerModeBtn.classList.remove("hidden")
                answerModeBtn.classList.add("flex")
                user.role = 1
            }
            else {
                document.getElementById("question-Button").classList.remove("hidden");
                document.getElementById("question-Button").classList.add("flex");
                answerModeBtn.classList.add("hidden")
                answerModeBtn.classList.remove("flex")
                user.role = 2
            }
            sessionStorage.setItem('user', JSON.stringify(user));
            renderSidebarMembers()
            if (isCollapsed){
                document.querySelectorAll(".hideOnCollapse").forEach(el => {
                    el.classList.add("hidden");
                });
            }
        }
        return
    } 
    catch (error) {
        console.log('error fetching members',error)
        return toastr.error('error fetching members')
    }
}

function renderSidebarMembers(){
    memberContainers.forEach(container=>{
         container.innerHTML = ""
             memberList.forEach((member) => {
            const memberEl = `
            <div class="flex justify-between  text-sm 2xl:text-base items-center w-full">
                <div class="flex gap-2 justify-center items-center">
                    <div class="w-10 h-10 capitalize rounded-full flex justify-center items-center text-white" style="background-color: ${member.color_hex};">
                        ${member.name.slice(0,1)}
                    </div>
                    <div class="flex  flex-col gap-2">
                        <p class="capitalize hideOnCollapse">${member.name}</p>
                        <p class="text-accent-blue hideOnCollapse">${member.score || 0} pts</p>
                    </div>
                </div>
                <div class="flex gap-2 items-center hideOnCollapse">
                    ${ member.id == user.id? `<div class="w-3 h-3 bg-accent-green rounded-full"></div>` : ""}
                    ${ member.role === 2? `<div class="text-xs 2xl:text-sm text-white px-2 bg-accent-blue rounded-sm">GM</div>`: ""}
                </div>
            </div>`
            container.insertAdjacentHTML("beforeend", memberEl)
        })
    })
}


toggleSidebar.addEventListener("click", () => {
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
        sidebar.classList.remove("w-64");
        sidebar.classList.add("w-16");

        sidebarHeadEl.classList.remove("justify-between");
        sidebarHeadEl.classList.add("flex-col-reverse", "justify-center");
        memberContainers.forEach(container=>{
            container.classList.remove("p-6");
            container.classList.add("p-2");
        })
    

        roomNameEl.textContent = room.name.charAt(0).toUpperCase();

        document.querySelectorAll(".hideOnCollapse").forEach(el => {
            el.classList.add("hidden");
        });
    } else {
        sidebar.classList.remove("w-16");
        sidebar.classList.add("w-64");

        sidebarHeadEl.classList.remove("flex-col-reverse", "justify-center");
        sidebarHeadEl.classList.add("justify-between");
        memberContainers.forEach(container=>{
            container.classList.remove("p-2");
            container.classList.add("p-6");
        })


        roomNameEl.textContent = room.name;

        document.querySelectorAll(".hideOnCollapse").forEach(el => {
            el.classList.remove("hidden");
        });
    }
});

mobileMiniSidebarBtn.addEventListener("click", () => {
    mobileSidebar.classList.remove("hidden")
    mobileSidebar.classList.add("flex")
})
mobileSidebarCloser.addEventListener("click", () => {
    mobileSidebar.classList.add("hidden")
    mobileSidebar.classList.remove("flex")
});


socket.on("userJoined", (data) => {
    toastr.info(data.message);
    getMemberList()
});

socket.on("Error", (data) => {
    toastr.warning(data.message || "Please check your inputs");
})
















// chat related
messageForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    const message = messageInput.value
    if (message.trim().length==0) return
    const payload = {user,message,color:color.hexcode,timeStamp: Date.now()};
    const answerPayload = {currentSession,isAnswer:true,user}
    if (isAnswerMode){
        if (triesLeft<=0) toastr.warning("You have used up your attempts")
        if (message.toLowerCase() == currentSession.answer.toLowerCase()){
            socket.emit("sessionOver", answerPayload);
            messageLoader.classList.remove("hidden")
            messageLoader.classList.add("flex")
        }
        else{
            triesLeft--
            triesLeft<=0? toastr.warning(`Incorrect, You have used up your attempts`):triesLeft == 1? toastr.warning(`You have ${triesLeft} attempt left`): toastr.warning(`You have ${triesLeft} attempts left`)
            toastr.warning(`You have ${triesLeft} attempts left`)
            socket.emit("answeredIncorrectly", payload);
            renderIncorrectMessage(payload)
        }
    }
    else{
        socket.emit("ChatMessage", payload);
        messageLoader.classList.remove("hidden")
        messageLoader.classList.add("flex")
    }
    messageInput.value = ""
})

socket.on("messageSuccess",(data)=>{
    messageLoader.classList.add("hidden")
    messageLoader.classList.remove("flex")
    renderMessage(data)
})

socket.on("messageSent",(data)=>{
    renderMessage(data)
})




function renderMessage({ user: sender, message, color }) {
    const isMe = sender.id === user.id;
    let messageEl;
    if (isMe) {
        messageEl = `
        <div class="w-full flex gap-2 justify-end">
            <p class="max-w-8/10 p-3 text-white text-xs sm:text-base rounded-sm bg-accent-blue">
                ${message}
            </p>
        </div>`;
    } 
    else {
        messageEl = `
        <div class="w-full flex gap-2 justify-start">
            <div class="w-10 h-10 rounded-full flex justify-center items-center text-white"
                 style="background-color: ${color};">
                ${sender.name.charAt(0).toUpperCase()}
            </div>
            <p class="max-w-8/10 p-3 text-xs sm:text-base text-text-primary rounded-sm bg-background">
                ${message}
            </p>
        </div>`;
    }
    chatContainer.insertAdjacentHTML("beforeend", messageEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

















//question related
askBtn.addEventListener("click",()=>{
    if (questionDisabled==true) return toastr.warning("You cannot ask another question until this session is over")
    if (user.role !== 2) return toastr.warning("Only game masters can ask questions wait your turn")
    const question = questionInput.value
    const answer = answerInput.value
    if (question.trim().length ==0) return toastr.warning("Please provide a question")
    if (answer.trim().length ==0) return toastr.warning("Please provide an answer to this question")
    if (question.length >256) return toastr.warning("Question must be less than 256 characters")
    if (answer.length >32) return toastr.warning("Answer must be less than 32 characters")
    const payload = {question,answer,user, endTime: Date.now()+ 60*1000}
    socket.emit("askQuestion",payload)
    askBtn.disabled = true
    askBtn.classList.remove("bg-accent-green")
    askBtn.classList.add("bg-text-muted")
    questionLoadingDots.classList.remove("hidden")
    questionLoadingDots.classList.add("flex")
})

QuestionBtn.addEventListener("click",()=>{
if (questionDisabled==true) return toastr.warning("You cannot ask another question until this session is over")
    questionContainer.classList.remove("hidden")
    questionContainer.classList.add("flex")
})

questionCancelBtn.addEventListener("click",()=>{
    questionContainer.classList.remove("flex")
    questionContainer.classList.add("hidden")
})

function setPulserColor(colorClass) {
    pulser.classList.remove("bg-accent-blue", "bg-error", "bg-accent-green","bg-warning");
    pulser.classList.add(colorClass);
}


function HandleQuestionAsked(data){
    inSession = true
    currentSession = data.session
    renderQuestionInText(data.session)
    sessionStorage.setItem('currentSession',JSON.stringify(currentSession))
    countdownContainer.classList.remove("text-error")
    countdownContainer.classList.add("text-accent-green")
    gameQuestionCtn.classList.remove("hidden")
    gameQuestionCtn.classList.add("flex")
    gameQuestionEl.textContent = data.session.question
    questionInterval = setInterval(()=>{
        const timeLeft = data.session.end_time - Date.now()

        if (timeLeft<=0) return questionTimedOut(data)
        if (timeLeft<30000 && timeLeft>10000){
            setPulserColor("bg-warning");
            countdownContainer.classList.remove("text-accent-green")
            countdownContainer.classList.add("text-warning")
        }
        else if(timeLeft<10000){
            setPulserColor("bg-error");
            countdownContainer.classList.remove("text-warning")
            countdownContainer.classList.add("text-error")
        }
        countdownEl.textContent = (timeLeft/1000).toFixed(0)
    },1000)
}

function renderQuestionInText(session) {
    const isMe = session.id === user.id;
    let messageEl;

    if (isMe) {
        messageEl = `
        <div class="w-full flex gap-2 justify-end">
            <p class="max-w-8/10 p-3 text-white text-xs sm:text-base rounded-sm bg-accent-blue">
               <i class="fa-solid text-sm text-white fa-bolt"></i> Question: ${session.question}
            </p>
        </div>`;
    } 
    else {
        const questionnaire = memberList.filter(user=>user.id == session.gm_id)[0]
        messageEl = `
        <div class="w-full flex gap-2 justify-start">
            <div class="w-10 h-10 rounded-full flex justify-center items-center text-white"
                 style="background-color: ${questionnaire.color_hex};">
                ${questionnaire.name.charAt(0).toUpperCase()}
            </div>
            <p class="max-w-8/10 p-3 text-xs sm:text-base text-white rounded-sm bg-accent-blue">
                <i class="fa-solid text-sm text-white fa-bolt"></i> ${session.question}
            </p>
        </div>`;
    }
    chatContainer.insertAdjacentHTML("beforeend", messageEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function questionFormCleanup(){
    askBtn.disabled = false
    askBtn.classList.add("bg-accent-green")
    askBtn.classList.remove("bg-text-muted")
    questionLoadingDots.classList.add("hidden")
    questionLoadingDots.classList.remove("flex")
}

socket.on("questionSuccess",(data)=>{
    questionFormCleanup()
    if (user.role != 2) return
    console.log("session:",data.session)
    questionContainer.classList.remove("flex")
    questionContainer.classList.add("hidden")
    questionDisabled = true
    sessionStorage.setItem('questionDisabled',JSON.stringify(questionDisabled))
    QuestionBtn.classList.remove("text-accent-blue")
    QuestionBtn.classList.add("text-text-muted")
    counterBanner.classList.remove("hidden")
    counterBanner.classList.add("flex")
    bannerNumberEl.textContent = `Round ${data.roundNum}`
    setTimeout(()=>{
        counterBanner.classList.add("hidden")
        counterBanner.classList.remove("flex")
    },2000)
    HandleQuestionAsked(data)
})

socket.on("questionAsked",(data)=>{
    HandleQuestionAsked(data)
})

socket.on("questionError", (data) => {
    questionFormCleanup()
    toastr.warning(data.message);
})


questionModeBtn.addEventListener("click",()=>{
    if (isAnswerMode == false) return
    isAnswerMode = false
    questionModeBtn.classList.add("text-accent-blue")
    questionModeBtn.classList.remove("text-text-muted")
    answerModeBtn.classList.remove("text-accent-blue")
    answerModeBtn.classList.add("text-text-muted")
})

answerModeBtn.addEventListener("click",()=>{
    if (isAnswerMode == true) return
    if (user.role == 2) return toastr.info("Game masters cannot answer questions")
    if (!inSession) return toastr.info("You can only switch to answer mode during a game session.")
    isAnswerMode = true
    questionModeBtn.classList.remove("text-accent-blue")
    questionModeBtn.classList.add("text-text-muted")
    answerModeBtn.classList.add("text-accent-blue")
    answerModeBtn.classList.remove("text-text-muted")
})

socket.on("questionAnsweredWrong",(data)=>{
     renderIncorrectMessage(data)
})

socket.on("questionAnsweredCorrectly",(data)=>{

})


function renderIncorrectMessage({ user: sender, message, color }) {
    const isMe = sender.id === user.id;
    let messageEl;
    if (isMe) {
        messageEl = `
        <div class="w-full flex gap-2 justify-end">
            <p class="max-w-8/10 p-3 text-xs sm:text-base text-white rounded-sm bg-error">
                ${message}
            </p>
        </div>`;
    }
    else {
        messageEl = `
        <div class="w-full flex gap-2 justify-start">
            <div class="w-10 h-10 rounded-full flex justify-center items-center text-white"
                 style="background-color: ${color};">
                ${sender.name.charAt(0).toUpperCase()}
            </div>
            <p class="max-w-8/10 p-3 text-xs sm:text-base text-white rounded-sm bg-error">
                ${message}
            </p>
        </div>`;
    }
    chatContainer.insertAdjacentHTML("beforeend", messageEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function questionTimedOut(data) {
    const payload = {currentSession,isAnswer:false,user}
    socket.emit("sessionOver",payload)
}

function endTimeOut(){
    clearInterval(questionInterval)
    inSession = false
    isAnswerMode = false
    questionModeBtn.classList.add("text-accent-blue")
    questionModeBtn.classList.remove("text-text-muted")
    answerModeBtn.classList.remove("text-accent-blue")
    answerModeBtn.classList.add("text-text-muted")
    // countdownEl.textContent = 0
}

socket.on("timeoutHandled", (data) => {
    console.log(data)
    endTimeOut()
    gameQuestionEl.textContent = `Time's up,the right answer is: \n ${data.session.answer}`
    toastr.info("Time's up")
    toastr.success(data.adminMessage)
    currentSession.is_active = false
    sessionStorage.setItem('currentSession',JSON.stringify(currentSession))
    sessionStorage.setItem('questionDisabled',JSON.stringify(questionDisabled))
    questionDisabled = false
    QuestionBtn.classList.add("text-accent-blue")
    QuestionBtn.classList.remove("text-text-muted")
    getMemberList();
    setTimeout(()=>{
        gameQuestionCtn.classList.add("hidden")
        gameQuestionCtn.classList.remove("flex")
        counterBanner.classList.remove("hidden")
        counterBanner.classList.add("flex")
        bannerNumberEl.textContent = `Round ${data.roundNum} Over`
        setTimeout(()=>{
            counterBanner.classList.add("hidden")
            counterBanner.classList.remove("flex")
            setPulserColor("bg-accent-blue");
        },2000)

    },5000)
    counterBanner.classList.remove("hidden")
    counterBanner.classList.add("flex")
    bannerNumberEl.textContent = data.roundNum

})


socket.on("answerCorrect", (data) => {
    endTimeOut()
    setPulserColor("bg-accent-green")
    gameQuestionEl.textContent = `The correct answer is: \n ${data.session.answer}`
    messageLoader.classList.add("hidden")
    messageLoader.classList.remove("flex")
    console.log(data)
    toastr.success(data.message)
    setTimeout(()=>{
        toastr.success(data.adminMessage)
        gameQuestionCtn.classList.add("hidden")
        gameQuestionCtn.classList.remove("flex")
        counterBanner.classList.remove("hidden")
        counterBanner.classList.add("flex")
        bannerNumberEl.textContent = `Round ${data.roundNum} Over`
        setTimeout(()=>{
            counterBanner.classList.add("hidden")
            counterBanner.classList.remove("flex")
            setPulserColor("bg-accent-blue");
        },2000)
    },3000)
    currentSession.is_active = false
    sessionStorage.setItem('currentSession',JSON.stringify(currentSession))
    sessionStorage.setItem('questionDisabled',JSON.stringify(questionDisabled))
    questionDisabled = false
    QuestionBtn.classList.add("text-accent-blue")
    QuestionBtn.classList.remove("text-text-muted")
    getMemberList();
    renderCorrectMessage(data)
  
})

function renderCorrectMessage(data) {
    console.log('renderMessage:',data)
    const isMe = data.correctUser.id === user.id;
    const hexCode = memberList.filter(user=>user.id == data.correctUser.id)[0].color_hex
    let messageEl;
    if (isMe) {
        messageEl = `
        <div class="w-full flex gap-2 justify-end">
            <p class="max-w-8/10 p-3 text-xs sm:text-base text-background rounded-sm bg-accent-green">
                ${data.session.answer}
            </p>
        </div>`;
    }
    else {
        messageEl = `
        <div class="w-full flex gap-2 justify-start">
            <div class="w-10 h-10 rounded-full flex justify-center items-center text-white"
                 style="background-color: ${hexCode||'#63D6B0'};">
                ${data.correctUser.name.charAt(0).toUpperCase()}
            </div>
            <p class="max-w-8/10 p-3 text-xs sm:text-base text-background rounded-sm bg-accent-green">
                ${data.session.answer}
            </p>
        </div>`;
    }
    chatContainer.insertAdjacentHTML("beforeend", messageEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}