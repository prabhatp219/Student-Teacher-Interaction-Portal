import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const StudentRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Optional: while auth state is loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not a student
  if (user.role !== "student") {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized student
  return children;
};

export default StudentRoute;
