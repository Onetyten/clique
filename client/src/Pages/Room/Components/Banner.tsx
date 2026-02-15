interface propType{
  roundCount:number
}

export default function Banner({roundCount}:propType) {

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-background/50 backdrop-blur-sm z-40">
        <div className="p-12 bg-accent-blue w-full text-sm text-white rounded-sm flex justify-center items-center">
            <p className="text-3xl sm:text-6xl font-bold">{roundCount}</p>
        </div>
    </div>
  )
}
