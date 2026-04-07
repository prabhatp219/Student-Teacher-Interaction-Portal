import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../styles/CourseDetails.css";
import { api } from "../../utils/api"; // adjust path if needed

const CourseDetails = () => {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // ✅ FETCH COURSE
  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${id}`);

      console.log("COURSE:", res.data);

      setCourse(res.data.course || res.data);
    } catch (err) {
      console.error(
        "Error fetching course:",
        err.response?.data || err.message
      );
    }
  };

  // ✅ FETCH ASSIGNMENTS
  const fetchAssignments = async () => {
    try {
      const res = await api.get(`/assignments/course/${id}`);

      console.log("COURSE ASSIGNMENTS:", res.data);

      setAssignments(res.data.assignments || res.data || []);
    } catch (err) {
      console.error(
        "Error fetching assignments:",
        err.response?.data || err.message
      );
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
      await api.post(`/assignments/course/${id}`, {
        title,
        description,
        dueAt: new Date(dueDate),
        maxMarks: 100,
        allowLate: false,
        latePenaltyPercent: 0,
        status: "draft",
      });

      await fetchAssignments();

      setTitle("");
      setDescription("");
      setDueDate("");
      setShowForm(false);

      alert("Assignment created successfully!");
    } catch (err) {
      console.error(err.response?.data || err.message);
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
        <p><strong>Code:</strong> {course.code || "Not set"}</p>
        <p><strong>Department:</strong> {course.department || "Not set"}</p>
        <p><strong>Semester:</strong> {course.semester || "Not set"}</p>
        <p><strong>Description:</strong> {course.description || "Not set"}</p>
      </div>

      <hr className="course-details-divider" />

      {/* Faculty */}
      <section className="course-details-section">
        <h3>Faculties</h3>
        {course.faculty?.length ? (
          <ul className="course-details-list">
            {course.faculty.map((f) => (
              <li key={f._id}>{f.name} ({f.email})</li>
            ))}
          </ul>
        ) : (
          <p>No faculty assigned.</p>
        )}
      </section>

      <hr className="course-details-divider" />

      {/* Students */}
      <section className="course-details-section">
        <h3>Students Enrolled</h3>
        {course.students?.length ? (
          <ul className="course-details-list">
            {course.students.map((s) => (
              <li key={s._id}>{s.name} ({s.email})</li>
            ))}
          </ul>
        ) : (
          <p>No students enrolled yet.</p>
        )}
      </section>

      <hr className="course-details-divider" />

      {/* Assignments */}
      <section className="course-details-section">
        <h3>Assignments</h3>

        <button
          className="course-details-create-btn"
          onClick={() => setShowForm(!showForm)}
        >
          Create Assignment
        </button>

        {showForm && (
          <form className="course-details-form" onSubmit={handleCreateAssignment}>
            <div className="course-details-form-group">
              <label>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="course-details-form-group">
              <label>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="course-details-form-group">
              <label>Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>

            <div className="course-details-form-actions">
              <button type="submit">Create</button>
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {assignments.length === 0 ? (
          <p>No assignments yet.</p>
        ) : (
          assignments.map((a) => (
            <div key={a._id} className="assignment-card">
              <h4>{a.title}</h4>
              <p>{a.description}</p>
              <p>Due: {new Date(a.dueAt).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default CourseDetails;