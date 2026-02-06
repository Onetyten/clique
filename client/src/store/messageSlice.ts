/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { messageType } from "../types/types";

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
            prepare:(message:messageType)=>{
                const id = nanoid()
                const {id:_,...newMessage} = message
                return {payload:{id,...newMessage}}
            }
        },
        removeMessage:(state,action:PayloadAction<string>)=>{
            const id = action.payload
            state.messages.filter(item=>item.id !== id)
        },
    }
})


export const {addMessage,removeMessage} = messageSlice.actions
export default messageSlice.reducer