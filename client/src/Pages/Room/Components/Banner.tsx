// import gsap from "gsap"
import { useRef } from "react"

interface propType{
  bannerMessage:string
}


export default function Banner({bannerMessage}:propType) {

  const bgRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);

  // useEffect(() => {
  //   const tl = gsap.timeline();

  //   tl.from(bgRef.current, { scaleX: 0, transformOrigin: "left center", duration: 0.4, ease: "power2.out",})
  //   .from(textRef.current, { opacity: 0, duration: 0.2 });

  //   return () => {
  //     tl.kill();
  //   };
  // }, []);


  return (
    <div className="fixed inset-0 flex justify-center items-center bg-background/50 backdrop-blur-sm z-40">
        <div ref={bgRef} className="p-12 bg-accent-blue w-full opacity-100 text-sm text-white rounded-sm flex justify-center items-center">
            <p ref={textRef} className="text-3xl opacity-100 sm:text-4xl font-bold">{bannerMessage}</p>
        </div>
    </div>
  )
}
