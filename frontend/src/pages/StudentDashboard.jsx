import { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import "../styles/StudentDashboard.css";

// Mock data for the performance chart
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
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const meRes = await axios.get("http://localhost:5000/api/v1/auth/me", { headers });
        setStudentName(meRes.data.name);
        
        const dashboardRes = await axios.get("http://localhost:5000/api/v1/student/dashboard", { headers });
        setStats(dashboardRes.data);
      } catch (err) {
        console.error("Student dashboard error:", err);
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
            
            {/* Functional Chart Implementation */}
            <div className="chart-container" style={{ width: '100%', height: 250, marginTop: '10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={35}>
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#0ea5e9' : '#e0f2fe'} />
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