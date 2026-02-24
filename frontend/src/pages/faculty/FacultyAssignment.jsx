import { useState } from "react";
import axios from "axios";
import "../../styles/FacultyAssignment.css";

export default function FacultyAssignment({ courseId }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueAt: "",
    maxMarks: "",
    allowLate: false,
    latePenaltyPercent: 0,
    status: "not published"
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `/api/assignments/course/${courseId}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Created assignment:", res.data);
      alert("Assignment created successfully");

      setForm({
        title: "",
        description: "",
        dueAt: "",
        maxMarks: "",
        allowLate: false,
        latePenaltyPercent: 0,
        status: "not published"
      });

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error creating assignment");
    }
  };

  return (
    <div className="faculty-assignment-container">
      <h2>Create Assignment</h2>

      <form className="assignment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Assignment title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Assignment description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          type="datetime-local"
          name="dueAt"
          value={form.dueAt}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="maxMarks"
          placeholder="Maximum marks"
          value={form.maxMarks}
          onChange={handleChange}
          min="1"
          required
        />

        <label className="checkbox">
          <input
            type="checkbox"
            name="allowLate"
            checked={form.allowLate}
            onChange={handleChange}
          />
          Allow late submission
        </label>

        {form.allowLate && (
          <input
            type="number"
            name="latePenaltyPercent"
            placeholder="Late penalty (%)"
            value={form.latePenaltyPercent}
            onChange={handleChange}
            min="0"
            max="100"
          />
        )}

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="not published">Not Published</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <button type="submit">Create Assignment</button>
      </form>
    </div>
  );
}