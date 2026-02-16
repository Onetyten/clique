/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar/Sidebar";
import Banner from "./Components/Banner";
import { useSelector } from "react-redux";
import type { RootState } from "../../util/store";
import useRoomSocketListeners from "../../hooks/useRoomSocketListeners";
import { roleID } from "../../util/role";
import MessageBar from "./Components/MessageBar";
import ChatContainer from "./Components/ChatContainer/ChatContainer";
import QuestionForm from "./Components/QuestionForm/QuestionForm";
import QuestionBar from "./Components/QuestionBar/QuestionBar";


export default function Room() {
    const user = useSelector((state:RootState)=>state.user.user)
    const session = useSelector((state:RootState)=>state.session.session)
    const {friendList,setQuestionLoading,questionLoading,bannerMessage,triesLeft,setTriesLeft,showBanner,timeLeft,showQuestionForm,setShowQuestionForm} = useRoomSocketListeners()
    const isAdmin = user?.role === roleID.admin
    const [canAnswer,setCanAnswer] = useState(false)
    const [chatMode,setChatMode] = useState<"chat" | "answer">("chat")
    const role = user?.role
    const [showMessageLoader,setShowMessageLoader] = useState(false)

    useEffect(()=>{
        if (role === roleID.admin){
            setChatMode("chat")
        }
    },[role])

return (
    <main className="bg-background-100 w-screen max-w-screen h-dvh flex flex-col sm:flex-row" >
        <Sidebar friendList={friendList}/>
        


        {showBanner && <Banner bannerMessage={bannerMessage}/>}

        <div className="relative min-h-dvh flex-1 flex flex-col w-full">

            {session && <QuestionBar timeLeft = {timeLeft} /> }

            <div className="absolute inset-0 pointer-events-none blur-3xl opacity-20 flex justify-center items-center z-0 overflow-hidden">
                <div id="pulser" className={`bg-accent-blue ${!session?"bg-accent-blue":timeLeft<10?"bg-error":timeLeft<20?"bg-warning":"bg-accent-blue"} w-80 h-80 rounded-full animate-pulse`}></div>
            </div>

            <ChatContainer/>

            <MessageBar setShowQuestionForm={setShowQuestionForm} showMessageLoader={showMessageLoader} setShowMessageLoader={setShowMessageLoader} triesLeft={triesLeft} setTriesLeft={setTriesLeft} isAdmin={isAdmin} canAnswer={canAnswer} setCanAnswer={setCanAnswer} chatMode={chatMode} setChatMode={setChatMode} />

            {showQuestionForm && user?.role === roleID.admin && session === null && <QuestionForm setQuestionLoading={setQuestionLoading} questionLoading={questionLoading} setShowQuestionForm={setShowQuestionForm}/>}
            
        </div>
    </main>
  )
}
