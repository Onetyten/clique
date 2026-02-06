import { createContext, useContext } from "react"

interface socketContextType{
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export const SocketContext = createContext<socketContextType|null>(null)

export function useSocketContext(){
  const context  = useContext(SocketContext)
  if (!context){
    throw new Error("UseSocketConetxt must be in socketProvider")
  }
  return context
}