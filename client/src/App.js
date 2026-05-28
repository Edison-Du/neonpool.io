import { BrowserRouter, Routes, Route } from "react-router-dom"
import './App.css';
import Home from "./pages/Home";
import Local from "./pages/Local";
import Online from "./pages/Online";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <Header></Header>
    
      <Routes>
        <Route path="/">  
          <Route index element={<Home/>}></Route>
          <Route path="local" element={<Local/>}></Route>
          <Route path="online/:lobbyCode?" element={<Online/>}></Route>
        </Route>
      </Routes>

      <Footer></Footer>
    </BrowserRouter>
  );
}

export default App;
