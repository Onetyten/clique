import { useSelector } from "react-redux"
import type { RootState } from "../../../../util/store"

interface propType{
  timeLeft:number
}

export default function QuestionBar({timeLeft}:propType) {
  const session = useSelector((state:RootState)=>state.session.session)


  if (!session) return
  return (
    <div id="game-question-container" className="bg-background-100 relative z-10 sm:text-base text-sm text-white w-full flex justify-between items-center border-b-2 border-background-200 gap-6 p-3 sm:p-6">
        <div className="text-justify sm:text-base text-xs">
          {session?.question}
        </div>
        
        <div id="countdown-ctn" className={`p-3 rounded-sm ${timeLeft<10?"text-error":timeLeft<20?"text-warning":"text-accent-green"}`}>
            <span id="countdown-el">{timeLeft}</span>s
        </div>
    </div>
  )
}