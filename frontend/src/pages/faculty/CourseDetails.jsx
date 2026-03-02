import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token"); // 👈 get JWT

        const res = await fetch(
          `http://localhost:5000/api/v1/courses/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // 👈 send token properly
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch course");
        }

        const data = await res.json();

        console.log("ID from URL:", id);
        console.log("Course from backend:", data);

        setCourse(data);
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) return <div style={{ padding: "20px" }}>Loading course...</div>;

  if (!course)
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Course not found
      </div>
    );

  return (
    <div style={{ padding: "30px" }}>
      <h2>{course.title}</h2>

      <div style={{ marginTop: "15px" }}>
        <p><strong>Code:</strong> {course.code || "Not set"}</p>
        <p><strong>Department:</strong> {course.department || "Not set"}</p>
        <p><strong>Semester:</strong> {course.semester || "Not set"}</p>
        <p><strong>Description:</strong> {course.description || "Not set"}</p>
      </div>

      <hr style={{ margin: "25px 0" }} />

      <section>
        <h3>Faculty</h3>
        {course.faculty && course.faculty.length > 0 ? (
          <ul>
            {course.faculty.map((f) => (
              <li key={f._id}>
                {f.name} ({f.email})
              </li>
            ))}
          </ul>
        ) : (
          <p>No faculty assigned.</p>
        )}
      </section>

      <hr style={{ margin: "25px 0" }} />

      <section>
        <h3>Students</h3>
        {course.students && course.students.length > 0 ? (
          <ul>
            {course.students.map((student) => (
              <li key={student._id}>
                {student.name} ({student.email})
              </li>
            ))}
          </ul>
        ) : (
          <p>No students enrolled yet.</p>
        )}
      </section>

      <hr style={{ margin: "25px 0" }} />

      <section>
        <h3>Assignments</h3>
        <button
          style={{
            padding: "8px 14px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
        >
          Create Assignment
        </button>

        <p>Assignments for this course will appear here.</p>
      </section>
    </div>
  );
};

export default CourseDetails;