import { useEffect, useState } from "react"
import { socket } from "../util/socket"
import type { RootState } from "../util/store"
import { useDispatch, useSelector } from "react-redux"
import api from "../util/api"
import type { userType } from "../types/types"
import { toast } from "react-toastify"
import { addMessage, type newMessageType } from "../store/messageSlice"
import { clearSession, setSession } from "../store/sessionSlice"
import { setUser } from "../store/userSlice"
import store from "../util/store"

type FetchGuestsResponse = {
    members: userType[];
};

export default function useRoomSocketListeners(){
    const user = useSelector((state:RootState)=>state.user.user)
    const session  = useSelector((state:RootState)=>state.session.session)
    const room = useSelector((state:RootState)=>state.room.room)
    const [friendList,setFriendList] = useState<userType[]>([])
    const [questionLoading,setQuestionLoading] = useState(false)
    const [showBanner,setShowBanner] = useState(false)
    const [roundCount,setRoundCount] = useState(1)
    const dispatch = useDispatch()
    const [timeLeft,setTimeleft] = useState<number>(60)
    const [showQuestionForm,setShowQuestionForm] = useState(false)


    async function getFriendList () {
        if (!room || !user) return
        try {
            const res = await api.get<FetchGuestsResponse>(`/room/guests/fetch/${encodeURIComponent(room.id)}`)
            const data = res.data
            if (data.members.length>0){ setFriendList(data.members) }
            const newUser = data.members.find(member=>member.id === user.id)
            if (!newUser) return
            dispatch(setUser(newUser))
            return
        } 
        catch (error) {
            console.log('error fetching members',error)
        }
    }

    useEffect(()=>{
        getFriendList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    useEffect(() => {
        if (!session) return
        const interval = setInterval(() => {
            setTimeleft(prev => {
                if (prev <= 0) {
                    dispatch(clearSession())
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])
    
    useEffect(()=>{
        if (room && user) {
            if (room && user && room.token) {
                socket.emit("validateToken", {cliqueName: room.name,username: user.name, token:room.token })
            }
        }
        socket.on("userJoined", (data) => {
            toast.info(data.message);
            getFriendList()
        });

        socket.on("messageSent",(data)=>{
            const newMessage:newMessageType = data
            dispatch(addMessage(newMessage))            
        })

        socket.on("reconnect", () => {
            if (room && user && room.token) {
                socket.emit("validateToken", {cliqueName: room.name, username: user.name, token: room.token})
            }
        })

        socket.on("questionError", (data) => {
            dispatch(clearSession())
            setQuestionLoading(false)
            toast.warn(data.message);
        })

        socket.on("questionAsked", (data) => {
            setShowQuestionForm(false)
            dispatch(setSession(data.session))
            setRoundCount(data.roundNum)
            setShowBanner(true)
            setTimeout(()=>{
                setShowBanner(false)
            },2000)
        })

        socket.on("timeoutHandled", (data) => {
            dispatch(clearSession())
            toast.info(data.adminMessage)
            getFriendList()
        })
        socket.on("gameTimeSync", (data) => {
            const session = store.getState().session.session
            if ( !session || (session.id !== data.sessionId)) return
            setTimeleft(data.timeRemaining)
        })
        
        return () => {
            socket.off("reconnect")
            socket.off("validateToken")
            socket.off("userJoined")
            socket.off("messageSent")
            socket.off("questionError")
            socket.off("questionAsked")
            socket.off("timeoutHandled")
            socket.off("gameTimeSync")
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    return{friendList,setQuestionLoading,questionLoading,roundCount,showBanner,timeLeft,showQuestionForm,setShowQuestionForm}
}