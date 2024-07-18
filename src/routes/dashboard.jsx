import { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import io from 'socket.io-client'; // Import socket.io-client

export default function DashboardPage() {
  const { user } = useUser();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io("http://localhost:3000");
    setSocket(socketInstance);

    // Cleanup on component unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const handleButtonClick = (e) => {
    e.preventDefault();
    if (socket) {
      socket.emit("joinRandomRoom");

      socket.on('status', (msg) => {
        setStatus(msg.question); // Update status state with the message received
      });
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
      {/* TODO: Change to Dynamic URL Based on room ID */}
      <button onClick={handleButtonClick} className="btn btn-primary btn-lg">Find Players</button>
      {status && (
        <div className="mt-4">
          <p className="lead">{status}</p>
        </div>
      )}
    </div>
  );
}
