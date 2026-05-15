import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL } from "../services/api";

const getFieldError = (data) => {
  if (!data) return "Erreur lors de l'inscription.";

  const value =
    data.detail ||
    data.error ||
    data.non_field_errors ||
    data.password ||
    data.password_confirm ||
    data.username ||
    data.email ||
    data.role;

  if (Array.isArray(value)) return value.join(" ");
  if (typeof value === "object") return Object.values(value).flat().join(" ");
  return value || "Erreur lors de l'inscription.";
};

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("client");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          password_confirm: confirmPassword,
          role,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        localStorage.removeItem("onboarding");
        localStorage.removeItem("onboarding_program");
        localStorage.removeItem("onboarding_data");

        if (data?.access && data?.refresh && data?.user) {
          localStorage.setItem("access", data.access);
          localStorage.setItem("refresh", data.refresh);
          localStorage.setItem("username", data.user.username || username);
          localStorage.setItem("user_role", data.user.role || role);
          setSuccess("Inscription réussie ! Vous êtes maintenant connecté.");
          setTimeout(
            () => navigate(data.user.role === "coach" ? "/coach-dashboard" : "/dashboard"),
            800
          );
          return;
        }

        setSuccess("Compte créé avec succès. Connectez-vous pour continuer.");
        setTimeout(() => navigate("/login"), 900);
      } else {
        setError(getFieldError(data));
      }
    } catch {
      setError("Impossible de se connecter au serveur. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Inscription</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            style={styles.input}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="client">Client</option>
            <option value="coach">Coach</option>
          </select>
          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            style={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        <p style={styles.text}>
          Vous avez déjà un compte ?{" "}
          <Link to="/login" style={styles.link}>
            Connexion
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "15px",
    width: "360px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
    color: "#1e3a8a",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    marginBottom: "15px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  text: {
    marginTop: "15px",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "bold",
  },
  error: {
    marginBottom: "15px",
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
    padding: "10px",
    borderRadius: "8px",
  },
  success: {
    marginBottom: "15px",
    color: "#166534",
    backgroundColor: "#dcfce7",
    padding: "10px",
    borderRadius: "8px",
  },
};
