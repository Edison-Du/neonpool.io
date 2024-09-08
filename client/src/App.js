import { BrowserRouter, Routes, Route } from "react-router-dom"
import logo from './logo.svg';
import './App.css';
import Home from "./pages/Home";
import Local from "./pages/Local";
import Online from "./pages/Online";

function App() {
  // const seed = Math.floor(Math.random() * (1<<21));
  // const names = ["A", "PLAYER 2", "ABCDEFGHIJKLMNOP", "WWWWWWWWWWWWWWW"];
  // const names = ["PLAYER 1", "PLAYER 2"];

  return (
    // <Game playerNames={names} gameSeed={seed}></Game>
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
