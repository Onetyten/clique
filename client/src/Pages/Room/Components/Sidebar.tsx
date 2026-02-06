
import { useSelector } from 'react-redux'
import type { RootState } from '../../../util/store'
import type { MemberType } from '../../../types/types'


interface propType{
    friendList:MemberType[]
}

export default function Sidebar({friendList}:propType) {
    const user = useSelector((state:RootState)=>state.user.user)
    const room = useSelector((state:RootState)=>state.room.room)

  return (
    <div className="w-64 transition-all duration-300 text-text-primary hidden lg:flex flex-col items-start justify-start bg-background hide-scrollbar min-h-dvh overflow-y-scroll">
        <div id="sidebar-head" className="mb-3 p-6 text-2xl  w-full gap-6 flex justify-between items-baseline">
            <p id="roomName">{room?.name}</p>
            <i id="toggleSidebar" className="fa-solid fa-bars text-base cursor-pointer"></i>
        </div>  
        <div className="w-full p-3 flex flex-col gap-4">
            {friendList.map((item,index)=>{
                return(
                    <div key={index} className="flex justify-between  text-sm 2xl:text-base items-center w-full">
                        <div className="flex gap-2 justify-center items-center">
                            <div style={{backgroundColor:item.hex_code}} className="w-10 h-10 capitalize rounded-full flex justify-center items-center text-white">
                                {item.name.slice(0,1)}
                            </div>
                            <div className="flex  flex-col gap-2">
                                <p className="capitalize">{item.name}</p>
                                <p className="text-accent-blue">{item.score || 0} pts</p>
                            </div>
                        </div>

                        <div className="flex gap-2 items-center hideOnCollapse">
                            { user && item.id === user.id &&
                                <div className="w-3 h-3 bg-accent-green rounded-full"></div>
                            }
                            {  item.role === 0 && 
                                <div className="text-xs 2xl:text-sm text-white px-2 bg-accent-blue rounded-sm">GM</div>
                            }
                        </div>
                        
                    </div>
                )
            })}
        </div>
    </div>
  )
}
