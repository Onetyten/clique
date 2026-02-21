import Navbar from "./Navbar";
import Pulser from "./Pulser";
import Intro from "./Intro/Intro";
import Feature from "./Feature/Feature";
import Steps from "./Steps/Steps";
import CTA from "./CTA/CTA";
import Footer from "./Footer/Footer";


export default function Home() {
  return (
    <div className="relative min-h-screen font-poppins flex items-center bg-background justify-center text-center overflow-hidden">

      <Pulser/>
      <Navbar/>

      <div className="flex relative min-h-screen  z-20 flex-col justify-center items-center">

        <Intro/>
        <Feature/>
        <Steps/>
        <CTA/>
        <Footer/>

        
        

      </div>


      


    </div>
  )
}
