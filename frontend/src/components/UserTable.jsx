import { useState, useEffect, useRef } from "react";
import "../styles/admin_user.css";

export default function UserTable({ users, onDisable, onDelete }) {
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

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

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenId(null);
      }
    }
    if (openId !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openId]);

  return (
    <div className="adm_table_section">
      {/* Search Header */}
      <div className="adm_search_container">
        <div className="adm_search_input_wrapper" style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="adm_search_input"
          />
          <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        </div>
      </div>

      {/* Table Area */}
      {filteredUsers.length === 0 ? (
        <div className="adm_no_results">No matches found.</div>
      ) : (
        <div className="adm_table_wrapper">
          <table className="adm_table_main">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
          </table>
          
          <div className="adm_table_scroll_area">
            <table className="adm_table_main">
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td className="adm_action_cell">
                      <button
                        className="adm_options_btn"
                        onClick={() => setOpenId(openId === user._id ? null : user._id)}
                      >
                        Options <span>▾</span>
                      </button>

                      {openId === user._id && (
                        <div ref={dropdownRef} className="adm_options_menu">
                          <button
                            className="adm_menu_item"
                            onClick={() => { setOpenId(null); onDisable(user._id); }}
                          >
                            Disable
                          </button>
                          <button
                            className="adm_menu_item danger"
                            onClick={() => { setOpenId(null); onDelete(user._id); }}
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