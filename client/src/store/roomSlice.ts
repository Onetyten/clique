import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { roomType } from "../types/types";

const initialState:{room:roomType | null }= {
    room:null
}

const roomSlice = createSlice({
    name:"room",
    initialState,
    reducers:{
        setRoom:(state,action:PayloadAction<roomType>)=>{
            state.room = action.payload
        },
        clearRoom:(state)=>{
            state.room = null
        }
    }
})

export const {setRoom,clearRoom} = roomSlice.actions
export default roomSlice.reducer