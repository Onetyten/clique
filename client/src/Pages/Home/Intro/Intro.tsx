import { BsAndroid2, BsGlobe } from 'react-icons/bs'

export default function Intro() {
  return (
    
    <section className="max-w-6xl min-h-screen  flex flex-col justify-center items-center gap-12">
        
        <div className="text-white text-7xl flex flex-col justify-center items-center gap-4 font-syne font-extrabold uppercase">
            <p>Play. Guess.</p>
            <p className="text-accent-green">Bond.</p>      
        </div>

        <div className="max-w-lg text-text-primary text-lg">
            <p>
            Clique is the social guessing game that actually brings friends closer. Chat in real-time, guess what your crew is thinking, and discover who really knows who.
            </p>
        </div>

        <div className="flex font-semibold justify-center items-center gap-6">
            <button className="text-center gap-2.5 flex justify-center items-center hover:shadow-lg transition-all duration-200 shadow-accent-green/40 w-72 cursor-pointer min-h-14 text-background rounded-xl bg-accent-green">
                <BsAndroid2 size={22}/>
                Download Android App
            </button>
            <button className="text-center gap-2.5 flex justify-center items-center hover:shadow-lg transition-all duration-200 shadow-accent-blue/40 w-72 cursor-pointer min-h-14 text-white rounded-xl bg-accent-blue">
                <BsGlobe size={22}/>
                Play on web
            </button>
        </div>
    </section>
  )
}
