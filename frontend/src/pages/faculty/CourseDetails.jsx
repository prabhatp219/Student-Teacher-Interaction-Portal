import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../styles/CourseDetails.css";

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // assignment form states
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:5000/api/v1/courses/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch course");
        }

        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/v1/assignments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            dueDate,
            courseId: id,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to create assignment");
      }

      const data = await res.json();
      console.log("Assignment created:", data);

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
    return (
      <div className="course-details-error">
        Course not found
      </div>
    );

  return (
    <div className="course-details-container">

      <h2 className="course-details-title">{course.title}</h2>

      <div className="course-details-info">
        <p><strong>Code:</strong> {course.code || "Not set"}</p>
        <p><strong>Department:</strong> {course.department || "Not set"}</p>
        <p><strong>Semester:</strong> {course.semester || "Not set"}</p>
        <p><strong>Description:</strong> {course.description || "Not set"}</p>
      </div>

      <hr className="course-details-divider" />

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
              <button
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <p className="course-details-placeholder">
          Assignments for this course will appear here.
        </p>

      </section>

    </div>
  );
};

export default CourseDetails;