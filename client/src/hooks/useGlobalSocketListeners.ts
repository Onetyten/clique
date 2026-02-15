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
    
        socket.on("disconnect", (reason) => {
            // console.log("Socket disconnected:", reason)
            if (reason === "io server disconnect") {
                socket.connect()
            }
        })
    
        socket.on("connect_error", (error) => {
            console.error("Connection error:", error)
        })

        socket.on("Error", (data) => {
            setAuthLoading(false)
            setLoading(false)
            toast.warn(data.message || "Please check your inputs");
        });

        socket.on("Boot Out",(data)=>{
            toast.warn(data.message || "Please, rejoin this room");
            // console.log("Booted out")
            setTimeout(() => {
                navigate(`/`)
                window.location.href = "/"
            }, 1500);
        })

        return () => {
            socket.off("connect")
            socket.off("disconnect")
            socket.off("connect_error")
            socket.off("Error")
            socket.off("Boot Out")
            
        }
    },[])

    return {authLoading,loading,setAuthLoading,setLoading}
}
