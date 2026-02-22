import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/StudentAssignments.css";

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/v1/student/assignments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAssignments(res.data || []);
      } catch (err) {
        console.error("Assignments error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  if (loading) return <p>Loading assignments...</p>;

  return (
    <div className="student-assignments-page">
      <h1>My Assignments</h1>

      {assignments.length === 0 ? (
        <p>No assignments available.</p>
      ) : (
        <div className="student-assignments-list">
          {assignments.map((a) => (
            <div className="assignment-card" key={a._id}>
              <h3>{a.title}</h3>
              <p className="course-name">{a.course?.title}</p>
              <p>{a.description}</p>

              <p className="due-date">
                Due: {new Date(a.dueDate).toLocaleDateString()}
              </p>

              <span className={`status ${a.status}`}>
                {a.status}
              </span>

              <button className="submit-btn">
                {a.status === "submitted" ? "View Submission" : "Submit"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
