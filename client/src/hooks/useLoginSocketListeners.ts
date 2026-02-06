import React, { useEffect } from "react"
import { socket } from "../util/socket"
import { toast } from "react-toastify"
import type { loginDataType } from "../types/types"
import {useDispatch} from "react-redux"
import { setUser } from "../store/userSlice"
import { setRoom } from "../store/roomSlice"
import { useNavigate } from "react-router"


export default function useLoginSocketListeners(setLoading:React.Dispatch<React.SetStateAction<boolean>>){
    const dispatch = useDispatch()
    const navigate = useNavigate()

    function handleLogin(data:loginDataType){
        if (!data) return
        setLoading(false)
        dispatch(setUser(data.user))
        dispatch(setRoom(data.room))
        toast.success(data.message);
        navigate(`/room?index=${encodeURIComponent(data.room.name)}`)
    }

    useEffect(()=>{
        if (!socket.connected) socket.connect()
        socket.on("CliqueCreated", handleLogin);

        socket.on("JoinedClique", handleLogin);

        socket.on("midSessionError", (data) => {
            setLoading(false)
            toast.warning(data.message || "A session is currently going on in the clique");
            setTimeout(()=>{
                toast.success("Previous game session is over, you can join clique now")
            },data.timeLeft*1000)
        });

        return () => {
            socket.off("CliqueCreated", handleLogin)
            socket.off("JoinedClique", handleLogin)
            socket.off("midSessionError")
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

}