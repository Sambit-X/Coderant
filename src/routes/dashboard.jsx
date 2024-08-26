import { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import io from 'socket.io-client';
import MonacoEditor from '@monaco-editor/react';

export default function DashboardPage() {
  const BACKEND_SERVER = import.meta.env.VITE_BACKEND_SERVER;

  const { user } = useUser();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('');
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState('');
  const [output, setOutput] = useState('Output is Shown here');
  const [islanguage, setLanguage] = useState("java");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const socketInstance = io(BACKEND_SERVER);
    setSocket(socketInstance);

    socketInstance.on('status', (msg) => {
      if (msg) {
        console.log(msg.body);
        setStatus(msg.body);
        setQuestion(msg.question);
        if (msg.body === "Match Started") {
          setIsPlaying(true);
        }
      }
    });

    socketInstance.on('showOutput', (msg) => {
      console.log(msg)
      if (msg) {
        setOutput(msg);
      }
    });

    socketInstance.on('result', (msg, code) => {
      console.log(code);
      setStatus(msg);
      if (code !== 2) {
        setStatus('');
        setResult(msg);
        setIsPlaying(false);
        setQuestion(null);
        setAnswer('');
      }
      if (code === 1) {
        console.log(user.id);
      }
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [BACKEND_SERVER, user]);

  const handleChange = (value) => {
    setAnswer(value);
  };

  const findPlayerButton = (e) => {
    e.preventDefault();
    if (socket) {
      socket.emit('joinRandomRoom');
      setIsPlaying(true);
    }
  };

  const runButton = (e) => {
    e.preventDefault();
    if (socket) {
      socket.emit('runAnswer', answer, islanguage);
    }
  };

  const submitButton = (e) => {
    e.preventDefault();
    if (socket) {
      socket.emit('submitAnswer', answer, islanguage);
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
          <select
            value={islanguage}
            onChange={(e) => setLanguage(e.target.value)}
            className="form-select mb-2"
          >
            <option value="java">Java</option>
            {/* <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option> */}
          </select>
          <MonacoEditor
            height="400px"
            width="800px"
            language={islanguage}
            value={answer}
            onChange={handleChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              lineNumbers: 'on',
              fontSize: 14,
              scrollBeyondLastLine: false,
            }}
          />
          <p className="lead">{output}</p>
          <button onClick={runButton} className="btn btn-success mt-2">Run</button>
          <button onClick={submitButton} className="btn btn-success mt-2">Submit</button>
        </div>
      )}
      {!isPlaying && result && <p className="lead">{result}</p>}
    </div>
  );
}
