/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import Sidebar from "./Components/Sidebar";
import Banner from "./Components/Banner";
import {PanelRight} from "lucide-react"



export default function Room() {
    const [showBanner,setShowBanner] = useState(false)
    const [bannerVal,setBannerVal] = useState(0)


  return (
  <main className="bg-background-100 w-screen max-w-screen h-dvh flex">

    <Sidebar/>
    {showBanner && <Banner bannerVal={bannerVal}/>}





    <div className="hide-scrollbar relative min-h-dvh flex-1 flex flex-col w-full">

        <div className="w-full bg-background text-text-primary flex items-center justify-start gap-3 lg:hidden p-3"> 
            <PanelRight className="text-accent-blue cursor-pointer text-2xl" />
            <p id="roomName"></p>
        </div>

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

            </div>
            
            <div id="message-loader" className="w-full hidden gap-2 justify-end">
                <div className="w-20 h-10 text-white rounded-sm bg-accent-blue">
                    <div className="w-full h-full flex top-0 left-0 justify-center items-center gap-2">
                        <div className="dot w-2 h-2 rounded-full bg-white"></div>
                        <div className="dot w-2 h-2 rounded-full bg-white"></div>
                        <div className="dot w-2 h-2 rounded-full bg-white"></div>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-background-100 w-full flex flex-col gap-2 px-2 sm:px-6">
            <div className="left-8 top-3.5 flex items-center justify-between gap-4 text-xl sm:text-2xl" >
                <div className="flex items-center gap-4">
                    <div id="questionmode-btn" className="flex items-center gap-2 cursor-pointer text-accent-blue">
                        <i className="fa-solid fa-comment"></i>
                        <p className="text-xs">Chat mode</p>
                    </div>
                    <div id="answermode-btn" className="flex items-center gap-2 cursor-pointer text-text-muted">
                        <i className="fa-solid fa-microphone"></i>
                        <p className="text-xs">Answer mode</p>
                    </div>
                </div>

                <div id="question-Button" className="text-accent-blue items-center gap-2 hidden cursor-pointer">
                    <p className="text-xs">New question</p>
                    <i className="fa-solid text-sm fa-bolt"></i>     
                </div>
            </div>
            <form id="message-form" className="w-full mb-6 relative" action="">
                <input placeholder="Type a message" type="text" id="message-input" className="bg-background-200 text-sm p-4  focus:outline-0 focus:border-2 rounded-sm border-text-muted text-white placeholder:text-text-muted w-full h-12 2xl:h-14" />
                <button type="submit" className="absolute right-3 text-accent-blue text-xl sm:text-2xl top-1/2 -translate-y-1/2">
                    <i className="fa-solid fa-comment"></i>
                </button>
            </form>
        </div>

        



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
