import io from "socket.io-client"

const sockerUrl = import.meta.env.DEV?"http://localhost:3500":undefined
export const socket = io(sockerUrl,{
    withCredentials:false,
    autoConnect:false
})