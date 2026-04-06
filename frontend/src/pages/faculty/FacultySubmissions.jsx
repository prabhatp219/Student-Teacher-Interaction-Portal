import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../../styles/FacultySubmissions.css";

export default function FacultySubmissions() {
  const { id } = useParams();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `/submissions/assignment/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubs(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [id]);

  const getInitials = (name = "") =>
    name?.split(" ")?.slice(0, 2)?.map((n) => n[0])?.join("");

  if (loading)
    return <p className="faculty-submissions-loading">Loading submissions...</p>;

  return (
    <div className="faculty-submissions-container">
      <h2>Submissions</h2>

      {subs.length > 0 && (
        <span className="submissions-count">
          {subs.length} submission{subs.length !== 1 ? "s" : ""}
        </span>
      )}

      {subs.length === 0 ? (
        <p className="faculty-submissions-empty">No submissions yet</p>
      ) : (
        <div className="faculty-submissions-list">
          {subs.map((s) => (
            <div key={s._id} className="submission-card">

              <div className="submission-card-header">
                <div className="submission-avatar">
                  {getInitials(s.student?.name || "?")}
                </div>
                <div className="submission-student-info">
                  <p className="submission-student-name">
                    {s.student?.name || "Unknown Student"}
                  </p>
                  <p className="submission-student-email">
                    {s.student?.email || "—"}
                  </p>
                </div>
                <span className={`submission-grade-badge ${s.grade !== undefined ? "" : "ungraded"}`}>
                  {s.grade !== undefined ? `${s.grade} / 100` : "Ungraded"}
                </span>
              </div>

              {s.content && (
                <div className="submission-answer">
                  <p className="submission-answer-label">Answer</p>
                  <p className="submission-answer-text">{s.content}</p>
                </div>
              )}

              <div className="submission-meta">
                <div className="submission-meta-row">
                  <span className="meta-label">Submitted At</span>
                  <span className="meta-value">
                    {new Date(s.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {s.feedback && (
                <div className="submission-feedback">
                  <p className="submission-feedback-label">Feedback</p>
                  <p className="submission-feedback-text">{s.feedback}</p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}