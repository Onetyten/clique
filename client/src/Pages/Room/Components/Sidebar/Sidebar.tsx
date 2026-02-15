
import { useSelector } from 'react-redux'
import type { RootState } from '../../../../util/store'
import type { userType } from '../../../../types/types'
import SidebarItem from './sidebarItem'
import { PanelRight } from 'lucide-react'
import { useState } from 'react'


interface propType{
    friendList:userType[]
}

export default function Sidebar({friendList}:propType) {
    const room = useSelector((state:RootState)=>state.room.room)
    const [sidebarOpened,setOpenSidebar] = useState(true)

  return (
    <div className={`${sidebarOpened?"w-64":"w-16"} transition-all duration-300 text-text-primary flex flex-col items-start justify-start bg-background hide-scrollbar min-h-dvh overflow-y-scroll`}>

        <div className={`mb-3 text-2xl w-full gap-6 flex ${sidebarOpened?"flex-row items-baseline p-6":"flex-col items-center px-0 py-6"} justify-between `}>
            <p id="roomName">{sidebarOpened?room?.name:room?.name.slice(0,1)}</p>
            <PanelRight onClick={()=>setOpenSidebar(prev=>!prev)} className="cursor-pointer hover:text-accent-blue"/>
        </div>

        <div className="w-full p-3 flex flex-col gap-4">
            {friendList.map((item,index)=> <SidebarItem friend={item} sidebarOpened={sidebarOpened} key={index}/> )}
        </div>
    </div>
  )
}