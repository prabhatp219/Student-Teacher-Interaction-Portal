import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/FacultyAssignment.css";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/v1/assignments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("DATA:", res.data); // 👈 keep this for sanity

        // ✅ ensure it's always an array
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

  if (loading) return <p>Loading assignments...</p>;

  return (
    <div className="faculty-assignment-container">
      <h2>All Assignments</h2>

      {assignments.length === 0 ? (
        <p>No assignments found</p>
      ) : (
        assignments.map((a) => (
          <div
            key={a._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              margin: "10px 0",
              borderRadius: "8px",
            }}
          >
            <h4>{a.title}</h4>
            <p>{a.description}</p>

            <p>
              <strong>Course:</strong>{" "}
              {a.course?.title || a.courseName || "Unknown"}
            </p>

            <p>
              <strong>Due:</strong>{" "}
              {new Date(a.dueAt).toLocaleString()}
            </p>

            <p>
              <strong>Status:</strong> {a.status}
            </p>
          </div>
        ))
      )}
    </div>
  );
}