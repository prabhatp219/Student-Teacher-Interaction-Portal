import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/StudentCourses.css";

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/v1/student/courses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCourses(res.data || []);
      } catch (err) {
        console.error("Courses error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <p>Loading courses...</p>;

  return (
    <div className="student-courses-page">
      <h1>My Courses</h1>

      {courses.length === 0 ? (
        <p>No courses enrolled yet.</p>
      ) : (
        <div className="student-courses-grid">
          {courses.map(course => (
            <div className="student-course-card" key={course._id}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
