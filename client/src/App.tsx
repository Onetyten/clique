import { BrowserRouter, Route, Routes } from "react-router"
import Login from "./Pages/Login/Login"
import Room from "./Pages/Room/Room"



function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/room" element={<Room/>} />
      </Routes>
    </BrowserRouter>


  )
}

export default App
