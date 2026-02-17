/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef, useState } from "react";
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
import MobileToolbar from "./Components/Sidebar/MobileToolbar";
import MobileSidebar from "./Components/Sidebar/MobileSidebar";
import gsap from "gsap";


export default function Room() {
    const vignetteRef = useRef<HTMLDivElement | null>(null);
    const user = useSelector((state:RootState)=>state.user.user)
    const session = useSelector((state:RootState)=>state.session.session)
    const messages = useSelector((state: RootState) => state.messages.messages);
    const [sidebarOpened,setOpenSidebar] = useState(false)
    const {friendList,setQuestionLoading,questionLoading,bannerMessage,triesLeft,setTriesLeft,showBanner,timeLeft,showQuestionForm,setShowQuestionForm} = useRoomSocketListeners()
    const isAdmin = user?.role === roleID.admin
    const [canAnswer,setCanAnswer] = useState(false)
    const [chatMode,setChatMode] = useState<"chat" | "answer">("chat")
    const role = user?.role
    const [showMessageLoader,setShowMessageLoader] = useState(false)


    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.type !== "wrong" || lastMessage.user.id !== user?.id) return;

        if (!vignetteRef.current) return;

        const tl = gsap.timeline();

        tl.to(vignetteRef.current, {
            opacity: 1,
            duration: 0.15,
            ease: "power2.out",
        }).to(vignetteRef.current, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
        });

    }, [messages]);

    useEffect(()=>{
        if (role === roleID.admin){
            setChatMode("chat")
        }
    },[role])

return (
    <main className="bg-background-100 font-semibold w-screen max-w-screen h-dvh flex" >
        <Sidebar friendList={friendList} sidebarOpened={sidebarOpened} setOpenSidebar={setOpenSidebar}/>
        
        {showBanner && <Banner bannerMessage={bannerMessage}/>}

        <div className="relative min-h-dvh bg-background-100 flex-1 flex flex-col w-full">
            <MobileToolbar timeLeft={timeLeft} setOpenSidebar={setOpenSidebar}/>
            {sidebarOpened && <MobileSidebar friendList={friendList} sidebarOpened={sidebarOpened} setOpenSidebar={setOpenSidebar}/>}

            {session && <QuestionBar timeLeft = {timeLeft} /> }

            <div className="absolute inset-0 pointer-events-none blur-3xl opacity-20 flex justify-center items-center z-0 overflow-hidden">
                <div id="pulser" className={`bg-accent-blue ${!session?"bg-accent-blue":timeLeft<10?"bg-error":timeLeft<20?"bg-warning":"bg-accent-blue"} w-80 h-80 rounded-full animate-pulse`}></div>
            </div>

            <div ref={vignetteRef} className="pointer-events-none absolute opacity-0 inset-0 z-[100]" style={{ background: "radial-gradient(circle at center, transparent 10%, rgba(255,0,0,0.2) 100%)",}} ></div>

            <ChatContainer/>

            <MessageBar setShowQuestionForm={setShowQuestionForm} showMessageLoader={showMessageLoader} setShowMessageLoader={setShowMessageLoader} triesLeft={triesLeft} setTriesLeft={setTriesLeft} isAdmin={isAdmin} canAnswer={canAnswer} setCanAnswer={setCanAnswer} chatMode={chatMode} setChatMode={setChatMode} />

            {showQuestionForm && user?.role === roleID.admin && session === null && <QuestionForm setQuestionLoading={setQuestionLoading} questionLoading={questionLoading} setShowQuestionForm={setShowQuestionForm}/>}
            
        </div>
    </main>
  )
}
