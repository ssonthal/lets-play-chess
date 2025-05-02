import './App.css';
import {Chessboard} from './components/Chessboard';

function App() {
  return (
    <div className = "grid place-items-center bg-[#202020] h-screen">
      <Chessboard/>
    </div>
  );
}

export default App;