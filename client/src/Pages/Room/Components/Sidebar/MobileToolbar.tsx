
import { useSelector } from 'react-redux'
import type { RootState } from '../../../../util/store'
import { PanelRight } from 'lucide-react'


interface propType{
    setOpenSidebar:React.Dispatch<React.SetStateAction<boolean>>
    timeLeft:number
}


export default function MobileToolbar({setOpenSidebar,timeLeft}:propType) {
    const room = useSelector((state:RootState)=>state.room.room)
    const session = useSelector((state:RootState)=>state.session.session)

  return (
    <div className={`text-text-primary p-4 flex sm:hidden items-center justify-between gap-6 text-sm bg-background`}>
        <div className='justify-start flex items-center gap-6'>
            <PanelRight onClick={()=>setOpenSidebar(prev=>!prev)} className="cursor-pointer hover:text-accent-blue"/>
            {!session?
            <p className='relative text-lg'>{room?.name.slice(0,32)} </p>
            :
            <div className="text-justify">
                {session.question}
            </div>
            }
        </div>

        {session &&
        <div id="countdown-ctn" className={`p-3 rounded-sm ${timeLeft<10?"text-error":timeLeft<20?"text-warning":"text-accent-green"}`}>
            <span id="countdown-el">{timeLeft}</span>s
        </div> }
            
    </div>
  )
}