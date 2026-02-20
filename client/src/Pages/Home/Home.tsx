
export default function Home() {
  return (
    <section className="relative min-h-screen font-poppins flex items-center bg-background justify-center text-center overflow-hidden pt-28 pb-16 px-6">

      <div className="fixed inset-0 pointer-events-none blur-3xl opacity-20 flex justify-center items-center z-0 overflow-hidden">
          <div id="pulser" className={`bg-accent-blue aspect-square h-dvh rounded-full animate-pulse`}></div>
      </div>
      <div className="fixed z-10 w-screen h-16 top-0 left-0 bg-black/20 backdrop-blur-xl">
          
      </div>

      <div className="flex relative z-20 flex-col justify-center items-center">
          <div className="max-w-6xl flex flex-col justify-center items-center gap-8">
          
            <div className="text-white text-7xl flex flex-col justify-center items-center gap-4 font-syne font-extrabold uppercase">
              <p>Play. Guess.</p>
              <p className="text-accent-green">Bond.</p>      
            </div>
            <div className="max-w-lg text-white text-lg">
              <p>
                Clique is the social guessing game that actually brings friends closer. Chat in real-time, guess what your crew is thinking, and discover who really knows who.
              </p>
            </div>

            <div className="flex font-semibold justify-center items-center gap-6">
              <button className="text-center w-72 cursor-pointer min-h-14 text-background rounded-xl bg-accent-green">
                Download Android App
              </button>
              <button className="text-center w-72 cursor-pointer min-h-14 text-white rounded-xl bg-accent-blue">
                Play on web
              </button>
            </div>
        </div>




      </div>


      


    </section>
  )
}
