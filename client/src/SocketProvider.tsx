import React from 'react'
import useGlobalSocketListeners from './hooks/useGlobalSocketListeners'
import { SocketContext } from './SocketContext'

interface propType{
  children:React.ReactNode
}

export default function SocketProvider({children}:propType) {
  const socketState = useGlobalSocketListeners()

  return (
    <SocketContext.Provider value={socketState}>
      {children}
    </SocketContext.Provider>
  )
}
