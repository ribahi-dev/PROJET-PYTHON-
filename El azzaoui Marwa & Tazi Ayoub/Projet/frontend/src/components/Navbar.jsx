import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { authFetch, API_BASE_URL } from "../services/api";

const getDisplayName = (user) => {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return fullName || user.username || user.email || "";
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = Boolean(localStorage.getItem("access"));
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("user_display_name") || ""
  );
  const [userRole, setUserRole] = useState(localStorage.getItem("user_role"));

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setUserRole(null);
      setDisplayName(localStorage.getItem("username") || "");
      return;
    }

    let payload;
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setUserRole(null);
      setDisplayName(localStorage.getItem("username") || "");
      return;
    }

    const userId = payload.user_id;
    const role = payload.role || localStorage.getItem("user_role");

    setUserRole(role);
    if (role) {
      localStorage.setItem("user_role", role);
    }

    if (!token || !userId) {
      setDisplayName("");
      return;
    }

    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await authFetch(`${API_BASE_URL}/users/${userId}/`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Unable to load user");
        }

        const name = getDisplayName(data);

        if (isMounted) {
          setDisplayName(name);
          localStorage.setItem("user_display_name", name);
          if (data.role) {
            setUserRole(data.role);
            localStorage.setItem("user_role", data.role);
          }
        }
      } catch {
        if (isMounted) {
          setDisplayName(localStorage.getItem("username") || "");
        }
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("user_display_name");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  return (
    <nav className="app-navbar">
      <style>
        {`
          .app-navbar {
            position: sticky;
            top: 0;
            z-index: 30;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 14px 30px;
            background: rgba(255, 255, 255, 0.92);
            border-bottom: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
            backdrop-filter: blur(16px);
          }

          .app-logo {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: #0f172a;
            font-size: 18px;
            font-weight: 900;
            text-decoration: none;
            white-space: nowrap;
          }

          .app-logo-mark {
            display: grid;
            place-items: center;
            width: 38px;
            height: 38px;
            border-radius: 14px;
            background: linear-gradient(135deg, #0f766e, #16a34a);
            color: white;
            font-size: 14px;
            box-shadow: 0 12px 24px rgba(15, 118, 110, 0.24);
          }

          .app-nav-links {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            flex-wrap: wrap;
          }

          .app-nav-link,
          .user-greeting,
          .logout-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 38px;
            padding: 0 13px;
            border-radius: 999px;
            color: #475569;
            font-size: 14px;
            font-weight: 850;
            text-decoration: none;
            transition: transform 160ms ease, background 160ms ease, color 160ms ease, box-shadow 160ms ease;
          }

          .app-nav-link:hover,
          .logout-button:hover {
            transform: translateY(-1px);
            background: #f0fdfa;
            color: #0f766e;
          }

          .user-greeting {
            background: #f0fdfa;
            color: #0f766e;
            box-shadow: inset 0 0 0 1px rgba(15, 118, 110, 0.12);
          }

          .app-nav-link.active {
            background: #dcfce7;
            color: #166534;
            box-shadow: inset 0 0 0 1px rgba(22, 101, 52, 0.08);
          }

          .logout-button {
            border: 0;
            background: #0f766e;
            color: white;
            cursor: pointer;
            box-shadow: 0 12px 24px rgba(15, 118, 110, 0.2);
          }

          .logout-button:hover {
            background: #115e59;
            color: white;
          }

          @media (max-width: 760px) {
            .app-navbar {
              align-items: flex-start;
              flex-direction: column;
              padding: 14px 16px;
            }

            .app-nav-links {
              width: 100%;
              justify-content: flex-start;
            }
          }
        `}
      </style>

      <Link to="/" className="app-logo">
        <span className="app-logo-mark">FC</span>
        <span>Fitness Coaching</span>
      </Link>

      <div className="app-nav-links">
        <NavLink to="/" className="app-nav-link">
          Accueil
        </NavLink>
        <NavLink to="/programmes" className="app-nav-link">
          Programmes
        </NavLink>
        <NavLink to="/coaches" className="app-nav-link">
          Coachs
        </NavLink>
        {isLoggedIn && userRole !== "coach" && (
          <NavLink to="/dashboard" className="app-nav-link">
            Dashboard
          </NavLink>
        )}
        {isLoggedIn && userRole === "coach" && (
          <NavLink to="/coach-dashboard" className="app-nav-link">
            Coach Dashboard
          </NavLink>
        )}
        <NavLink to="/articles" className="app-nav-link">
          Articles
        </NavLink>
        {isLoggedIn && (
          <NavLink to="/profile" className="app-nav-link">
            Profile
          </NavLink>
        )}
        {isLoggedIn && (
          <NavLink to="/messages" className="app-nav-link">
            Messages
          </NavLink>
        )}
        {isLoggedIn && (
          <NavLink to="/appointments" className="app-nav-link">
            Rendez-vous
          </NavLink>
        )}
        {isLoggedIn && userRole !== "coach" && (
          <NavLink to="/progress" className="app-nav-link">
            Progression
          </NavLink>
        )}

        {isLoggedIn ? (
          <>
            {displayName && (
              <span className="user-greeting">Bonjour {displayName}</span>
            )}
            <button type="button" className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="app-nav-link">
              Login
            </NavLink>
            <NavLink to="/register" className="app-nav-link">
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
