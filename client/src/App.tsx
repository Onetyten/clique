import { BrowserRouter, Route, Routes } from "react-router"
import Login from "./Pages/Login/Login"
// import { Provider } from "react-redux"
import Room from "./Pages/Room/Room"
 import { ToastContainer } from 'react-toastify';
// import store, { persistor } from "./util/store"
// import { PersistGate } from "redux-persist/integration/react"



function App() {

  return (
    // <Provider store={store}>
    //   <PersistGate persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login/>} />
            <Route path="/room" element={<Room/>} />
            
          </Routes>
          <ToastContainer />
        </BrowserRouter>
    //   </PersistGate>
    // </Provider>


  )
}

export default App
