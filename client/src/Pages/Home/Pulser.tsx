import { floatingNotification } from "../../data/data";
import NotificationBubble from "./NotificationBubble";




export default function Pulser() {
  return (
    <div className="fixed inset-0 pointer-events-none flex justify-center items-center z-0 overflow-hidden">

        {floatingNotification.map((item) => (
            <NotificationBubble key={item.id} text={item.text} dotColor={item.dotColor} position={item.position}/>
        ))}


        <div className={`bg-accent-blue opacity-20 blur-3xl  aspect-square h-dvh rounded-full animate-pulse`}></div>
    </div>
  )
}
