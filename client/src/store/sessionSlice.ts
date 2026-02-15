import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { sessionType } from "../types/types"


const initialState:{session:sessionType | null} =  {
    session:null
}


const sessionSlice = createSlice({
    name:"session",
    initialState,
    reducers:{
        setSession:(state,action:PayloadAction<sessionType>)=>{
            state.session = action.payload
        },
        clearSession:(state)=>{
            state.session = null
        }
    }

})

export const {setSession,clearSession} = sessionSlice.actions
export default sessionSlice.reducer