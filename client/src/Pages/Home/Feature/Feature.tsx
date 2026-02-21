import { features } from '../../../data/data'
import RevealCard from '../RevealCard'




export default function Feature() {
  return (
    <section className="py-32 px-16 text-left bg-background/80 backdrop-blur-[3px]">
        
        <p className="text-sm text-accent-blue w-full font-medium tracking-widest uppercase mb-3">Why Clique?</p>
    
        <h2 className="font-syne w-full font-extrabold text-white leading-tight mb-3 text-5xl tracking-tight">
            Everything you need<br />to vibe with your people.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {features.map((feature, index) => (
            <RevealCard key={index}>
                <div className={`rounded-2xl hover:shadow-[0_0_25px] ${feature.shadow} transition-all duration-400 p-8 h-full bg-background-100 border-1 border-background-200`} >
                
                <div className={`size-13 text-white rounded-full flex items-center justify-center text-2xl mb-5 ${feature.color}`}>
                    <feature.icon size={26} />
                </div>
                <h3 className="font-syne font-bold text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-text-muted">{feature.desc}</p>
                </div>
            </RevealCard>
            ))}
        </div>
    </section>
  )
}
