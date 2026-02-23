import { PanelRight } from "lucide-react"
import icon from "/icon.png" 
import { useEffect, useRef, useState } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"

gsap.registerPlugin(useGSAP)



export default function Navbar() {
      const [openSidebar,setOpenSidebar] = useState(false)
        const sideBarRef = useRef<HTMLDivElement | null>(null)


    useEffect(()=>{
        if (!openSidebar || !sideBarRef.current) return;
        const tl = gsap.timeline();
        tl.from(
            sideBarRef.current,
            {width:0,duration:0.4,ease: "power2.out"},
        )
        .fromTo(".sidebar-links",
        { y:40,opacity:0,duration:0.4,stagger:0.2,ease: "power2.out"},{opacity:1,y:0},"-=0.1"
        )

    },[openSidebar])


  return (
    <div className="fixed pointer-events-none z-30 w-screen min-h-dvh inset-0 flex flex-col justify-start ">

        <div className="pointer-events-auto h-16 w-full flex justify-between items-center px-3 sm:px-16 bg-black/50 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                <img src={icon} alt="" className="size-12" />
                <p className="font-syne font-bold text-3xl text-accent-blue">Clique</p>
            </div>

            <PanelRight onClick={()=>setOpenSidebar(prev=>!prev)} size={28} className="cursor-pointer text-text-primary flex sm:hidden hover:text-accent-blue"/>

            <div className="hidden sm:flex items-center text-text-primary text-base font-semibold gap-6">
                <a href="#features" className="hover:text-accent-blue transition-all duration-200 cursor-pointer">Features</a>
                <a href="#how" className="hover:text-accent-blue transition-all duration-200 cursor-pointer">How it works</a>
                <a href="https://github.com/Onetyten/Clique-Mobile/releases/download/v1.0/Clique-v1.0.0-android.apk" className="text-center transition-all duration-200 cursor-pointer rounded-xl hover:text-white text-accent-green">
                    Download
                </a>
            </div>    
        </div>

        {openSidebar&&
            <div onClick={()=>setOpenSidebar(false)} className="w-full pointer-events-auto flex sm:hidden justify-end flex-1 bg-background/10 backdrop-blur-sm h-full">
                <div ref={sideBarRef} onClick={(e)=>e.stopPropagation()} className="w-[70%] bg-[#13151b]/80 flex text-xl font-semibold gap-6 text-text-primary flex-col items-start p-6 backdrop-blur-xl">

                    <a href="#features" className="sidebar-links opacity-100 hover:text-accent-blue cursor-pointer">Features</a>
                    
                    <a href="#how" className="sidebar-links opacity-100 hover:text-accent-blue cursor-pointer">How it works</a>

                    <a href="https://github.com/Onetyten/Clique-Mobile/releases/download/v1.0/Clique-v1.0.0-android.apk" className="sidebar-links text-center opacity-100 cursor-pointer rounded-xl hover:text-white text-accent-green">
                        Download
                    </a>

                </div>
                
            </div>
        }
           
    </div>
  )
}
