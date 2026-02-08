import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import "../../styles/admin_course.css";
const emptyForm = {
  code: "",
  title: "",
  description: "",
  department: "",
  semester: "",
};

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editCourse, setEditCourse] = useState(null);

  // for remove dropdowns (per course)
  const [removeFaculty, setRemoveFaculty] = useState({});
  const [removeStudent, setRemoveStudent] = useState({});

  const [loading, setLoading] = useState(true);

  // ---------------- FETCH ----------------
  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const f = await api.get("/admin/users?role=faculty");
    const s = await api.get("/admin/users?role=student");

    const facultyOnly = (f.data.data || f.data).filter(
      (u) => u.role === "faculty",
    );
    const studentOnly = (s.data.data || s.data).filter(
      (u) => u.role === "student",
    );

    setFaculty(facultyOnly);
    setStudents(studentOnly);
  };

  useEffect(() => {
    fetchCourses();
    fetchUsers();
  }, []);

  // ---------------- CREATE / UPDATE ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCourse) {
        await api.put(`/courses/${editCourse._id}`, form);
      } else {
        await api.post("/courses", form);
      }
      setForm(emptyForm);
      setEditCourse(null);
      fetchCourses();
    } catch {
      alert("Failed to save course");
    }
  };

  // ---------------- ADD (INCREMENTAL) ----------------
  const handleAddFaculty = async (courseId, facultyId) => {
    if (!facultyId) return;
    await api.post(`/courses/${courseId}/add-faculty`, { facultyId });
    fetchCourses();
  };

  const handleAddStudent = async (courseId, studentId) => {
    if (!studentId) return;
    await api.post(`/courses/${courseId}/add-student`, { studentId });
    fetchCourses();
  };

  // ---------------- REMOVE ----------------
  const handleRemoveFaculty = async (courseId, facultyId) => {
    if (!facultyId) return;
    await api.post(`/courses/${courseId}/remove-faculty`, { facultyId });
    setRemoveFaculty({ ...removeFaculty, [courseId]: "" });
    fetchCourses();
  };

  const handleRemoveStudent = async (courseId, studentId) => {
    if (!studentId) return;
    await api.post(`/courses/${courseId}/remove-student`, { studentId });
    setRemoveStudent({ ...removeStudent, [courseId]: "" });
    fetchCourses();
  };

  // ---------------- DELETE COURSE ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    await api.delete(`/courses/${id}`);
    fetchCourses();
  };

  if (loading) return <p>Loading courses...</p>;

  ///////////
  const getAvailableFaculty = (course) => {
    const assignedIds = (course.faculty || []).map((f) =>
      typeof f === "string" ? f : f._id,
    );

    return faculty.filter((f) => !assignedIds.includes(f._id));
  };

  const getAvailableStudents = (course) => {
    const assignedIds = (course.students || []).map((s) =>
      typeof s === "string" ? s : s._id,
    );

    return students.filter((s) => !assignedIds.includes(s._id));
  };

  return (
    <div className="adm-crs-container">
      <h2 className="adm-crs-title">📘 Admin – Course Management</h2>

      {/* CREATE / EDIT FORM */}
      <div className="adm-crs-form-card">
        <h4 className="adm-crs-form-header">
          {editCourse ? "Edit Course" : "Add Course"}
        </h4>
        <form onSubmit={handleSubmit} className="adm-crs-form">
          <div className="adm-crs-form-row">
            <input
              className="adm-crs-input"
              placeholder="Code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
            <input
              className="adm-crs-input"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              className="adm-crs-input"
              placeholder="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
            <input
              className="adm-crs-input"
              type="number"
              placeholder="Sem"
              value={form.semester}
              onChange={(e) =>
                setForm({ ...form, semester: Number(e.target.value) })
              }
            />
          </div>
          <div className="adm-crs-form-row">
            <textarea
              className="adm-crs-textarea"
              placeholder="Course Description..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <button type="submit" className="adm-crs-btn-primary">
              {editCourse ? "Update Course" : "Create Course"}
            </button>
          </div>
        </form>
      </div>

      {/* COURSE TABLE */}
      <div className="adm-crs-table-wrapper">
        <table className="adm-crs-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Faculty</th>
              <th>Students</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c._id}>
                <td className="adm-crs-code-cell">{c.code}</td>
                <td>
                  <strong>{c.title}</strong>
                </td>
                <td>
                  <span className="adm-crs-badge-info">
                    {c.faculty?.length || 0}
                  </span>
                </td>
                <td>
                  <span className="adm-crs-badge-info">
                    {c.students?.length || 0}
                  </span>
                </td>
                <td>
                  <span
                    className={`adm-crs-status ${c.isActive ? "active" : "inactive"}`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="adm-crs-actions-cell">
                  <div className="adm-crs-action-group">
                    <button
                      className="adm-crs-btn-edit"
                      onClick={() => {
                        setEditCourse(c);
                        setForm({
                          code: c.code,
                          title: c.title,
                          department: c.department,
                          semester: c.semester,
                          description: c.description,
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="adm-crs-btn-delete"
                      onClick={() => handleDelete(c._id)}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="adm-crs-select-grid">
                    <select
                      className="adm-crs-select add-f"
                      onChange={(e) => handleAddFaculty(c._id, e.target.value)}
                    >
                      <option value="">+ Faculty</option>
                      {getAvailableFaculty(c).map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="adm-crs-select rem-f"
                      value=""
                      onChange={(e) =>
                        handleRemoveFaculty(c._id, e.target.value)
                      }
                    >
                      <option value="">- Faculty</option>
                      {c.faculty.map((f) => (
                        <option key={f._id || f} value={f._id || f}>
                          {f.name || f}
                        </option>
                      ))}
                    </select>
                    <select
                      className="adm-crs-select add-s"
                      onChange={(e) => handleAddStudent(c._id, e.target.value)}
                    >
                      <option value="">+ Student</option>
                      {getAvailableStudents(c).map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="adm-crs-select rem-s"
                      defaultValue=""
                      onChange={(e) =>
                        handleRemoveStudent(c._id, e.target.value)
                      }
                    >
                      <option value="">- Student</option>
                      {c.students.map((s) => (
                        <option key={s._id || s} value={s._id || s}>
                          {s.name || "Student"}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCourses;
