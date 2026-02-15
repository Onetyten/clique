import { useSelector } from 'react-redux'
import type { RootState } from '../../../../util/store'

export default function ChatContainer() {
    const messages = useSelector((state:RootState)=>state.messages.messages)
    const user = useSelector((state:RootState)=>state.user.user)

  return (
    <div className="flex-1 w-full overflow-y-auto hide-scrollbar p-2 sm:p-6 space-y-2">
        <div id="chatContainer" className="flex-1 sm:text-xs text-base pb-20 w-full overflow-y-auto hide-scrollbar space-y-2">
            {messages.map((item,index)=>{
                return(
                    <div key={index} className={`w-full flex ${item.user.id===user?.id?"justify-end":"justify-start"} gap-2 items-start`}>
                        {item.user.id !== user?.id &&
                            <div className="size-11 flex-shrink-0 uppercase rounded-full text-white text-xl flex justify-center items-center" style={{backgroundColor:item.user.hex_code}}>
                                {item.user.name.slice(0,1)}
                            </div>}
                        <p className={`p-3 ${item.user.id===user?.id?"rounded-tr-none bg-accent-blue text-white":"rounded-tl-none bg-background text-text-primary"} text-sm max-w-[80%]  rounded-xl`}>{item.message}</p>
                    </div>
                )
            })}

        </div>
    </div>
  )
}
