import { useState } from "react"
import {Spinner} from "react-activity"
import "react-activity/dist/library.css"
import { toast } from "react-toastify"
import { socket } from "../../util/socket"
import { useSocketContext } from "../../SocketContext"
import useLoginSocketListeners from "../../hooks/useLoginSocketListeners"


export default function Login() {
    const [username,setUserName] = useState("")
    const [cliqueName,setCliqueName] = useState("")
    const [cliqueKey,setCliqueKey] = useState("")
    const {loading,setLoading} = useSocketContext()
    useLoginSocketListeners(setLoading)

    async function HandleJoinRoom(){
        if (username.trim().length==0) return toast.warn(`Pls provide a name to join a clique`)
        if (cliqueKey.trim().length==0) return toast.warn(`Pls provide a key`)
        if (cliqueName.trim().length==0) return toast.warn(`Pls provide a Clique name`)
        setLoading(true)
        socket.emit("joinClique",{cliqueKey,username,cliqueName})
    }

    async function HandleCreateRoom(){
        if (username.trim().length==0) return toast.warn(`Pls provide a name to create a clique`)
        if (cliqueKey.trim().length==0) return toast.warn(`Pls provide a key`)
        if (cliqueName.trim().length==0) return toast.warn(`What do you want to name your Clique`)
        setLoading(true)
        socket.emit("CreateClique",{cliqueKey,username,cliqueName})
    }

  return (
    <div className="bg-background-100 min-h-dvh flex justify-center items-center">

        <div className="p-4 sm:p-8 text-xs relative sm:text-sm w-10/12 md:w-xl bg-background text-text-primary rounded-sm flex flex-col items-center gap-3">
            {loading && (
                <div className="absolute w-full inset-0 flex justify-center items-center h-full bg-background/80">
                    <Spinner size={30} />
                </div>
            )}
            <p className="text-2xl sm:text-5xl font-bold">Clique</p>
            <p className=" ">Join a Clique or start your own</p>

            <input placeholder="Name" type="text" value={username} onChange={(e)=>setUserName(e.target.value)} className="bg-background-100 p-4 focus:outline-0 focus:border-2 rounded-sm border-text-muted placeholder:text-text-muted w-full sm:w-sm h-14" />

            <input placeholder="Clique Name" value={cliqueName} onChange={(e)=>setCliqueName(e.target.value)} type="text" className="bg-background-100 p-4 focus:outline-0 focus:border-2 rounded-sm border-text-muted placeholder:text-text-muted w-full sm:w-sm h-14" />

            <div className="flex w-full sm:w-sm gap-2">
                <input placeholder="# key" type="password" value={cliqueKey} onChange={(e)=>setCliqueKey(e.target.value)} className="bg-background-100 w-1/2 p-4 focus:outline-0 focus:border-2 rounded-sm border-text-muted placeholder:text-text-muted h-14" />

                <button disabled={loading} onClick={HandleJoinRoom}  className="p-3.5 w-1/2 disabled:bg-text-muted bg-accent-blue hover:bg-accent-blue/80 text-white font-bold rounded-sm">
                    Join Clique
                </button>
            </div>

            <button disabled={loading} onClick={HandleCreateRoom} className="p-3.5 w-full sm:w-sm disabled:bg-text-muted bg-accent-green hover:bg-accent-green/80 text-background font-bold rounded-sm">
                Create Clique
            </button>
            
        </div>

    </div>
  )
}
