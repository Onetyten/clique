/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react"
import { socket } from "../util/socket"
import type { RootState } from "../util/store"
import { useDispatch, useSelector } from "react-redux"
import api from "../util/api"
import type { userType } from "../types/types"
import { toast } from "react-toastify"
import { addMessage, type newMessageType } from "../store/messageSlice"
import { clearSession, setSession } from "../store/sessionSlice"
import { setUser } from "../store/userSlice"
import store from "../util/store"
import joinAudio from "/public/Audio/join.mp3"
import clockTick from "/public/Audio/clock-ticking.mp3"
import clockTickUrgent from "/public/Audio/clock-ticking-urgent.mp3"
import Bell from "/public/Audio/school_bell.mp3"
import pointObtainedAudio from "/public/Audio/points-obtained.mp3"
import confetti from "canvas-confetti";







export function victoryConfetti() {
  const duration = 4 * 1000;
  const end = Date.now() + duration;

  const colors = ["#5865F2", "#57F287"];
  (function frame() {
    confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors, });

    confetti({ particleCount: 2,angle: 120, spread: 55, origin: { x: 1 }, colors, });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}


type FetchGuestsResponse = {
    members: userType[];
};

    export const playSound = (sound:string,volume:number) => {
        const audio = new Audio(sound);
        audio.volume = volume; 
        audio.play();
    };


export default function useRoomSocketListeners(){
    const session  = useSelector((state:RootState)=>state.session.session)
    const [friendList,setFriendList] = useState<userType[]>([])
    const [questionLoading,setQuestionLoading] = useState(false)
    const [showBanner,setShowBanner] = useState(false)
    const [roundCount,setRoundCount] = useState(1)
    const dispatch = useDispatch()
    const TOTAL_TRIES = 3
    const [triesLeft,setTriesLeft]  = useState(TOTAL_TRIES)
    const [timeLeft,setTimeleft] = useState<number>(60)
    const [bannerMessage,setBannerMessage] = useState(`${roundCount}`)
    const [showQuestionForm,setShowQuestionForm] = useState(false)
    const clockRef = useRef<HTMLAudioElement | null>(null);
    const urgentRef = useRef<HTMLAudioElement | null>(null);
    const bellRef = useRef<HTMLAudioElement | null>(null);


    async function sessionCleanUp() {
        setTriesLeft(TOTAL_TRIES)
        setShowQuestionForm(false)
        setQuestionLoading(false)
    }

    async function getFriendList () {
        const room = store.getState().room.room
        const user = store.getState().user.user
        if (!room || !user) return
        try {
            const res = await api.get<FetchGuestsResponse>(`/room/guests/fetch/${encodeURIComponent(room.id)}`)
            const data = res.data
            if (data.members.length>0){ setFriendList(data.members) }
            const newUser = data.members.find(member=>member.id === user.id)
            if (!newUser) return
            dispatch(setUser(newUser))
            return
        } 
        catch (error) {
            console.log('error fetching members',error)
        }
    }
    useEffect(() => {
        clockRef.current = new Audio(clockTick);
        urgentRef.current = new Audio(clockTickUrgent);
        bellRef.current = new Audio(Bell);

        if (clockRef.current) {
            clockRef.current.loop = true;
            clockRef.current.volume = 0.4;
        }

        if (urgentRef.current) {
            urgentRef.current.loop = true;
            urgentRef.current.volume = 0.6;
        }

        if (bellRef.current) {
            bellRef.current.volume = 0.8;
        }

        return () => {
            clockRef.current?.pause();
            urgentRef.current?.pause();
        };
    }, []);


    useEffect(()=>{
        getFriendList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    useEffect(() => {
        if (!session) return;

        clockRef.current?.play();

        const interval = setInterval(() => {
            setTimeleft(prev => {
            if (prev <= 1) {
                clearInterval(interval);
                clockRef.current?.pause();
                urgentRef.current?.pause();
                clockRef.current!.currentTime = 0;
                urgentRef.current!.currentTime = 0;
                bellRef.current?.play();
                dispatch(clearSession());
                setBannerMessage("Time's Up");
                setShowBanner(true);
                return 0;
            }

            return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            clockRef.current?.pause();
            urgentRef.current?.pause();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    const hasSwitchedToUrgent = useRef(false);

    useEffect(() => {
        if (!session) return;

        if (timeLeft <= 10 && !hasSwitchedToUrgent.current) {
            hasSwitchedToUrgent.current = true;

            clockRef.current?.pause();
            urgentRef.current?.play();
        }
    }, [timeLeft, session]);



    useEffect(() => {
        if (!showBanner) return;
        const timeout = setTimeout(() => {
            setShowBanner(false);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [showBanner]);


    useEffect(()=>{
        const validateToken = () => {
            const room = store.getState().room.room
            const user = store.getState().user.user
            if (room && user && room.token) {
                socket.emit("validateToken", { cliqueName: room.name, username: user.name, token: room.token})
            }
        }

        validateToken()
        socket.on("reconnect", validateToken)
        

        const handleUserJoined = (data: any) => {
            playSound(joinAudio,1.0)
            toast.info(data.message)
            getFriendList()
        }
        socket.on("userJoined", handleUserJoined)

        const handleMessageSent = (data: any) => {
            const newMessage: newMessageType = data
            dispatch(addMessage(newMessage))
        }
        socket.on("messageSent", handleMessageSent)

        const handleQuestionError = (data: any) => {
            dispatch(clearSession())
            setQuestionLoading(false)
            toast.warn(data.message)
        }
        socket.on("questionError", handleQuestionError)

        const handleQuestionAsked = (data: any) => {
            setTimeleft(59)
            sessionCleanUp()
            dispatch(setSession(data.session))
            setRoundCount(data.roundNum)
            setBannerMessage(`Round ${data.roundNum} - Let’s Go!`)
            setShowBanner(true)
        }
        socket.on("questionAsked", handleQuestionAsked)

        const handleTimeoutHandled = (data: any) => {
            sessionCleanUp()
            dispatch(clearSession())
            toast.info(data.adminMessage)
            getFriendList()
        }
         socket.on("timeoutHandled", handleTimeoutHandled)

        const handleAnswerCorrect = (data: any) => {
            const user = store.getState().user.user
            sessionCleanUp()
            dispatch(clearSession())
            getFriendList()
            toast.info(data.adminMessage)
            setBannerMessage(data.message)
            setShowBanner(true)
            playSound(pointObtainedAudio,1)
            if (data.correctUser.id === user?.id){
                victoryConfetti()
            }
            
            

        }

        socket.on("answerCorrect", handleAnswerCorrect)

        const handleGameTimeSync = (data: any) => {
            const currentSession = store.getState().session.session
            if (!currentSession || (currentSession.id !== data.sessionId)) return
            setTimeleft(data.timeRemaining)
        }
        socket.on("gameTimeSync", handleGameTimeSync)        
        
        return () => {
            socket.off("reconnect", validateToken)
            socket.off("userJoined", handleUserJoined)
            socket.off("messageSent", handleMessageSent)
            socket.off("questionError", handleQuestionError)
            socket.off("questionAsked", handleQuestionAsked)
            socket.off("timeoutHandled", handleTimeoutHandled)
            socket.off("gameTimeSync", handleGameTimeSync)
            socket.off("answerCorrect", handleAnswerCorrect)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    return{friendList,setQuestionLoading,questionLoading,roundCount,bannerMessage,showBanner,timeLeft,showQuestionForm,setShowQuestionForm,triesLeft,setTriesLeft}
}