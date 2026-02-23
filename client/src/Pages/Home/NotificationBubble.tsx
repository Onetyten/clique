import gsap from "gsap";
import { useEffect, useRef } from "react";

interface propType{
    text:string;
    dotColor:string;
    position:string
}

export default function NotificationBubble({ text, dotColor, position }:propType) {
  const bubble = useRef<HTMLDivElement|null>(null)

  useEffect(()=>{
    if (!bubble.current) return
    const randomX = gsap.utils.random(-200,200)
    const randomY = gsap.utils.random(-100, 160);
    const duration = gsap.utils.random(10, 16);

    gsap.to(bubble.current,{x:randomX,y:randomY,duration,ease:"sine.inOut",repeat:-1,yoyo:true})

  },[])

  return (
    <div ref={bubble} className={`bg-background opacity-40 sm:opacity-100 z-10 p-2 px-4 border border-text-primary/50 rounded-full rounded-tl-0 flex items-center gap-3 absolute text-text-primary ${position}`} >
      <div className={`size-2 rounded-full ${dotColor}`} />
      {text}
    </div>
  )
}
