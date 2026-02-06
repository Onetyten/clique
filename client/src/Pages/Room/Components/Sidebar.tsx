
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router'
import type { RootState } from '../../../util/store'

export default function Sidebar() {
    const [searchParams] = useSearchParams()
    const roomName = searchParams.get("index")
    const user = useSelector((state:RootState)=>state.user.user)
    const room = useSelector((state:RootState)=>state.room.room)
    console.log(room,user)


  return (
    <div>
        <div id="sidebar" className="w-64 transition-all duration-300 text-text-primary hidden lg:flex flex-col items-start justify-start bg-background hide-scrollbar min-h-dvh overflow-y-scroll">
                <div id="sidebar-head" className="mb-3 p-6 text-2xl  w-full gap-6 flex justify-between items-baseline">
                    <p id="roomName">{room?.name} </p>
                    <i id="toggleSidebar" className="fa-solid fa-bars text-base cursor-pointer"></i>
                </div>  
                <div className="w-full memberListContainer p-3 flex flex-col gap-4">
                </div>
        </div>

        <div id="mobile-sidebar" className="fixed text-text-primary inset-0 hidden z-60 lg:hidden">
            <div className="w-8/12 sm:w-64 bg-background min-h-dvh overflow-y-scroll hide-scrollbar">
                <div id="sidebar-head" className="mb-3 p-3 text-xl font-bold w-full gap-3 flex justify-between items-baseline">
                <p id="roomName">{roomName}</p>
                </div>
                <div className="memberListContainer w-full p-3 flex flex-col gap-4"></div>
            </div>
            <div id="mobile-sidebar-closer" className="flex-1 h-full bg-background/40 backdrop-blur-md"></div>
        </div> 
    </div>
   
  )
}
