// src/util/socket.ts
import io, { Socket } from "socket.io-client"

const socketUrl = import.meta.env.DEV ? "http://localhost:3500" : undefined

let socket: Socket

if (import.meta.hot) {
  if (!import.meta.hot.data.socket) {
    import.meta.hot.data.socket = io(socketUrl, {
      withCredentials: false,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling']
    })
  }
  socket = import.meta.hot.data.socket
}

else {
  socket = io(socketUrl, {
    withCredentials: false,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling']
  })
}

export { socket }