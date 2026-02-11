interface propType{
  bannerVal:number  
}

export default function Banner({bannerVal}:propType) {

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-background/50 backdrop-blur-sm z-40">
        <div className="p-12 bg-accent-blue w-full text-sm text-white rounded-sm flex justify-center items-center">
            <p className="text-3xl sm:text-6xl font-bold">{bannerVal}</p>
        </div>
    </div>
  )
}
