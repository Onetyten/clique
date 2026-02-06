import { useEffect, useState } from "react"
import { socket } from "../util/socket"
import { toast } from "react-toastify"


export default function useGlobalSocketListeners(){
    const [authLoading,setAuthLoading] = useState(false)
    const [loading,setLoading] = useState(false)

    useEffect(()=>{
        if (!socket.connected) socket.connect()

        socket.on("Error", (data) => {
            setAuthLoading(false)
            setLoading(false)
            toast.warning(data.message || "Please check your inputs");
        });

        return () => {
            socket.off("Error")
            socket.disconnect()
        }
    },[])

    return {authLoading,loading,setAuthLoading,setLoading}
}