import gsap from "gsap"
import { useEffect } from "react"

interface propType{
  bannerMessage:string
}


export default function Banner({bannerMessage}:propType) {

  useEffect(()=>{
      const tl = gsap.timeline()
      tl.from("#banner-bg",{width:0,ease:"none", duration:1}).from("#banner-text",{opacity:0,duration:0.2,delay:0.1})  
  },[])

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-background/50 backdrop-blur-sm z-40">
        <div id="banner-bg" className="p-12 bg-accent-blue w-full text-sm text-white rounded-sm flex justify-center items-center">
            <p id="banner-text" className="text-3xl sm:text-4xl font-bold">{bannerMessage}</p>
        </div>
    </div>
  )
}
