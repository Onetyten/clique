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
        }
    }
})

export const {setUser} = userSlice.actions
export default userSlice.reducer