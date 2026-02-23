import icon from "/icon.png" 

export default function Footer() {
    const year = new Date().getFullYear()
    const links = ["Privacy", "Terms", "Contact"]

  return (
    <footer className="px-3 sm:px-12 py-6 text-left w-full text-base flex flex-wrap bg-background/80 backdrop-blur-[3px] items-center justify-between gap-6">
        <div className="flex items-center gap-2">
            <img src={icon} alt="" className="size-6" />
            <p className="font-syne font-bold text-xl text-accent-blue">Clique</p>
        </div>

        <p className="text-text-primary"> &copy; {year} Clique. All rights reserved.</p>
        <div className="flex gap-6">
        {links.map((link) => (
            <a key={link} href="#" className="transition-colors hover:text-white text-text-primary" style={{ textDecoration: "none" }}>{link}</a>
        ))}
        </div>
        </footer>
  )
}
