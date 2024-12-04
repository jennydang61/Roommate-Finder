import React, { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8800";

const AdminPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);

  // Fetch pending users from the backend
  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get("/api/auth/admin/pendingUsers");
      console.log("Pending users fetched from backend:", response.data); // Debug log
      setPendingUsers(response.data); // Update state with fetched users
    } catch (error) {
      console.error("Error fetching pending users:", error); // Log any error
    }
  };

  // Update user status (Accept or Decline)
  const updateUserStatus = async (userId, statusName) => {
    try {
      const adminId = 1; // Replace with actual admin ID if available
      const response = await axios.post("/api/auth/admin/updateUserStatus", {
        user_id: userId,
        status_name: statusName,
        admin_id: adminId,
      });
      console.log(response.data.message); // Log response message
      fetchPendingUsers(); // Refresh the list after updating
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  // Fetch pending users on component load
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // **PLACE YOUR RETURN CODE HERE**
  return (
    <div>
      <h1>Admin Page</h1>
      <h2>Pending Users</h2>
      {pendingUsers.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((user) => (
              <tr key={user.user_ID}>
                <td>{user.user_ID}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.status_name}</td>
                <td>
                  <button
                    onClick={() => updateUserStatus(user.user_ID, "Accepted")}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateUserStatus(user.user_ID, "Declined")}
                  >
                    Decline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No pending users.</p>
      )}
    </div>
  );
};

export default AdminPage;
