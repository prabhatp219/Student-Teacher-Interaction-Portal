import { useEffect, useState } from "react";
import "../styles/StudentCourses.css";
import { api } from "../utils/api"; // adjust path if needed

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/student/courses");

        console.log("STUDENT COURSES:", res.data);

        setCourses(res.data.courses || res.data || []);
      } catch (err) {
        console.error(
          "Courses error:",
          err.response?.data || err.message
        );
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
          {courses.map((course) => (
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