import { useState, useEffect, useRef } from "react";
import "../styles/admin.css";

export default function UserTable({ users, onDisable, onDelete }) {
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const dropdownRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      filterUsers();
    }, 300); // 300ms delay

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, users]);

  // Filter users based on search term
  const filterUsers = () => {
    let filtered = users;

    // Filter by search term (name or email)
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
      {/* Search Section */}
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
          {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'}
        </div>
      </div>

      {/* Table Section */}
      <div className="users-table-wrapper">
        {filteredUsers.length === 0 ? (
          <p className="no-results">No users found matching your search.</p>
        ) : (
          <>
            {/* ===== TABLE HEADER ===== */}
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

            {/* ===== SCROLLABLE BODY ===== */}
            <div className="table-body-scroll">
              <table className="users-table">
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>

                      <td className="actions-cell">
                        <div ref={openId === user._id ? dropdownRef : null}>
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
                        </div>
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