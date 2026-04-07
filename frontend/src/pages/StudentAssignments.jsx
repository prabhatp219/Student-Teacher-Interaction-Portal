import { useEffect, useState } from "react";
import "../styles/StudentAssignments.css";
import { api } from "../utils/api"; // adjust path if needed

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeId, setActiveId] = useState(null);
  const [answer, setAnswer] = useState("");

  // ✅ fetch assignments
  const fetchAssignments = async () => {
    try {
      const res = await api.get("/assignments/student");

      console.log("STUDENT ASSIGNMENTS:", res.data);

      setAssignments(res.data.assignments || res.data || []);
    } catch (err) {
      console.error(
        "Assignments error:",
        err.response?.data || err.message
      );
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
      await api.post(`/submissions/assignment/${assignmentId}`, {
        answer,
      });

      alert("Submitted successfully");

      setActiveId(null);
      setAnswer("");

      await fetchAssignments(); // refresh UI
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Submission failed");
    }
  };

  if (loading)
    return <div className="st-asgn-loading">Loading assignments...</div>;

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
              
              {/* Header */}
              <div className="st-asgn-card-header">
                <h3>{a.title}</h3>
                <span className="st-asgn-arrow">→</span>
              </div>

              {/* Description */}
              <p className="st-asgn-description-text">{a.description}</p>

              {/* Details */}
              <div className="st-asgn-details-table">
                <div className="st-asgn-row">
                  <span className="st-asgn-label">COURSE</span>
                  <span className="st-asgn-value">
                    {a.course?.title || "Unknown Course"}
                  </span>
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
                    <span className="st-asgn-dot">●</span>{" "}
                    {a.status ? a.status.toUpperCase() : "PUBLISHED"}
                  </div>
                </div>
              </div>

              {/* Interaction */}
              <div className="st-asgn-card-footer">
                {activeId === a._id ? (
                  <div className="st-asgn-expanded-input">
                    <textarea
                      placeholder="Write your answer here..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                    />

                    <div className="st-asgn-action-group">
                      <button
                        className="st-asgn-save-btn"
                        onClick={() => handleSubmit(a._id)}
                      >
                        Submit Answer
                      </button>

                      <button
                        className="st-asgn-cancel-btn"
                        onClick={() => {
                          setActiveId(null);
                          setAnswer("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className={`st-asgn-interaction-btn ${
                      a.status === "submitted" ? "is-submitted" : ""
                    }`}
                    onClick={() => setActiveId(a._id)}
                  >
                    {a.status === "submitted"
                      ? "View Submission"
                      : "Open Assignment"}
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