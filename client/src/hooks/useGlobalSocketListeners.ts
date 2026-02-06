/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import { socket } from "../util/socket"
import { toast } from "react-toastify"
import { useNavigate } from "react-router"


export default function useGlobalSocketListeners(){
    const [authLoading,setAuthLoading] = useState(false)
    const [loading,setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(()=>{
        if (!socket.connected) socket.connect()

        socket.on("Error", (data) => {
            setAuthLoading(false)
            setLoading(false)
            toast.warn(data.message || "Please check your inputs");
        });

        socket.on("Boot Out",(data)=>{
            toast.warn(data.message || "Please, rejoin this room");
            console.log("Booted out")
            setTimeout(() => {
                navigate(`/`)
                window.location.href = "/"
            }, 1500);
        })

        return () => {
            socket.off("Error")
            socket.disconnect()
        }
    },[])

    return {authLoading,loading,setAuthLoading,setLoading}
}
