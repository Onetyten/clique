
import { Brain, EvCharger, Flame, Headset, MessageCircle, Zap, type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export const floatingNotification = [
  {
    id: 1,
    text: "Dami has joined the clique",
    dotColor: "bg-accent-blue",
    position: "-right-[4%] top-24 sm:top-[25%]",
  },
  {
    id: 2,
    text: "Mary answered incorrectly",
    dotColor: "bg-warning",
    position: "-left-4 sm:top-[25%] top-1/2",
  },
  {
    id: 3,
    text: "New message from Sam",
    dotColor: "bg-text-primary",
    position: "left-[15%] bottom-[25%]",
  },
  {
    id: 4,
    text: "+10 points to Miguel",
    dotColor: "bg-accent-green",
    position: "-right-[15%] bottom-10  sm:bottom-[25%]",
  },
];

export interface featureType{
    icon:ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>,
    color:string,
    title:string,
    desc:string,
    shadow:string
}

export const features:featureType[] = [
    {
        icon: Headset, 
        color: "bg-accent-blue/70",
        shadow: "shadow-accent-blue",
        title: "Guessing Games",
        desc: "Competitive rounds of social trivia and personality guessing. Who knows who best? Find out fast."
    },
    {
        icon: MessageCircle, 
        color: "bg-accent-green/70",
        shadow: "shadow-accent-green",
        title: "Real-Time Chat",
        desc: "Talk trash, celebrate wins, and plan the next round — all in one place. No switching apps."
    },
    {
        icon: Zap, 
        color: "bg-warning/40",
        shadow: "shadow-warning",
        title: "Instant Notifications",
        desc: "Never miss your turn. Smart alerts keep the game moving so the energy never drops."
    },
    {
        icon: Flame,
        shadow: "shadow-error/40",
        color: "bg-error",
        title: "Streaks & Rankings",
        desc: "Track your win streaks, climb the squad leaderboard, and unlock badges that actually mean something."
    },
    {
        icon: EvCharger, 
        color: "bg-text-primary/40",
        shadow: "shadow-text-primary",
        title: "Optimized Gameplay",
        desc: "Smooth, lag-free experience whether you're on mobile or web. Built to keep you in the flow."
    },
    {
        icon: Brain, 
        color: "bg-accent-green/70",
        shadow: "shadow-accent-green",
        title: "Know Each Other",
        desc: "Questions that go deeper than small talk. Clique helps you actually learn who your friends are."
    },
];

export const steps = [
  { num: "01", title: "Create or Join",  desc: "Spin up a room and invite your squad with a single key. No account required to join." },
  { num: "02", title: "Answer & Guess",  desc: "Each round you answer about yourself, then guess what your friends said. Points for accuracy." },
  { num: "03", title: "Chat & Repeat",   desc: "React, roast, and repeat. Keep the banter going between rounds with real-time group chat." },
];

export const socialChips = [
  {  stat: "4.9", text: "App Store rating" },
  {  stat: "50k+", text: "players this month" },
  {  stat: "2M+", text: "rounds played" },
  {  stat: "Free", text: "to play" },
];