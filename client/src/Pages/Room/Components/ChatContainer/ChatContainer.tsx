import { useSelector } from 'react-redux'
import type { RootState } from '../../../../util/store'
import { Zap } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function ChatContainer() {
    const messages = useSelector((state:RootState)=>state.messages.messages)
    const user = useSelector((state:RootState)=>state.user.user)
    const chatContainerRef = useRef<HTMLDivElement | null >(null)

    useEffect(()=>{
        if (!chatContainerRef.current) return
        chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: "smooth"
        })
    },[messages.length])


  return (
    <div ref={chatContainerRef} className="flex-1 w-full relative z-10 overflow-y-auto overflow-x-hidden hide-scrollbar p-2 sm:p-6 space-y-2">
        <div className="flex-1 sm:text-xs text-base pb-20 pt-6 w-full overflow-y-auto overflow-x-hidden hide-scrollbar space-y-2">
            {messages.map((item,index)=>{
                const isMe = item.user.id===user?.id
                const isQuestion = item.type=="question" || item.type=== "answer"
                const isWrong = item.type==="wrong"
                const isCorrect = item.type === "correct"
                return(
                    <div key={index} className={`w-full flex ${isMe?"justify-end":"justify-start"} gap-2 items-start`}>
                        {!isMe &&
                            <div className="size-11 flex-shrink-0 uppercase rounded-full text-white text-xl flex justify-center items-center" style={{backgroundColor:item.user.hex_code}}>
                                {item.user.name.slice(0,1)}
                            </div>
                        }
                        <div className={
                            `p-3 ${isMe?
                            `${isQuestion?
                            "border-2 text-text-primary font-semibold border-accent-blue bg-background"
                            :isWrong?"border-error bg-background border-2 text-white font-semibold"
                            :isCorrect?"border-2 bg-background border-accent-green text-background font-semibold"
                            :"border-0"} bg-accent-blue text-white font-semibold rounded-tr-none `
                            :
                            `rounded-tl-none 
                            ${isQuestion?
                            "border-2 text-text-primary font-semibold border-accent-blue bg-background"
                            :isWrong?"border-error border-2 text-white font-semibold"
                            :isCorrect?"border-2 border-accent-green text-background font-semibold"
                            :"border-0"} bg-background text-white font-semibold` } text-sm max-w-[80%] flex justify-start items-center gap-2 text-wrap rounded-xl`}>
                                
                            {isQuestion && <span className='text-white'> <Zap size={14}/> </span>}
                            {item.message}
                        </div>
                    </div>
                )
            })}

        </div>
    </div>
  )
}
