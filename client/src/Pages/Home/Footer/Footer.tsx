import icon from "/icon.png" 

export default function Footer() {
    const year = new Date().getFullYear()
    const links = ["Privacy", "Terms", "Contact"]

  return (
    <footer className="px-12 py-6 w-full text-base flex flex-wrap bg-background items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <img src={icon} alt="" className="size-12" />
            <p className="font-syne font-bold text-3xl text-accent-blue">Clique</p>
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
