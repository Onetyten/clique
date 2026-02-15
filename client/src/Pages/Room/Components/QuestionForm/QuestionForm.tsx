import { useState } from "react"
import { Digital } from "react-activity"
import { useSelector } from "react-redux"
import type { RootState } from "../../../../util/store"
import { roleID } from "../../../../util/role"
import { toast } from "react-toastify"
import { socket } from "../../../../util/socket"

interface propType{
    setShowQuestionForm: React.Dispatch<React.SetStateAction<boolean>>
    setQuestionLoading: React.Dispatch<React.SetStateAction<boolean>>
    questionLoading:boolean
}


export default function QuestionForm({setShowQuestionForm,questionLoading,setQuestionLoading}:propType) {
    const [question,setQuestion] = useState("")
    const [answer,setAnswer] = useState("")
    const user = useSelector((state:RootState)=>state.user.user)
    const session = useSelector((state:RootState)=>state.session.session)


    function askQuestion(){
        if (!user) return
        if (session !== null ) return toast.warn("You cannot ask another question until this session is over")
        if (user.role !== roleID.admin) return toast.warn("Only game masters can ask questions wait your turn")

        if (question.trim().length ==0) return toast.warn("Please provide a question")
        if (answer.trim().length ==0) return toast.warn("Please provide an answer to this question")
        if (question.length >256) return toast.warn("Question must be less than 256 characters")
        if (answer.length >32) return toast.warn("Answer must be less than 32 characters")
        const payload = {user,question,answer,endTime: Date.now()+ 60*1000}
        socket.emit("askQuestion",payload)
        setQuestionLoading(true)
    }


  return (
    <div onClick={()=>setShowQuestionForm(false)} className="absolute w-full flex justify-center items-center h-full bg-background/70">
        <div onClick={(e)=>e.stopPropagation()} className="p-6 min-h-80 sm:p-8 w-10/12 sm:w-md bg-background text-sm text-text-primary rounded-sm flex flex-col items-center gap-5">

            <p className="text-2xl sm:text-5xl font-bold">Question</p>

            {questionLoading?(
                <div className="flex text-lg flex-1 justify-between flex-col gap-3 text-accent-blue w-full">

                    <div className="flex flex-col gap-3">
                        <p>Question: <span className="text-text-primary text-base">{question}</span></p>
                        <p>Answer: <span className="text-text-primary text-base">{answer}</span></p>
                    </div>
                    

                    <div id="ask-btn" className="p-3 sm:p-3.5 w-full flex justify-center items-center relative disabled:bg-text-muted bg-text-muted text-white font-bold rounded-sm">
                            <Digital size={25} />
                    </div>
                    
                </div>
            ):(
                <div className="flex flex-col gap-3 w-full">
                    <textarea value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="Question" className="bg-background-100 min-h-14 h-20 max-h-36 p-4 focus:outline-0 focus:border-2 rounded-sm border-text-muted placeholder:text-text-muted w-full sm:w-sm"></textarea>
                

                    <input placeholder="Answer"  value={answer} onChange={(e)=>setAnswer(e.target.value)}  type="text" className="bg-background-100 p-4 focus:outline-0 focus:border-2 rounded-sm border-text-muted placeholder:text-text-muted w-full sm:w-sm h-14" />

                    <div className="flex items-center w-full gap-2">
                        <button onClick={askQuestion} disabled={questionLoading} id="ask-btn" className="p-3 sm:p-3.5 w-full flex justify-center items-center relative disabled:bg-text-muted bg-accent-green hover:bg-accent-green/80 text-background font-bold rounded-sm">
                            Ask
                            
                            <div id="question-questionLoading-dots" className="w-full h-full bg-background/30 flex top-0 left-0 absolute justify-center items-center text-white text-xl gap-2">
                                {questionLoading && <Digital size={25} />}
                            </div>
                        </button>

                        <button onClick={()=>setShowQuestionForm(false)} className="p-3 sm:p-3.5 w-full disabled:bg-text-muted bg-red-500 hover:bg-red-500/80 text-background font-bold rounded-sm">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
           
            

        </div>
    </div>
  )
}
