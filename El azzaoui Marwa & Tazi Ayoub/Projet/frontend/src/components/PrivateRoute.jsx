import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload || !payload.user_id) {
      throw new Error("Invalid token");
    }
  } catch {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute;
