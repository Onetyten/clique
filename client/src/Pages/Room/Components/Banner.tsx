interface propType{
  bannerMessage:string
}

export default function Banner({bannerMessage}:propType) {

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-background/50 backdrop-blur-sm z-40">
        <div className="p-12 bg-accent-blue w-full text-sm text-white rounded-sm flex justify-center items-center">
            <p className="text-3xl sm:text-4xl font-bold">{bannerMessage}</p>
        </div>
    </div>
  )
}
