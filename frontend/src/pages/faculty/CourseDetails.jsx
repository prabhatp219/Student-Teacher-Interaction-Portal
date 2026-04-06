import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../styles/CourseDetails.css";

const CourseDetails = () => {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]); // ✅ NEW
  const [loading, setLoading] = useState(true);

  // assignment form states
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // ✅ FETCH COURSE
  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `/courses/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch course");

      const data = await res.json();
      setCourse(data);
    } catch (err) {
      console.error("Error fetching course:", err);
    }
  };

  // ✅ FETCH ASSIGNMENTS
  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `/assignments/course/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    }
  };

  // ✅ LOAD BOTH
  useEffect(() => {
    const loadData = async () => {
      await fetchCourse();
      await fetchAssignments();
      setLoading(false);
    };

    loadData();
  }, [id]);

  // ✅ CREATE ASSIGNMENT
  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `/assignments/course/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            dueAt: new Date(dueDate),
            maxMarks: 100,
            allowLate: false,
            latePenaltyPercent: 0,
            status: "draft",
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to create assignment");

      await fetchAssignments(); // 🔥 refresh list

      // reset form
      setTitle("");
      setDescription("");
      setDueDate("");
      setShowForm(false);

      alert("Assignment created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error creating assignment");
    }
  };

  if (loading)
    return <div className="course-details-loading">Loading course...</div>;

  if (!course)
    return <div className="course-details-error">Course not found</div>;

  return (
    <div className="course-details-container">
      <h2 className="course-details-title">{course.title}</h2>

      <div className="course-details-info">
        <p><strong style={{color:"black"}}>Code:</strong>{" "}<span style={{ color: "black" }}>{course.code || "Not set"}</span></p>
        <p><strong style={{color:"black"}}>Department:</strong>{" "}<span style={{ color: "black" }}>{course.department || "Not set"}</span></p>
        <p><strong style={{color:"black"}}>Semester:</strong>{" "}<span style={{ color: "black" }}>{course.semester || "Not set"}</span></p>
        <p><strong style={{color:"black"}}>Description:</strong>{" "}<span style={{ color: "black" }}>{course.description || "Not set"}</span></p>
      </div>

      <hr className="course-details-divider" />

      {/* ✅ FACULTY (UNCHANGED) */}
      <section className="course-details-section">
        <h3>Faculties</h3>
        {course.faculty && course.faculty.length > 0 ? (
          <ul className="course-details-list">
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

      <hr className="course-details-divider" />

      {/* ✅ STUDENTS (UNCHANGED) */}
      <section className="course-details-section">
        <h3>Students Enrolled</h3>
        {course.students && course.students.length > 0 ? (
          <ul className="course-details-list">
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

      <hr className="course-details-divider" />

      {/* ✅ ASSIGNMENTS (FIXED PART) */}
      <section className="course-details-section">
        <h3>Assignments</h3>

        <button
          className="course-details-create-btn"
          onClick={() => setShowForm(!showForm)}
        >
          Create Assignment
        </button>

        {showForm && (
          <form
            className="course-details-form"
            onSubmit={handleCreateAssignment}
          >
            <div className="course-details-form-group">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="course-details-form-group">
              <label>Description / Question</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="course-details-form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="course-details-form-actions">
              <button type="submit">Create</button>
              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ✅ SHOW ASSIGNMENTS */}
        {assignments.length === 0 ? (
          <p className="course-details-placeholder">
            No assignments yet.
          </p>
        ) : (
          assignments.map((a) => (
            <div key={a._id} className="assignment-card">
              <h4>{a.title}</h4>
              <p>{a.description}</p>
              <p>
                Due: {new Date(a.dueAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default CourseDetails;