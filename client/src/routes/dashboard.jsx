import { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import io from 'socket.io-client';

export default function DashboardPage() {
  const BACKEND_SERVER = import.meta.env.VITE_BACKEND_SERVER;

  const { user } = useUser();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('');
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(BACKEND_SERVER);
    setSocket(socketInstance);

    socketInstance.on('status', (msg) => {
      console.log(msg.body);
      setStatus(msg.body);
      setQuestion(msg.question);
      if (msg.body === "Match Started") {
        setIsPlaying(true);
      }
    });

    socketInstance.on('result', (msg,code) => {
      console.log(code);
      setStatus(msg)
      if(code!==2){
        setStatus('')
        setResult(msg);
        setIsPlaying(false);
        setQuestion(null);
        setAnswer('');
      }
      if(code===1){
        console.log(user.id)
      }
    });

    // Cleanup on component unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [BACKEND_SERVER]);

  const handleChange = (e) => {
    setAnswer(e.target.value);
  };

  const findPlayerButton = (e) => {
    e.preventDefault();
    if (socket) {
      socket.emit('joinRandomRoom');
      setIsPlaying(true);
    }
  };

  const submitButton = (e) => {
    e.preventDefault();
    if (socket) {
      socket.emit('submitAnswer', answer);
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 d-flex flex-column align-items-center p-4">
      <div className="d-flex justify-content-between align-items-center w-100 mb-4">
        <h1 className="display-4">Dashboard</h1>
        <UserButton />
      </div>
      {user && (
        <div className="mb-4">
          <h2 className="h5">Welcome, {user.username}!</h2>
        </div>
      )}
      {!isPlaying && (
        <button onClick={findPlayerButton} className="btn btn-primary btn-lg">
          Find Players
        </button>
      )}
      <p className="lead">{status}</p>
      {isPlaying && question && (
        <div className="mt-4">
          <p className="lead">{question}</p>
          <textarea value={answer} onChange={handleChange} className="form-control mb-2" rows="4"></textarea>
          <button onClick={submitButton} className="btn btn-success">Submit</button>
        </div>
      )}
      {!isPlaying && result && <p className="lead">{result}</p>}
    </div>
  );
}
