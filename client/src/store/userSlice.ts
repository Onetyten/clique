import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { userType } from "../types/types";

const initialState:{user:userType | null }= {
    user:null
}

const userSlice = createSlice({
    name:"user",
    initialState,
    reducers:{
        setUser:(state,action:PayloadAction<userType>)=>{
            state.user = action.payload
        },
        clearUser:(state)=>{
            state.user = null
        },
    }
})

export const {setUser,clearUser} = userSlice.actions
export default userSlice.reducer