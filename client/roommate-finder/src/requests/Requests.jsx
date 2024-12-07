import './Requests.css';
import React, { useState } from "react";

const Requests = () => {
  // Hardcoded list of requests
  const [requests, setRequests] = useState([
    { id: 1, name: "Alice Johnson" },
    { id: 2, name: "Bob Smith" },
    { id: 3, name: "Carol Lee" },
  ]);

  const handleAccept = (id) => {
    setRequests((prev) => prev.filter((req) => req.id !== id)); // remove from list
    console.log(`Request ${id} accepted.`);
  };

  const handleDecline = (id) => {
    setRequests((prev) => prev.filter((req) => req.id !== id)); // remove from list
    console.log(`Request ${id} declined.`);
  };

  return (
    <div>
      <h2>Requests</h2>
      <ul>
        {requests.map((request) => (
          <li key={request.id}>
            {request.name}{" "}
            <button onClick={() => handleAccept(request.id)}>Accept</button>{" "}
            <button onClick={() => handleDecline(request.id)}>Decline</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Requests;
