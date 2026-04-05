import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/StudentAssignments.css";

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW states
  const [activeId, setActiveId] = useState(null);
  const [answer, setAnswer] = useState("");

  // ✅ fetch assignments
  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/v1/assignments/student",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAssignments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Assignments error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // ✅ submit handler
  const handleSubmit = async (assignmentId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/v1/submissions/assignment/${assignmentId}`,
        { answer },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Submitted successfully");

      setActiveId(null);
      setAnswer("");

      await fetchAssignments(); // refresh UI

    } catch (err) {
      console.error(err);
      alert("Submission failed");
    }
  };

  if (loading) return <div className="st-asgn-loading">Loading assignments...</div>;

  return (
    <div className="st-asgn-page-wrapper">
      <div className="st-asgn-header-container">
        <h1 className="st-asgn-main-title">All Assignments</h1>
      </div>

      {assignments.length === 0 ? (
        <div className="st-asgn-empty-state">
          <p>No assignments available.</p>
        </div>
      ) : (
        <div className="st-asgn-grid-layout">
          {assignments.map((a) => (
            <div className="st-asgn-card-v2" key={a._id}>
              
              {/* Card Top: Title & Arrow icon */}
              <div className="st-asgn-card-header">
                <h3>{a.title}</h3>
                <span className="st-asgn-arrow">→</span>
              </div>
              
              {/* Description */}
              <p className="st-asgn-description-text">{a.description}</p>

              {/* Data Rows: Detailed Info */}
              <div className="st-asgn-details-table">
                <div className="st-asgn-row">
                  <span className="st-asgn-label">COURSE</span>
                  <span className="st-asgn-value">{a.course?.title || "Unknown Course"}</span>
                </div>
                
                <div className="st-asgn-row">
                  <span className="st-asgn-label">DUE</span>
                  <span className="st-asgn-value">
                    {new Date(a.dueAt).toLocaleString()}
                  </span>
                </div>
                
                <div className="st-asgn-row">
                  <span className="st-asgn-label">STATUS</span>
                  <div className={`st-asgn-pill-badge st-asgn-pill-${a.status}`}>
                    <span className="st-asgn-dot">●</span> {a.status ? a.status.toUpperCase() : "PUBLISHED"}
                  </div>
                </div>
              </div>

              {/* Interaction Area: Buttons & Textarea */}
              <div className="st-asgn-card-footer">
                {activeId === a._id ? (
                  <div className="st-asgn-expanded-input">
                    <textarea
                      placeholder="Write your answer here..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                    />
                    <div className="st-asgn-action-group">
                      <button className="st-asgn-save-btn" onClick={() => handleSubmit(a._id)}>
                        Submit Answer
                      </button>
                      <button className="st-asgn-cancel-btn" onClick={() => setActiveId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    className={`st-asgn-interaction-btn ${a.status === "submitted" ? "is-submitted" : ""}`}
                    onClick={() => setActiveId(a._id)}
                  >
                    {a.status === "submitted" ? "View Submission" : "Open Assignment"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;