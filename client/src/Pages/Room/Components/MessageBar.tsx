/* eslint-disable @typescript-eslint/no-unused-vars */
import { MessageSquare, Mic, Send, Zap } from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../../util/store'
import { socket } from '../../../util/socket'
import { addMessage, type newMessageType } from '../../../store/messageSlice'
import { toast } from 'react-toastify'
import glitchSound from "/public/Audio/glitch.mp3"
import gsap from 'gsap'

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

export default function MessageBar({isAdmin,setChatMode,chatMode,setShowMessageLoader,setShowQuestionForm,triesLeft,setTriesLeft}:propType) {
    const [message,setMessage] = useState("")
    const user = useSelector((state:RootState)=>state.user.user)
    const session = useSelector((state:RootState)=>state.session.session)
    const dispatch = useDispatch()
    const glitchAudioRef = useRef<HTMLAudioElement | null>(null)
    const zapContainerRef = useRef<HTMLDivElement | null>(null);
    const prevTriesRef = useRef(triesLeft);

    useEffect(() => {
        if (!zapContainerRef.current) return;

        if (triesLeft < prevTriesRef.current) {
            const zaps = zapContainerRef.current.children;
            const removedZap = zaps[triesLeft]; // the one about to disappear

            if (removedZap) {
            gsap.to(removedZap, {
                y: -30,
                x: gsap.utils.random(-20, 20),
                opacity: 0,
                scale: 1.5,
                rotation: gsap.utils.random(-180, 180),
                duration: 0.4,
                ease: "power2.out",
            });
            }
        }
        prevTriesRef.current = triesLeft;
    }, [triesLeft]);

    useEffect(()=>{
        glitchAudioRef.current = new Audio(glitchSound)
        // glitchAudioRef.current.volume = 0.5;
    },[])

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

    function answerMessage(){
        if (!user) return
        if (!session){
            setChatMode("chat")
            glitchAudioRef.current?.play()
            toast.info("Please wait until the game starts before answering")
            return
        }
        if (triesLeft<=0){
            glitchAudioRef.current?.play()
            toast.warn("You have used up your attempts ")
            return
        }

        const newTries = triesLeft - 1;
        setTriesLeft(newTries);

        
        const payload = {
            currentSession:session,
            user:user,
            answer:message,
            timeStamp:Date.now()
        };

        socket.emit("questionAnswered",payload);
        const {score,...sender} = {...user};
        const messagePayload = { user:sender,message, timeStamp:Date.now() };

        if (message.toLowerCase().trim() === session.answer.toLowerCase().trim()){
            const newMessage:newMessageType = { ...messagePayload,type: "correct" };
            dispatch(addMessage(newMessage));
        }
        
        else{
            const newMessage:newMessageType = { ...messagePayload, type: "wrong" };
            dispatch(addMessage(newMessage));
            toast.warn(`You have ${newTries} attempt${newTries>1?"s":""} `)
            
        }
    }
    
    function submitMessage(e:FormEvent){
        e.preventDefault();
        if (message.trim().length===0) return;
        if (chatMode==="chat") chatMessage() ;
        else if (chatMode==="answer") answerMessage();
        setMessage("");
    }

  return (
    <div className="bg-background-100 relative z-10  w-full flex flex-col gap-2 px-2 sm:px-6">
        <div className="left-8 top-3.5 font-semibold flex items-center justify-between gap-4 text-xl sm:text-2xl" >
            <div className="flex items-center gap-4">
                <div onClick={()=>{setChatMode("chat")}} className={`flex items-center gap-2 cursor-pointer ${chatMode==="chat"?"text-accent-blue":"text-text-muted"} `}>
                    <MessageSquare/>
                    <p className="text-sm select-none">Chat mode</p>
                </div>
                {!isAdmin &&
                <div onClick={()=>{ setChatMode("answer")}} className={`flex items-center gap-2 cursor-pointer ${chatMode==="answer"?"text-accent-blue":"text-text-muted"} `}>
                    <Mic/>
                    <p className="text-sm select-none">Answer mode</p>
                </div>}
                
            </div>

            {!isAdmin && session &&

           <div ref={zapContainerRef} className="text-white items-center gap-2 flex cursor-pointer">
                {Array.from({ length: triesLeft }).map((_, index) => (
                    <span key={index} className="zap-item">
                        <Zap size={18} />
                    </span>
                ))}
            </div>}

            {isAdmin && !session &&  
            <div  onClick={()=>setShowQuestionForm(true)} className="text-accent-blue items-center gap-2 flex cursor-pointer">
                <Zap/>
                <p className="text-sm font-semibold select-none">New question</p>
            </div>}
        </div>

        <form onSubmit={submitMessage} className="w-full mb-6 relative" action="">
            <input placeholder="Type a message" type="text" value={message} onChange={(e)=>setMessage(e.target.value)} className="bg-background-200 text-sm p-4  focus:outline-0 focus:border-2 rounded-sm border-text-muted text-white placeholder:text-text-muted w-full h-12 2xl:h-14" />

            {message.trim().length>0 && 
            <button type="submit" >
                <Send className="absolute right-3 text-accent-blue text-xl sm:text-2xl top-1/2 -translate-y-1/2"/>
            </button>}
            
        </form>
    </div>
  )
}
