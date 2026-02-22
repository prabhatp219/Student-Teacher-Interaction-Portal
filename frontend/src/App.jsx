import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
//student
import StudentLayout from "./pages/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCourses from "./pages/StudentCourses";
import StudentAssignments from "./pages/StudentAssignments";
// faculty
// import FacultyDashboard from "./pages/FacultyDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyLayout from "./pages/faculty/FacultyLayout";
//admin
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminUsers from "./pages/admin_subpages/AdminUsers";
import AdminCourses from "./pages/admin_subpages/AdminCourses";
import Dashboard from "./pages/admin_subpages/Dashboard";
import AdminLayout from "./pages/AdminLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="assignments" element={<StudentAssignments />} />
      </Route>

      {/* Faculty */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute role="faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="courses" element={<AdminCourses />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<div>404 — Page not found</div>} />
    </Routes>
  );
}
