/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar/Sidebar";
import Banner from "./Components/Banner";
import { useSelector } from "react-redux";
import type { RootState } from "../../util/store";
import useRoomSocketListeners from "../../hooks/useRoomSocketListeners";
import { roleID } from "../../util/role";
import MessageBar from "./Components/MessageBar";



export default function Room() {
    const [showBanner,setShowBanner] = useState(false)
    const [bannerVal,setBannerVal] = useState(0)
    const user = useSelector((state:RootState)=>state.user.user)
    const room = useSelector((state:RootState)=>state.room.room)
    const {friendList} = useRoomSocketListeners()
    const isAdmin = user?.role === roleID.admin
    const [canAnswer,setCanAnswer] = useState(false)
    const [chatMode,setChatMode] = useState<"chat" | "answer">("chat")
    const role = user?.role
    const [triesLeft,setTriesLeft] = useState(0)
    const [showMessageLoader,setShowMessageLoader] = useState(false)
    const messages = useSelector((state:RootState)=>state.messages.messages)

    useEffect(()=>{
        if (role === roleID.admin){
            setChatMode("chat")
        }
    },[role])

return (
  <main className="bg-background-100 w-screen max-w-screen h-dvh flex">

    <Sidebar friendList={friendList}/>
    {showBanner && <Banner bannerVal={bannerVal}/>}

    <div className="relative min-h-dvh flex-1 flex flex-col w-full">

        <div id="game-question-container" className="bg-background-100 sm:text-base text-sm text-white w-full hidden justify-between items-center border-b-2 border-background-200 gap-6 p-3 sm:p-6">
            <div id="game-question-el" className="text-justify sm:text-base text-xs"></div>
            
            <div id="countdown-ctn" className="p-3 rounded-sm text-accent-green">
                <span id="countdown-el">60</span>s
            </div>
        </div>

        <div className="absolute w-full h-full bg-background-100/80 backdrop-blur-3xl flex justify-center items-center -z-10"></div>
        <div className="absolute w-full h-full flex justify-center items-center -z-20 overflow-hidden">
            <div id="pulser" className="blob bg-accent-blue w-80 h-80 rounded-full animate-pulse"></div>
        </div>

        <div className="flex-1 w-full overflow-y-auto hide-scrollbar p-2 sm:p-6 space-y-2">
            <div id="chatContainer" className="flex-1 sm:text-xs text-base w-full overflow-y-auto hide-scrollbar space-y-2">
                {messages.map((item,index)=>{
                    return(
                        <div key={index} className={`w-full flex flex-col ${item.user.id===user?.id?"items-end":"items-start"}`}>
                            <p className={`p-3 bg-accent-blue ${item.user.id===user?.id?"rounded-tr-none":"rounded-tl-none"} text-sm text-white rounded-xl`}>{item.message}</p>
                        </div>
                    )
                })}

            </div>
        </div>

        <MessageBar showMessageLoader={showMessageLoader} setShowMessageLoader={setShowMessageLoader} triesLeft={triesLeft} setTriesLeft={setTriesLeft} isAdmin={isAdmin} canAnswer={canAnswer} setCanAnswer={setCanAnswer} chatMode={chatMode} setChatMode={setChatMode} />

        



        <div id="question-form-container" className="absolute w-full hidden justify-center items-center h-full bg-background/70">
            <div className="p-6 sm:p-8 w-10/12 sm:w-md bg-background text-sm text-text-primary rounded-sm flex flex-col items-center gap-3">
                <p className="text-2xl sm:text-5xl font-bold">Question</p>

                <textarea id="question-input" placeholder="Question" className="bg-background-100 min-h-14 h-20 max-h-36 p-4 focus:outline-0 focus:border-2 rounded-sm border-text-muted placeholder:text-text-muted w-full sm:w-sm"></textarea>

                <input id="answer-input" placeholder="Answer" type="text" className="bg-background-100 p-4 focus:outline-0 focus:border-2 rounded-sm border-text-muted placeholder:text-text-muted w-full sm:w-sm h-14" />
                <div className="flex items-center w-full gap-2">
                    <button id="ask-btn" className="p-3 sm:p-3.5 w-full flex justify-center items-center relative disabled:bg-text-muted bg-accent-green hover:bg-accent-green/80 text-background font-bold rounded-sm">
                        Ask
                        <div id="question-loading-dots" className="w-full h-full bg-background/30 hidden top-0 left-0 absolute justify-center items-center gap-2">
                            <div className="dot w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-white"></div>
                            <div className="dot w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-white"></div>
                            <div className="dot w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-white"></div>
                        </div>
                    </button>
                    <button id="question-cancel-btn" className="p-3 sm:p-3.5 w-full disabled:bg-text-muted bg-red-500 hover:bg-red-500/80 text-background font-bold rounded-sm">
                        Cancel
                    </button>
                </div>

            </div>
        </div>
        
    </div>


</main>
  )
}
