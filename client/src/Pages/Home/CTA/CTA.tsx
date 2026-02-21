import { BsAndroid2, BsGlobe } from "react-icons/bs";


export default function CTA() {
  return (
       <section className="py-24 w-full px-6 bg-background/50 backdrop-blur-[3px] relative overflow-hidden">
         
         
          <div className="max-w-2xl mx-auto relative">
            
              <div className="rounded-3xl px-8 py-16 bg-background-100 border-1 border-accent-blue text-center" >
                <p className="text-sm font-medium tracking-widest uppercase mb-4 text-accent-blue">Get the app</p>

                <h2 className="font-syne text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
                  Ready to find out who<br />
                  <span className="text-accent-green">really</span> knows you?
                </h2>

                <p className="text-sm leading-relaxed mb-10 max-w-sm mx-auto text-text-primary">
                  Download Clique for free or jump straight into the web version.
                </p>

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

              </div>
            
          </div>
        </section>

  )
}
