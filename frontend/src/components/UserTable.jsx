import { useState, useEffect, useRef } from "react";
import "../styles/admin.css";

export default function UserTable({ users, onDisable, onDelete }) {
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const dropdownRef = useRef(null);

  // keep filteredUsers in sync with users
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      let filtered = users;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = users.filter(
          (user) =>
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term)
        );
      }

      setFilteredUsers(filtered);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, users]);

  // close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenId(null);
      }
    }

    if (openId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openId]);

  return (
    <div className="user-section">
      {/* Search */}
      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="results-count">
          {filteredUsers.length}{" "}
          {filteredUsers.length === 1 ? "result" : "results"}
        </div>
      </div>

      {/* Table */}
      <div className="users-table-wrapper">
        {filteredUsers.length === 0 ? (
          <p className="no-results">No users found matching your search.</p>
        ) : (
          <>
            {/* header */}
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
            </table>

            {/* scrollable body */}
            <div className="table-body-scroll">
              <table className="users-table">
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="actions-cell">
                        <button
                          className="options-btn"
                          onClick={() =>
                            setOpenId(
                              openId === user._id ? null : user._id
                            )
                          }
                        >
                          Options <span className="arrow">▾</span>
                        </button>

                        {openId === user._id && (
                          <div
                            ref={dropdownRef}
                            className="options-menu"
                          >
                            <button
                              className="menu-item"
                              onClick={() => {
                                setOpenId(null);
                                onDisable(user._id);
                              }}
                            >
                              Disable
                            </button>

                            <button
                              className="menu-item danger"
                              onClick={() => {
                                setOpenId(null);
                                onDelete(user._id);
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
