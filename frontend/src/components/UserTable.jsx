import { useState, useEffect, useRef } from "react";
import "../styles/admin_user.css";

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function UserTable({ users, onToggle, onDelete }) {
  const [openId, setOpenId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { type, userId, name }
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => { setFilteredUsers(users); }, [users]);

  useEffect(() => {
    const t = setTimeout(() => {
      const term = searchTerm.trim().toLowerCase();
      setFilteredUsers(
        !term ? users : users.filter(
          (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
        )
      );
    }, 250);
    return () => clearTimeout(t);
  }, [searchTerm, users]);

  // Close dropdown when clicking outside
  const tableRef = useRef(null);
  useEffect(() => {
    const close = (e) => {
      if (tableRef.current && !tableRef.current.contains(e.target)) {
        setOpenId(null);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "delete")  onDelete(confirmAction.userId);
    if (confirmAction.type === "toggle")  onToggle(confirmAction.userId);
    setConfirmAction(null);
  };

  return (
    <div className="adm-table-section" ref={tableRef}>

      {/* Inline Confirmation Dialog */}
      {confirmAction && (
        <div className="adm-confirm-overlay" onClick={() => setConfirmAction(null)}>
          <div className="adm-confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className={`adm-confirm-icon ${confirmAction.type}`}>
              {confirmAction.type === "delete" ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
              )}
            </div>
            <h4 className="adm-confirm-title">
              {confirmAction.type === "delete" ? "Delete User" : confirmAction.willEnable ? "Enable User" : "Disable User"}
            </h4>
            <p className="adm-confirm-msg">
              {confirmAction.type === "delete"
                ? `Permanently delete "${confirmAction.name}"? This cannot be undone.`
                : confirmAction.willEnable
                ? `Re-enable access for "${confirmAction.name}"?`
                : `Disable access for "${confirmAction.name}"?`}
            </p>
            <div className="adm-confirm-actions">
              <button className="adm-confirm-cancel" onClick={() => setConfirmAction(null)}>
                Cancel
              </button>
              <button
                className={`adm-confirm-ok ${confirmAction.type === "delete" ? "delete" : confirmAction.willEnable ? "enable" : "disable"}`}
                onClick={handleConfirm}
              >
                {confirmAction.type === "delete" ? "Delete" : confirmAction.willEnable ? "Enable" : "Disable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="adm-search-wrap">
        <span className="adm-search-icon"><SearchIcon /></span>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="adm-search-input"
        />
        {searchTerm && (
          <button className="adm-search-clear" onClick={() => setSearchTerm("")}>✕</button>
        )}
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="adm-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          </svg>
          <p>No users found</p>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={u._id}
                  className={`${u.isActive === false ? "adm-row-disabled" : ""} ${openId === u._id ? "adm-row-open" : ""}`}
                >
                  <td>
                    <div className="adm-user-cell">
                      <div className={`adm-user-avatar ${u.isActive === false ? "disabled" : ""}`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="adm-user-name">{u.name}</span>
                    </div>
                  </td>
                  <td className="adm-user-email">{u.email}</td>
                  <td>
                    <span className={`adm-badge ${u.isActive === false ? "inactive" : "active"}`}>
                      {u.isActive === false ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td className="adm-action-cell">
                    {/* 3-dot trigger */}
                    <button
                      className="adm-options-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenId(openId === u._id ? null : u._id);
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.5"/>
                        <circle cx="12" cy="12" r="1.5"/>
                        <circle cx="12" cy="19" r="1.5"/>
                      </svg>
                    </button>

                    {/* Dropdown */}
                    {openId === u._id && (
                      <div className="adm-dropdown" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="adm-dropdown-item"
                          onClick={() => {
                            setOpenId(null);
                            setConfirmAction({
                              type: "toggle",
                              userId: u._id,
                              name: u.name,
                              willEnable: u.isActive === false,
                            });
                          }}
                        >
                          {u.isActive === false ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                            </svg>
                          )}
                          {u.isActive === false ? "Enable" : "Disable"}
                        </button>
                        <div className="adm-dropdown-divider" />
                        <button
                          className="adm-dropdown-item danger"
                          onClick={() => {
                            setOpenId(null);
                            setConfirmAction({ type: "delete", userId: u._id, name: u.name });
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
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
      )}
    </div>
  );
}
