import { useState } from "react";
import "../styles/admin.css";

export default function UserTable({ users, onDisable, onDelete }) {
  const [openId, setOpenId] = useState(null);

  if (users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <table className="users-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {users.map((user) => (
          <tr key={user._id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{new Date(user.createdAt).toLocaleDateString()}</td>

            <td className="actions-cell">
              <button
                className="options-btn"
                onClick={() =>
                  setOpenId(openId === user._id ? null : user._id)
                }
              >
                Options <span className="arrow">▾</span>
              </button>

              {openId === user._id && (
                <div className="options-menu">
                  <button
                    className="menu-item"
                    onClick={() => {
                      setOpenId(null);
                      onDisable(user);
                    }}
                  >
                    Disable
                  </button>

                  <button
                    className="menu-item danger"
                    onClick={() => {
                      setOpenId(null);
                      onDelete(user);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
