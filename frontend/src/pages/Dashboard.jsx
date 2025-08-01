import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/users`, {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Selection logic
  const handleCheckboxChange = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      setSelected(users.map((u) => u.id));
    }
    setSelectAll(!selectAll);
  };

  // Actions
  const performAction = async (action) => {
    if (!selected.length) return;
    try {
      await axios.post(
        `${BACKEND_URL}/api/users/${action}`,
        { ids: selected },
        { withCredentials: true }
      );
      setSelected([]);
      setSelectAll(false);
      fetchUsers();
    } catch {
      alert("Action failed");
    }
  };

  const handleLogout = async () => {
    await axios.post(
      `${BACKEND_URL}/api/logout`,
      {},
      { withCredentials: true }
    );
    navigate("/");
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>User Management</h2>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="mb-3">
        <button
          className="btn btn-warning me-2"
          onClick={() => performAction("block")}
        >
          Block
        </button>
        <button
          className="btn btn-success me-2"
          onClick={() => performAction("unblock")}
        >
          Unblock
        </button>
        <button
          className="btn btn-danger"
          onClick={() => performAction("delete")}
        >
          Delete
        </button>
      </div>

      {loading ? (
        <div>Loading users...</div>
      ) : users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`badge ${
                      user.status === "active" ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td>
                  {user.last_login
                    ? new Date(user.last_login).toLocaleString()
                    : "-"}
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;
