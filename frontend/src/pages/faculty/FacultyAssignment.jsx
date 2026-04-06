import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/FacultyAssignment.css";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "/assignments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAssignments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        alert("Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  if (loading) return <p className="faculty-assignment-loading">Loading assignments...</p>;

  return (
    <div className="faculty-assignment-container">
      <h2>All Assignments</h2>

      {assignments.length === 0 ? (
        <p className="faculty-assignment-empty">No assignments found</p>
      ) : (
        <div className="faculty-assignment-list">
          {assignments.map((a) => (
            <div
              key={a._id}
              className="faculty-assignment-card"
              onClick={() => navigate(`/faculty/assignment/${a._id}/submissions`)}
            >
              <div className="faculty-assignment-card-header">
                <h4>{a.title}</h4>
                <span className="faculty-assignment-card-arrow">→</span>
              </div>

              <p className="faculty-assignment-card-desc">
                {a.description}
              </p>

              <div className="faculty-assignment-card-meta">
                <div className="faculty-assignment-card-meta-row">
                  <span className="meta-label">Course</span>
                  <span className="meta-value">
                    {a.course?.title || a.courseName || "Unknown"}
                  </span>
                </div>

                <div className="faculty-assignment-card-meta-row">
                  <span className="meta-label">Due</span>
                  <span className="meta-value">
                    {new Date(a.dueAt).toLocaleString()}
                  </span>
                </div>

                <div className="faculty-assignment-card-meta-row">
                  <span className="meta-label">Status</span>
                  <span className={`assignment-status-badge status-${a.status}`}>
                    {a.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}