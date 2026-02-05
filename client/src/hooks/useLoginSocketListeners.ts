import { useEffect, useState } from "react"
import { socket } from "../util/socket"
import { toast } from "react-toastify"
import type { loginDataType } from "../types/types"
// import { useNavigate } from "react-router"



export default function useSocketListeners(){
    const [loading,setLoading] = useState(false)
    // const navigate = useNavigate()

    function handleLogin(data:loginDataType){
        setLoading(false)
        console.log('data',data)
        // const room  = data.room;
        // const user = data.user;
        // const color = data.colorHex
        // sessionStorage.setItem('room', JSON.stringify(room));
        // sessionStorage.setItem('user', JSON.stringify(user));
        // sessionStorage.setItem('color', JSON.stringify(color));
        toast.success(data.message);
        // navigate(`/room?index=${encodeURIComponent(room.name)}`)
    }

    useEffect(()=>{
        if (!socket.connected) socket.connect()
        socket.on("CliqueCreated", (data) => handleLogin(data));

        socket.on("JoinedClique", (data) => handleLogin(data));

        socket.on("midSessionError", (data) => {
            setLoading(false)
            toast.warning(data.message || "A session is currently going on in the clique");
            setTimeout(()=>{
                toast.success("Previous game session is over, you can join clique now")
            },data.timeLeft*1000)
        });

        socket.on("Error", (data) => {
            setLoading(false)
            toast.warning(data.message || "Please check your inputs");
        });

        return () => {
            socket.off("CliqueCreated", handleLogin)
            socket.off("JoinedClique", handleLogin)
            socket.off("midSessionError")
            socket.off("Error")
            socket.disconnect()
        }
        
    },[])

    return {loading,setLoading}
}
