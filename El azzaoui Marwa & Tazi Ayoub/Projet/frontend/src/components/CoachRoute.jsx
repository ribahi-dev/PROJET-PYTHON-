import { Navigate } from "react-router-dom";

function CoachRoute({ children }) {
  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/login" />;
  }

  let isCoach = false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    isCoach = (payload.role || localStorage.getItem("user_role")) === "coach";
    if (!payload || !payload.user_id) {
      throw new Error("Invalid token");
    }
  } catch {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return <Navigate to="/login" />;
  }

  if (!isCoach) {
    return <Navigate to="/" />;
  }

  return children;
}

export default CoachRoute;
