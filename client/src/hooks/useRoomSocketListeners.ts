import { useEffect, useState } from "react"
import { socket } from "../util/socket"
import type { RootState } from "../util/store"
import { useSelector } from "react-redux"
import api from "../util/api"
import type { MemberType } from "../types/types"
import { toast } from "react-toastify"


export default function useRoomSocketListeners(){
    const user = useSelector((state:RootState)=>state.user.user)
    const room = useSelector((state:RootState)=>state.room.room)
    const [friendList,setFriendList] = useState<MemberType[]>([])

    async function getFriendList () {
        if (!room || !user) return
        try {
            const res = await api.get(`/room/guests/fetch/${encodeURIComponent(room.name)}`)
            const data = await res.data
            if (data.members.length>0){ setFriendList(data.members) }
            return
        } 
        catch (error) {
            console.log('error fetching members',error)
        }
    }

    useEffect(()=>{
        getFriendList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[room, user])


    
    useEffect(()=>{
        if (room && user) {
            socket.emit("validateToken", {cliqueName: room.name,username: user.name, token:room.token })
        }
        socket.on("userJoined", (data) => {
            toast.info(data.message);
            getFriendList()
        });
        
        return () => {
            socket.off("validateToken")
            socket.off("userJoined")
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    return{friendList}
}