/* eslint-disable @typescript-eslint/no-unused-vars */
import { MessageSquare, Mic, Send, Zap } from 'lucide-react'
import type React from 'react'
import { useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../../util/store'
import { socket } from '../../../util/socket'
import { addMessage, type newMessageType } from '../../../store/messageSlice'

interface propType{
    isAdmin:boolean
    chatMode:"chat" | "answer"
    canAnswer:boolean
    triesLeft:number
    setTriesLeft:React.Dispatch<React.SetStateAction<number>>
    setCanAnswer: React.Dispatch<React.SetStateAction<boolean>>
    setChatMode:React.Dispatch<React.SetStateAction<"chat" | "answer">>
    showMessageLoader:boolean
    setShowMessageLoader: React.Dispatch<React.SetStateAction<boolean>>
    setShowQuestionForm: React.Dispatch<React.SetStateAction<boolean>>
}

export default function MessageBar({isAdmin,setChatMode,chatMode,setShowMessageLoader,setShowQuestionForm}:propType) {
    const [message,setMessage] = useState("")
    const user = useSelector((state:RootState)=>state.user.user)
    const dispatch = useDispatch()

    function chatMessage(){
        if (!user) return
        const {score,...sender} = {...user}
        const payload = {
            user:sender,
            message,
            timeStamp:Date.now()
        };
        const newMessage:newMessageType = { ...payload,type: "chat" }
        dispatch(addMessage(newMessage))
        socket.emit("ChatMessage", payload);
        setShowMessageLoader(true)
    }
    
    function submitMessage(e:FormEvent){
        e.preventDefault()
        if (message.trim().length===0) return
        if (chatMode==="chat") chatMessage()    
        setMessage("")
    }


  return (
    <div className="bg-background-100 w-full flex flex-col gap-2 px-2 sm:px-6">
        <div className="left-8 top-3.5 flex items-center justify-between gap-4 text-xl sm:text-2xl" >
            <div className="flex items-center gap-4">
                <div onClick={()=>{setChatMode("chat")}} className={`flex items-center gap-2 cursor-pointer ${chatMode==="chat"?"text-accent-blue":"text-text-muted"} `}>
                    <MessageSquare/>
                    <p className="text-sm">Chat mode</p>
                </div>
                {!isAdmin &&
                <div onClick={()=>{ setChatMode("answer")}} className={`flex items-center gap-2 cursor-pointer ${chatMode==="answer"?"text-accent-blue":"text-text-muted"} `}>
                    <Mic/>
                    <p className="text-sm">Answer mode</p>
                </div>}
                
            </div>

            {isAdmin && 
            <div  onClick={()=>setShowQuestionForm(true)} className="text-accent-blue items-center gap-2 flex cursor-pointer">
                <Zap/>
                <p className="text-sm">New question</p>
            </div>}
        </div>

        <form onSubmit={submitMessage} className="w-full mb-6 relative" action="">
            <input placeholder="Type a message" type="text" value={message} onChange={(e)=>setMessage(e.target.value)} className="bg-background-200 text-sm p-4  focus:outline-0 focus:border-2 rounded-sm border-text-muted text-white placeholder:text-text-muted w-full h-12 2xl:h-14" />

            {message.trim().length>0 && 
            <button type="submit" >
                <Send className="absolute right-3 text-accent-green text-xl sm:text-2xl top-1/2 -translate-y-1/2"/>
            </button>}
            
        </form>
    </div>
  )
}
