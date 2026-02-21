import { socialChips, steps } from "../../../data/data";





export default function Steps() {
  return (
       <section id="how" className="pt-32 pb-8 w-full flex flex-col justify-between px-16 min-h-dvh text-left bg-background-100">
          

            <div className="flex flex-col">
              <p className="text-sm text-accent-blue w-full font-medium tracking-widest uppercase mb-3">How it works</p>
      
              <h2 className="font-syne w-full font-extrabold text-white leading-tight mb-6 text-5xl tracking-tight">
                  Get <span className="text-accent-blue">Clique</span> up and playing<br />in three steps.
              </h2>

              <div className="flex justify-center items-center gap-10">
                {steps.map((step, index) => (
                  
                    <div key={index} className="text-center w-96 max-w-full">
                      <div className="font-syne font-extrabold text-9xl mb-4 text-transparent leading-none"
                        style={{ WebkitTextStroke: `2px #5865F2` }}>
                        {step.num}
                      </div>
                      <h3 className="font-syne font-bold text-white text-xl mb-2">{step.title}</h3>
                      <p className="text-base leading-relaxed text-text-primary">{step.desc}</p>
                    </div>
              
                ))}
              </div>
            </div>

            
            <div className="flex flex-wrap gap-3 justify-center">
              {socialChips.map((chip, index) => (
                <div key={index}  className="flex items-center gap-2 border-1 border-secondary-200 text-text-primary px-4 py-2 rounded-full text-sm" >
                  <strong className="text-white">{chip.stat}</strong> {chip.text}
                </div>
              ))}
            </div>
            
        </section>
  )
}
