import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/MyCourses.css";
import { api } from "../../utils/api";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/my/faculty");

        console.log("COURSES:", res.data);

        setCourses(res.data.courses || res.data || []);
      } catch (err) {
        console.error("MyCourses error:", err.response?.data || err.message);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading)
    return <div className="fct-status-msg">Loading assigned courses...</div>;

  return (
    <div className="fct-dashboard-wrapper">
      <header className="fct-header-section">
        <h2 className="fct-main-title">My Assigned Courses</h2>
      </header>

      {courses.length === 0 ? (
        <p className="fct-empty-state">
          No courses have been assigned to you yet.
        </p>
      ) : (
        <div className="fct-course-grid">
          {courses.map((course) => (
            <div
              key={course._id}
              className="fct-course-card-item"
              onClick={() => navigate(`/faculty/courses/${course._id}`)}
            >
              <h3 className="fct-card-heading">{course.title}</h3>
              <div className="fct-card-details">
                <p><span>Code:</span> {course.code}</p>
                <p><span>Dept:</span> {course.department}</p>
                <p><span>Semester:</span> {course.semester}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}