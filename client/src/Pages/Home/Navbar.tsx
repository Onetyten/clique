import icon from "/icon.png" 




export default function Navbar() {
  return (
    <div className="fixed z-30 w-screen h-20 top-0 left-0 bg-black/20 backdrop-blur-xl flex items-center justify-between px-16">
        <div className="flex items-center gap-2">
            <img src={icon} alt="" className="size-12" />
            <p className="font-syne font-bold text-3xl text-accent-blue">Clique</p>
        </div>
        <div className="flex items-center text-text-primary text-base font-semibold gap-6">
            <p className="hover:text-accent-blue transition-all duration-200 cursor-pointer">Features</p>
            <p className="hover:text-accent-blue transition-all duration-200 cursor-pointer">How it works</p>
            <button className="text-center p-3 hover:shadow-lg transition-all duration-200 shadow-accent-green/40 px-6 cursor-pointer text-background rounded-xl bg-accent-green">
                Download
            </button>
        </div>   
    </div>
  )
}
