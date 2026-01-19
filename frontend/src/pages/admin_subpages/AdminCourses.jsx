import { useEffect, useState } from "react";
import { api } from "../../utils/api";

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
    <div style={{ padding: 24 }}>
      <h2>📘 Admin – Course Management</h2>

      {/* CREATE / EDIT FORM */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <h4>{editCourse ? "Edit Course" : "Add Course"}</h4>

        <input
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
        />

        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <input
          placeholder="Department"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />

        <input
          type="number"
          placeholder="Semester"
          value={form.semester}
          onChange={(e) =>
            setForm({ ...form, semester: Number(e.target.value) })
          }
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <button type="submit">
          {editCourse ? "Update Course" : "Create Course"}
        </button>
      </form>

      {/* COURSE TABLE */}
      <table border="1" cellPadding="8" width="100%">
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
              <td>{c.code}</td>
              <td>{c.title}</td>

              {/* COUNT ONLY */}
              <td>{c.faculty?.length || 0}</td>
              <td>{c.students?.length || 0}</td>

              <td>{c.isActive ? "Active" : "Inactive"}</td>

              {/* ACTIONS */}
              <td>
                <div style={{ marginBottom: 6 }}>
                  <button
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

                  <button onClick={() => handleDelete(c._id)}>Delete</button>
                </div>

                {/* ADD FACULTY */}
                <div>
                  <select
                    onChange={(e) => handleAddFaculty(c._id, e.target.value)}
                  >
                    <option value="">Add faculty</option>
                    {getAvailableFaculty(c).map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* REMOVE FACULTY */}
                <div>
                  <select
                    value=""
                    onChange={(e) => {
                      const facultyId = e.target.value;
                      if (!facultyId) return;
                      handleRemoveFaculty(c._id, facultyId);
                    }}
                  >
                    <option value="">Remove faculty</option>
                    {c.faculty.map((f) => (
                      <option key={f._id || f} value={f._id || f}>
                        {f.name || f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ADD STUDENT */}
                <div>
                  <select
                    onChange={(e) => handleAddStudent(c._id, e.target.value)}
                  >
                    <option value="">Add student</option>
                    {getAvailableStudents(c).map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* REMOVE STUDENT */}
                <div>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const studentId = e.target.value;
                      if (!studentId) return;
                      handleRemoveStudent(c._id, studentId);
                    }}
                  >
                    <option value="">Remove student</option>
                    {c.students.map((s) => (
                      <option key={s._id || s} value={s._id || s}>
                        {s.name || s.name.name}
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
  );
};

export default AdminCourses;
