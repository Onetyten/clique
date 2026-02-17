
import { Zap } from 'lucide-react'
import type { messageType } from '../../../../types/types'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useRef } from 'react'
import { useDispatch } from 'react-redux'
import { messageAnimated } from '../../../../store/messageSlice'
import messageSentAudio from "/public/Audio/message-sent.mp3"
import messageReceiptAudio from "/public/Audio/message-received.mp3"
import wrongMessageAudio from "/public/Audio/wrong-answer.mp3"
import correctMessageAudio from "/public/Audio/correct-message.mp3"
import answerAudio from "/public/Audio/answer-timeout.mp3"
import { playSound } from '../../../../hooks/useRoomSocketListeners'


gsap.registerPlugin(useGSAP)


interface propType{
    userId:string | undefined
    text:messageType
}

export default function MessageBubble({userId,text}:propType) {


    const dispatch = useDispatch()
    const isMe = text.user.id===userId
    const isQuestion = text.type=="question" || text.type=== "answer"
    const isWrong = text.type==="wrong"
    const isCorrect = text.type === "correct"
    const bubbleRef = useRef<HTMLDivElement | null >(null)

    const base = "p-3 text-sm sm:max-w-lg max-w-[75%] flex justify-start items-center gap-2 text-wrap rounded-xl font-semibold";
    const position = isMe ? "rounded-tr-none bg-accent-blue text-white" : "rounded-tl-none bg-background text-white";

    const state = isQuestion 
        ? "border-2 border-accent-blue text-text-primary bg-background"
        : isWrong
        ? "border-2 border-error bg-background text-white"
        : isCorrect
        ? "border-2 border-accent-green text-background bg-background"
        : "border-0"

    useGSAP(() => {
        if (!bubbleRef.current) return;
        if (text.animated) return

        dispatch(messageAnimated(text.id))
        if (text.type === "chat" ){
            if (isMe){
                playSound(messageSentAudio,0.4)
            } 
            else{
                playSound(messageReceiptAudio,0.4)
            }
        }
        else if (text.type==="wrong"){
            playSound(wrongMessageAudio,1)
        }
        else if (text.type === "correct"){
            playSound(correctMessageAudio,1)
        }
        else if (text.type === "answer"){
            playSound(answerAudio,1)
        }
        
        gsap.from(bubbleRef.current, {
            opacity: 0,
            y: -40,
            x: isMe ? -30 : 30,
            duration: 0.4,
            ease: "power2.out",
            onStart:()=>{
                gsap.to(bubbleRef.current,{opacity:1,delay:0.25,duration:0.15})
            }
        });
    }, []);
    
  return (
    <div ref={bubbleRef} className={`${base} ${position} ${state}` }>  
        {isQuestion && <span className='text-white'> <Zap size={14}/> </span>}
        {text.message}
    </div>
  )
}
