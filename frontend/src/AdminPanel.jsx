import { useState, useEffect } from "react";
import { api } from "./api";

function AdminPanel({ currentUserId }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setUsers(await api.getUsers());
    } catch (err) {
      alert(err.message);
    }
  }

  async function toggleStatus(user) {
    const newStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    try {
      await api.updateUserStatus(user.id, newStatus);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  }

  async function changeRole(user, role) {
    try {
      await api.updateUserRole(user.id, role);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <section>
      <h2>Admin — Users</h2>

      <table className="users">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>
                {u.name}
                {u.id === currentUserId && <span className="you">you</span>}
              </td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.role}
                  disabled={u.id === currentUserId}
                  onChange={(e) => changeRole(u, e.target.value)}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td>
                <span className={u.status === "ACTIVE" ? "ok" : "blocked"}>
                  {u.status}
                </span>
              </td>
              <td>
                {u.id !== currentUserId && (
                  <button
                    className={u.status === "ACTIVE" ? "danger" : ""}
                    onClick={() => toggleStatus(u)}
                  >
                    {u.status === "ACTIVE" ? "Block" : "Unblock"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default AdminPanel;