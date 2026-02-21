

interface propType{
    text:string;
    dotColor:string;
    position:string
}

export default function NotificationBubble({ text, dotColor, position }:propType) {
  return (
    <div className={`bg-background z-10 p-2 px-4 border border-text-primary/50 rounded-full rounded-tl-0 flex items-center gap-3 absolute text-text-primary ${position}`} >
      <div className={`size-2 rounded-full ${dotColor}`} />
      {text}
    </div>
  )
}
