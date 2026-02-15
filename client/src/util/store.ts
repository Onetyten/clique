import {combineReducers, configureStore} from '@reduxjs/toolkit'
import {persistReducer, persistStore} from 'redux-persist'
import storageSession from './storageSession'
import userReducer from "../store/userSlice" 
import roomReducer from "../store/roomSlice" 
import messageReducer from "../store/messageSlice" 
import sessionReducer from "../store/sessionSlice" 

const persistConfig = {
    key:'root',
    version:1,
    storage:storageSession,
    whitelist:["user","room","messages"]
}

const reducer = combineReducers({
    user: userReducer,
    room: roomReducer,
    messages: messageReducer,
    session:sessionReducer,
})

const persistedReducer = persistReducer(persistConfig,reducer)

const store = configureStore({
    reducer:persistedReducer,
    middleware:(getDefaultMiddleware)=>getDefaultMiddleware({
        serializableCheck:false
    })
})

export default store
export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch