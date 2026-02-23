import { BsAndroid2, BsGlobe } from 'react-icons/bs'

export default function Intro() {
  return (
    
    <section className="w-full min-h-screen max-w-screen bg-background/70 flex flex-col justify-center items-center gap-12 px-4">
        <div className="text-white text-5xl  break-normal sm:text-6xl md:text-7xl flex flex-col justify-center items-center gap-4 font-syne font-extrabold uppercase">
            <p className='leading-[70px] text-center'>Play. Guess. <br/><span className="text-accent-green">Bond.</span>   </p>
        </div>

        <div className="max-w-lg text-text-primary text-lg">
            <p>
            Clique is the social guessing game that actually brings friends closer. Chat in real-time, guess what your crew is thinking, and discover who really knows who.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row font-semibold justify-center items-center gap-6">
            <a href='https://github.com/Onetyten/Clique-Mobile/releases/download/v1.0/Clique-v1.0.0-android.apk' className="text-center gap-2.5 flex justify-center items-center hover:shadow-lg transition-all duration-200 shadow-accent-green/40 w-72 p-6 sm:p-0 cursor-pointer sm:min-h-14 max-w-[90vw]  text-background rounded-xl bg-accent-green">
                <BsAndroid2 size={22}/>
                Download Android App
            </a>
            <a href='/signin' className="text-center gap-2.5 flex justify-center items-center hover:shadow-lg transition-all duration-200 shadow-accent-blue/40 w-72 max-w-[90vw] p-6 sm:p-0 cursor-pointer sm:min-h-14 text-white rounded-xl bg-accent-blue">
                <BsGlobe size={22}/>
                Play on web
            </a>
        </div>
    </section>
  )
}
