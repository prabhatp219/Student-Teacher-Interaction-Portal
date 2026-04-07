import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import "../styles/StudentDashboard.css";
import { api } from "../utils/api"; // adjust path if needed

const performanceData = [
  { name: 'Mon', score: 85 },
  { name: 'Tue', score: 92 },
  { name: 'Wed', score: 78 },
  { name: 'Thu', score: 95 },
  { name: 'Fri', score: 88 },
  { name: 'Sat', score: 70 },
  { name: 'Sun', score: 65 },
];

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    pendingAssignments: 0,
    announcements: 0,
  });
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await api.get("/auth/me");
        console.log("ME:", meRes.data);

        setStudentName(meRes.data.name || "");

        const dashboardRes = await api.get("/student/dashboard");
        console.log("DASHBOARD:", dashboardRes.data);

        setStats(dashboardRes.data || {});
      } catch (err) {
        console.error(
          "Student dashboard error:",
          err.response?.data || err.message
        );
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <main className="main-content">
        <header className="header">
          <div>
            <h1 className="greeting-text">
              Hello, {studentName.split(' ')[0] || "Student"} ✨
            </h1>
            <p className="subtext">It's a great day to learn something new.</p>
          </div>

          <div className="profile-section">
            <span className="date-badge">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <div className="avatar">{studentName.charAt(0) || "S"}</div>
          </div>
        </header>

        <section className="stats-grid">
          <StatCard 
            label="Courses" 
            value={stats.enrolledCourses} 
            icon="📖" 
            bg="#E0F2FE" 
            accent="#0369a1" 
          />
          <StatCard 
            label="Tasks Due" 
            value={stats.pendingAssignments} 
            icon="✍️" 
            bg="#F0F9FF" 
            accent="#0ea5e9" 
          />
          <StatCard 
            label="Updates" 
            value={stats.announcements} 
            icon="🔔" 
            bg="#EFF6FF" 
            accent="#1d4ed8" 
          />
        </section>

        <section className="content-grid">
          <div className="content-card-main">
            <div className="card-header">
              <h3 className="card-title">Recent Performance</h3>
              <span className="view-all">View Details</span>
            </div>

            <div className="chart-container" style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {performanceData.map((entry, index) => (
                      <Cell key={index} fill={index === 3 ? '#0ea5e9' : '#e0f2fe'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="content-card-side">
            <h3 className="card-title">Quick Actions</h3>
            <button className="action-btn-primary">Join Next Class</button>
            <button className="action-btn-secondary">Submit Assignment</button>
            <button className="action-btn-secondary">Message Teacher</button>
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, icon, bg, accent }) => (
  <div className="stat-card" style={{ borderLeft: `5px solid ${accent}` }}>
    <div className="icon-circle" style={{ backgroundColor: bg }}>{icon}</div>
    <div>
      <h2 className="stat-value">{value}</h2>
      <p className="stat-label">{label}</p>
    </div>
  </div>
);

export default StudentDashboard;