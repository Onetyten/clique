import { BsAndroid2, BsGlobe } from "react-icons/bs";


export default function CTA() {
  return (
       <section className="py-24 w-screen px-6 bg-background/80 flex justify-center items-center backdrop-blur-[3px] relative overflow-hidden">
  
              <div className="rounded-3xl w-2xl max-w-[90vw] px-8 py-16 bg-background-100 border-1 border-text-muted/30 text-center" >
                <p className="text-sm font-medium tracking-widest uppercase mb-4 text-accent-blue">Get the app</p>

                <h2 className="font-syne text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
                  Ready to find out who<br />
                  <span className="text-accent-green">really</span> knows you?
                </h2>

                <p className="text-sm leading-relaxed mb-10 max-w-sm mx-auto text-text-primary">
                  Download Clique for free or jump straight into the web version.
                </p>

                <div className="flex flex-col sm:flex-row font-semibold justify-center items-center gap-6">
                    <a href='https://github.com/Onetyten/Clique-Mobile/releases/download/v1.0/Clique-v1.0.0-android.apk' className="text-center gap-2.5 flex justify-center items-center hover:shadow-lg transition-all duration-200 shadow-accent-green/40 w-72 p-6 sm:p-0 cursor-pointer sm:min-h-14 max-w-[80vw]  text-background rounded-xl bg-accent-green">
                        <BsAndroid2 size={22}/>
                        Download Android App
                    </a>
                    <a href='/signin' className="text-center gap-2.5 flex justify-center items-center hover:shadow-lg transition-all duration-200 shadow-accent-blue/40 w-72 max-w-[80vw] p-6 sm:p-0 cursor-pointer sm:min-h-14 text-white rounded-xl bg-accent-blue">
                        <BsGlobe size={22}/>
                        Play on web
                    </a>
                </div>

              </div>
            
        </section>

  )
}
