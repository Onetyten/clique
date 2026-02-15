import { useSelector } from 'react-redux'
import type { userType } from '../../../../types/types'
import type { RootState } from '../../../../util/store'
import { roleID } from '../../../../util/role'

interface propType{
     friend:userType
     sidebarOpened:boolean
}

export default function SidebarItem({friend,sidebarOpened}:propType) {
    const user = useSelector((state:RootState)=>state.user.user)

  return (
    <div className="flex justify-between text-sm 2xl:text-base items-start w-full">
        <div className="flex gap-2 justify-center items-start">
            <div style={{backgroundColor:friend.hex_code}} className="w-10 h-10 relative cursor-pointer capitalize rounded-full flex justify-center items-center text-white">
                {friend.name.slice(0,1)}

                {!sidebarOpened &&
                    <div className="flex gap-2 absolute bottom-0 right-0 items-center">
                        { user && friend.id === user.id && <div className="w-3 h-3 z-10 bg-accent-green rounded-full"></div> }
                        { friend.role === roleID.admin && <div className="w-3 h-3 absolute right-0 z-0 bg-accent-blue rounded-full"></div>}
                    </div>
                }

            </div>
            {sidebarOpened && 
                <div className={`flex  flex-col gap-2`}>
                    <p className="capitalize">{friend.name}</p>
                    <p className="text-accent-blue">{friend.score || 0} pts</p>
                </div>
            }


        </div>

        {sidebarOpened && <div className="flex gap-2 items-center">
            { user && friend.id === user.id &&
                <div className="w-3 h-3 bg-accent-green rounded-full"></div>
            }
            {  friend.role === 0 && 
                <div className="text-xs 2xl:text-sm text-white px-2 bg-accent-blue rounded-sm">GM</div>
            }
        </div>}
        
    </div>
  )
}
