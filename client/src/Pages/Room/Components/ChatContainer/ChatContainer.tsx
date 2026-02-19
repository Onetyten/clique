import { useSelector } from 'react-redux'
import type { RootState } from '../../../../util/store'
import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

export default function ChatContainer() {
    const messages = useSelector((state:RootState)=>state.messages.messages)
    const user = useSelector((state:RootState)=>state.user.user)
    const chatContainerRef = useRef<HTMLDivElement | null >(null)

    console.log(messages)

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

                return(
                    <div key={index} className={`w-full flex ${isMe?"justify-end":"justify-start"} gap-2 items-start`}>
                        {!isMe &&
                            <div className="size-11 flex-shrink-0 uppercase rounded-full text-white text-xl flex justify-center items-center select-none" style={{backgroundColor:item.user.hex_code}}>
                                {item.user.name.slice(0,1)}
                            </div>
                        }
                        <MessageBubble userId={user?.id} text={item} />
                    </div>
                )
            })}

        </div>
    </div>
  )
}
