
import { useRef } from 'react'
import type { userType } from '../../../../types/types'
import SidebarItem from './sidebarItem'
import gsap from "gsap"
import {useGSAP} from "@gsap/react"

gsap.registerPlugin(useGSAP)

interface propType{
    friendList:userType[]
    sidebarOpened:boolean
    setOpenSidebar:React.Dispatch<React.SetStateAction<boolean>>
}

export default function MobileSidebar({friendList,setOpenSidebar,sidebarOpened}:propType) {
    const sideBarRef = useRef<HTMLDivElement | null>(null)


    useGSAP(()=>{
        const tl = gsap.timeline();
        tl.from(
            sideBarRef.current,
            {width:0,duration:0.4,ease:"none"},
        )
        .from(".sidebar-items",
        { y:40,opacity:0,duration:0.4,stagger:0.2,ease:"power2.out"},"-=0.1"
        )

    },[])

  return (
    <div onClick={()=>setOpenSidebar(false)} className='backdrop-blur-sm flex sm:hidden w-full h-full inset-0 min-h-dvh z-50 absolute'>

        <div ref={sideBarRef} onClick={(e)=>e.stopPropagation()} className={`p-6 w-9/12 pr-3 absolute top-0 left-0 h-full duration-300 text-text-primary flex flex-col items-start justify-start bg-background hide-scrollbar min-h-dvh overflow-y-scroll`}>

            <div className="w-full p-3 flex flex-col gap-4">
                {friendList.map((item,index)=> <div  className='w-full sidebar-items'><SidebarItem friend={item} sidebarOpened={sidebarOpened} key={index}/></div> )}
            </div>
        </div>
    </div>
  )
}