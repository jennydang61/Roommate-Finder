import './Requests.css';
import React, { useState } from "react";

const Requests = () => {
  // hardcoded requests for now
  const [requests, setRequests] = useState([
    {
      sender_ID: 1,
      sender_name: "Alice Johnson",
      status_name: "Pending",
      description: "Looking for a quiet roommate.",
    },
    {
      sender_ID: 3,
      sender_name: "Bob Smith",
      status_name: "Pending",
      description: "I prefer roommates who are clean.",
    },
    {
      sender_ID: 5,
      sender_name: "Charlie Brown",
      status_name: "Pending",
      description: "Looking for a social roommate.",
    },
  ]);

  const handleAccept = (senderID) => {
    setRequests(prev => prev.filter(req => req.sender_ID !== senderID)); 
    console.log(`Request from sender ${senderID} accepted`);
  };

  const handleDecline = (senderID) => {
    setRequests(prev => prev.filter(req => req.sender_ID !== senderID)); 
    console.log(`Request from sender ${senderID} declined`);
  };

  return (
    <div>
      <h2>Requests</h2>
      <ul>
        {requests.map((request, index) => (
          <li key={index}>
            <strong>Name:</strong> {request.sender_name} <br />
            <button onClick={() => handleAccept(request.sender_ID)}>Accept</button>
            <button onClick={() => handleDecline(request.sender_ID)}>Decline</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Requests;
