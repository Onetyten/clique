import { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar/Sidebar";
import Banner from "./Components/Banner";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../util/store";
import useRoomSocketListeners from "../../hooks/useRoomSocketListeners";
import { roleID } from "../../util/role";
import MessageBar from "./Components/MessageBar";
import ChatContainer from "./Components/ChatContainer/ChatContainer";
import QuestionForm from "./Components/QuestionForm/QuestionForm";
import QuestionBar from "./Components/QuestionBar/QuestionBar";
import { socket } from "../../util/socket";
import { clearSession } from "../../store/sessionSlice";



export default function Room() {
    const user = useSelector((state:RootState)=>state.user.user)
    const session = useSelector((state:RootState)=>state.session.session)
    const {friendList,setQuestionLoading,questionLoading,roundCount,showBanner} = useRoomSocketListeners()
    const isAdmin = user?.role === roleID.admin
    const [canAnswer,setCanAnswer] = useState(false)
    const [chatMode,setChatMode] = useState<"chat" | "answer">("chat")
    const role = user?.role
    const [triesLeft,setTriesLeft] = useState(0)
    const [showMessageLoader,setShowMessageLoader] = useState(false)
    const [showQuestionForm,setShowQuestionForm] = useState(false)
    const dispatch = useDispatch()
    const [timeLeft,setTimeleft] = useState<number>(60)
    

    useEffect(()=>{
        if (role === roleID.admin){
            setChatMode("chat")
        }
    },[role])

    useEffect(()=>{
        if (!session) return
        const interval = setInterval(()=>{
        const remaining  = (session.end_time-Date.now())/1000

        if (remaining<=0) {
            setTimeleft(0)
            const payload = {currentSession:session,isAnswer:false,user}
            socket.emit("sessionOver",payload)
            dispatch(clearSession())
        }
            setTimeleft(remaining)
        },1000)
        return ()=> clearInterval(interval)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[session])


return (
    <main className="bg-background-100 w-screen max-w-screen h-dvh flex">
        <Sidebar friendList={friendList}/>
        {showBanner && <Banner roundCount={roundCount}/>}

        <div className="relative min-h-dvh flex-1 flex flex-col w-full">

            {session && <QuestionBar timeLeft = {timeLeft} /> }

            <div className="absolute inset-0 pointer-events-none blur-3xl opacity-20 flex justify-center items-center z-0 overflow-hidden">
                <div id="pulser" className="blob bg-accent-blue w-80 h-80 rounded-full animate-pulse"></div>
            </div>

            <ChatContainer/>

            <MessageBar setShowQuestionForm={setShowQuestionForm} showMessageLoader={showMessageLoader} setShowMessageLoader={setShowMessageLoader} triesLeft={triesLeft} setTriesLeft={setTriesLeft} isAdmin={isAdmin} canAnswer={canAnswer} setCanAnswer={setCanAnswer} chatMode={chatMode} setChatMode={setChatMode} />

            {showQuestionForm && user?.role === roleID.admin && session === null && <QuestionForm setQuestionLoading={setQuestionLoading} questionLoading={questionLoading} setShowQuestionForm={setShowQuestionForm}/>}
            
        </div>
    </main>
  )
}
