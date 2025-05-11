import { BrowserRouter, Routes, Route } from "react-router-dom"
import './App.css';
import Home from "./pages/Home";
import Local from "./pages/Local";
import Online from "./pages/Online";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Home/>}></Route>
          <Route path="local" element={<Local/>}></Route>
          <Route path="online/:lobbyCode?" element={<Online/>}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
