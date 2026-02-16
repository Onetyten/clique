
import type { userType } from '../../../../types/types'
import SidebarItem from './sidebarItem'


interface propType{
    friendList:userType[]
    sidebarOpened:boolean
    setOpenSidebar:React.Dispatch<React.SetStateAction<boolean>>
}

export default function MobileSidebar({friendList,setOpenSidebar,sidebarOpened}:propType) {

  return (
    <div onClick={()=>setOpenSidebar(false)} className='backdrop-blur-sm flex sm:hidden w-full h-full inset-0 min-h-dvh z-50 absolute'>

        <div onClick={(e)=>e.stopPropagation()} className={`transition-all w-9/12 p-6 pr-3 absolute top-0 left-0 h-full duration-300 text-text-primary flex flex-col items-start justify-start bg-background hide-scrollbar min-h-dvh overflow-y-scroll`}>


            <div className="w-full p-3 flex flex-col gap-4">
                {friendList.map((item,index)=> <SidebarItem friend={item} sidebarOpened={sidebarOpened} key={index}/> )}
            </div>
        </div>
    </div>
  )
}