import {Spinner} from "react-activity"
import "react-activity/dist/library.css"


export default function Login() {
  return (
    <div className="bg-background-100 min-h-dvh flex justify-center items-center">

        <div className="p-4 sm:p-8 text-xs relative sm:text-sm w-10/12 md:w-xl bg-background text-text-primary rounded-sm flex flex-col items-center gap-3">

            <div className="absolute w-full inset-0 flex justify-center items-center h-full bg-background/80">
                <Spinner size={30} />
            </div>

            <p className="text-2xl sm:text-5xl font-bold">Clique</p>
            <p className=" ">Join a Clique or start your own</p>

            <input placeholder="Name" type="text" className="bg-background-100 p-4 focus:outline-0 focus:border-2 rounded-sm border-text-muted placeholder:text-text-muted w-full sm:w-sm h-14" />

            <input placeholder="Clique Name" type="text" className="bg-background-100 p-4 focus:outline-0 focus:border-2 rounded-sm border-text-muted placeholder:text-text-muted w-full sm:w-sm h-14" />

            <div className="flex w-full sm:w-sm gap-2">
                <input placeholder="# key" type="password" className="bg-background-100 w-1/2 p-4 focus:outline-0 focus:border-2 rounded-sm border-text-muted placeholder:text-text-muted h-14" />

                <button className="p-3.5 w-1/2 disabled:bg-text-muted bg-accent-blue hover:bg-accent-blue/80 text-white font-bold rounded-sm">
                    Join Clique
                </button>
            </div>

            <button className="p-3.5 w-full sm:w-sm disabled:bg-text-muted bg-accent-green hover:bg-accent-green/80 text-background font-bold rounded-sm">
                Create Clique
            </button>
            
        </div>
        
    </div>
  )
}
