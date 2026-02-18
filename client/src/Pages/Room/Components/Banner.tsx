import gsap from "gsap"
import { useEffect, useRef } from "react"

interface propType{
  bannerMessage:string
}


export default function Banner({bannerMessage}:propType) {

  const bgRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    
    const tl = gsap.timeline();
    tl.fromTo(bgRef.current,{scaleX:0},{scaleX:1,ease:"none"})
    .fromTo(textRef.current,{opacity:0,y:30},{opacity:1,y:0,ease:"power2.in",duration:0.2})

    return () => {
      tl.kill();
    };
  }, []);


  return (
    <div className="fixed inset-0 flex justify-center items-center bg-background/50 backdrop-blur-sm z-40">
        <div ref={bgRef} className="p-12 bg-accent-blue w-full opacity-100 text-sm text-white rounded-sm flex justify-center items-center">
            <p ref={textRef} className="text-3xl sm:text-4xl font-bold">{bannerMessage}</p>
        </div>
    </div>
  )
}
