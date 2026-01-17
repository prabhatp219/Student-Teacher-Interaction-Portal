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
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH ----------------
  const fetchCourses = async () => {
    const res = await api.get("/admin/courses");
    setCourses(res.data);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const f = await api.get("/admin/users?role=faculty");
    const s = await api.get("/admin/users?role=student");
    setFaculty(f.data.data || f.data);
    setStudents(s.data.data || s.data);
  };

  useEffect(() => {
    fetchCourses();
    fetchUsers();
  }, []);

  // ---------------- CREATE / UPDATE ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCourse) {
        await api.put(`/admin/courses/${selectedCourse._id}`, form);
      } else {
        await api.post("/admin/courses", form);
      }
      setForm(emptyForm);
      setSelectedCourse(null);
      fetchCourses();
    } catch {
      alert("Failed to save course");
    }
  };

  // ---------------- ASSIGN USERS ----------------
  const handleAssign = async () => {
    await api.patch(`/admin/courses/${selectedCourse._id}/assign`, {
      faculty: selectedCourse.faculty,
      students: selectedCourse.students,
    });
    fetchCourses();
    setSelectedCourse(null);
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    await api.delete(`/admin/courses/${id}`);
    fetchCourses();
  };

  if (loading) return <p>Loading courses...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2>📘 Admin – Course Management</h2>

      {/* CREATE / EDIT FORM */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <h4>{selectedCourse ? "Edit Course" : "Add Course"}</h4>

        <input placeholder="Code" value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })} required />

        <input placeholder="Title" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} required />

        <input placeholder="Department" value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })} />

        <input type="number" placeholder="Semester" value={form.semester}
          onChange={(e) => setForm({ ...form, semester: e.target.value })} />

        <textarea placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />

        <button type="submit">
          {selectedCourse ? "Update Course" : "Create Course"}
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
              <td>{c.faculty?.length || 0}</td>
              <td>{c.students?.length || 0}</td>
              <td>{c.isActive ? "Active" : "Inactive"}</td>
              <td>
                <button onClick={() => {
                  setSelectedCourse(c);
                  setForm(c);
                }}>Edit</button>

                <button onClick={() => setSelectedCourse(c)}>
                  Assign
                </button>

                <button onClick={() => handleDelete(c._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ASSIGN MODAL */}
      {selectedCourse && (
        <div style={{ marginTop: 20 }}>
          <h4>Assign Users – {selectedCourse.title}</h4>

          <label>Faculty</label>
          <select
            multiple
            value={selectedCourse.faculty}
            onChange={(e) =>
              setSelectedCourse({
                ...selectedCourse,
                faculty: [...e.target.selectedOptions].map(o => o.value),
              })
            }>
            {faculty.map(f => (
              <option key={f._id} value={f._id}>{f.name}</option>
            ))}
          </select>

          <label>Students</label>
          <select
            multiple
            value={selectedCourse.students}
            onChange={(e) =>
              setSelectedCourse({
                ...selectedCourse,
                students: [...e.target.selectedOptions].map(o => o.value),
              })
            }>
            {students.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          <button onClick={handleAssign}>Save Assignments</button>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
