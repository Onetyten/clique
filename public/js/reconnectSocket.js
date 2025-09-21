
/* eslint-disable no-undef */
const socket = io();
let reconnectAttempts = 0
const maxReconnectAttempts = 10
const initialDelay = 1000



function handleReconnect(){
    if (reconnectAttempts >= maxReconnectAttempts ) {
        return console.log("max reconnection attempts reached")
    }
    const delay  = Math.min(initialDelay * Math.pow(2,reconnectAttempts))

    setTimeout(()=>{
        reconnectAttempts++
        socket.connect()
    },delay)
}

socket.on('connect',()=>{
    console.log("succesfully reconnected")
    reconnectAttempts = 0
})

socket.on('disconnect',(reason)=>{
    console.log('Disconnected:',reason)
    handleReconnect()
})

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`Reconnect attempt #${attemptNumber}`);
});
