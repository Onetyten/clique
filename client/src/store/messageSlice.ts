import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { messageType } from "../types/types";



export type newMessageType = Omit<messageType,"id" | "animated">


const initialState:{messages:messageType[]} = {
    messages:[]
}


const messageSlice = createSlice({
    name:"messages",
    initialState,
    reducers:{
        addMessage:{
            reducer:(state,action:PayloadAction<messageType>)=>{
                state.messages.push(action.payload)
            },
            prepare:(message:newMessageType)=>{
                const id = nanoid()
                return {payload:{id,animated:false,...message}}
            }
        },
        removeMessage:(state,action:PayloadAction<string>)=>{
            const id = action.payload
            state.messages.filter(item=>item.id !== id)
        },
        messageAnimated:(state,action:PayloadAction<string>)=>{
            const id = action.payload
            const message = state.messages.find(item=>item.id === id)
            if (!message) return
            message.animated = true
        },
        
        clearMessages:(state)=>{
            state.messages = []
        }
    }
})


export const {addMessage,removeMessage,clearMessages,messageAnimated} = messageSlice.actions
export default messageSlice.reducer