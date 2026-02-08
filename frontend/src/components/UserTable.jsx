import { useState, useEffect, useRef } from "react";
import "../styles/admin_user.css";

export default function UserTable({ users, onDisable, onDelete }) {
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const dropdownRef = useRef(null);

  /* ------------------ FILTER USERS ------------------ */
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const term = searchTerm.trim().toLowerCase();
      if (!term) {
        setFilteredUsers(users);
      } else {
        setFilteredUsers(
          users.filter(
            (u) =>
              u.name.toLowerCase().includes(term) ||
              u.email.toLowerCase().includes(term),
          ),
        );
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, users]);

  /* ------------------ DROPDOWN LOGIC ------------------ */
  const toggleMenu = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenId(null);
      }
    };

    if (openId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openId]);

  /* ------------------ RENDER ------------------ */
  return (
    <div className="adm_table_section">
      {/* Search */}
      <div className="adm_search_container">
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="adm_search_input"
          />
          <span
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.5,
            }}
          >
            🔍
          </span>
        </div>
      </div>

      {/* Table */}
      {filteredUsers.length === 0 ? (
        <div className="adm_no_results">No matches found.</div>
      ) : (
        <div className="adm_table_wrapper">
          <div className="adm_table_scroll_area">
            <table className="adm_table_main">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>

                    <td className="adm_action_cell">
                      <button
                        className="adm_options_btn"
                        onClick={() =>
                          setOpenId(openId === u._id ? null : u._id)
                        }
                      >
                        Options
                      </button>

                      {openId === u._id && (
                        <div
                          style={{
                            marginTop: "8px",
                            display: "flex",
                            gap: "8px",
                          }}
                        >
                          <button
                            className="adm_options_btn"
                            onClick={() => onDisable(u._id)}
                          >
                            Disable
                          </button>

                          <button
                            className="adm_options_btn"
                            style={{
                              background: "#fdecea",
                              color: "#d9534f",
                            }}
                            onClick={() => onDelete(u._id)}
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
        </div>
      )}
    </div>
  );
}
