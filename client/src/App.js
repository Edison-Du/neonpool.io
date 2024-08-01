import logo from './logo.svg';
import './App.css';
import Game from './pages/Game';

function App() {
  const seed = Math.floor(Math.random() * (1<<21));
  const names = ["A", "PLAYER 2", "ABCDEFGHIJKLMNOP", "WWWWWWWWWWWWWWW"];

  return (
    <Game playerNames={names} gameSeed={seed}></Game>
  );
}

export default App;
