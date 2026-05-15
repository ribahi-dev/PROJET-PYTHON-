import { useState, useEffect } from "react";
import { API_BASE_URL } from "../services/api";

export default function CoachPreview() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoaches = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/coaches/`);
        if (response.ok) {
          const data = await response.json();
          const limitedCoaches = Array.isArray(data) ? data.slice(0, 3) : [];
          setCoaches(limitedCoaches);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des coachs:", error);
        setCoaches([]);
      } finally {
        setLoading(false);
      }
    };

    loadCoaches();
  }, []);

  if (loading) {
    return (
      <section style={styles.section}>
        <h2 style={styles.title}>Nos coachs</h2>
        <div style={styles.loadingMessage}>Chargement...</div>
      </section>
    );
  }

  if (coaches.length === 0) {
    return (
      <section style={styles.section}>
        <h2 style={styles.title}>Nos coachs</h2>
        <div style={styles.loadingMessage}>Aucun coach disponible pour le moment.</div>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>Nos coachs</h2>

      <div style={styles.grid}>
        {coaches.map((coach) => (
          <div key={coach.id} style={styles.card}>
            <h3 style={styles.cardTitle}>{coach.username || "Coach"}</h3>
            <p style={styles.cardSpecialty}>
              {coach.specialty || "Spécialité non renseignée"}
            </p>
            <p style={styles.cardInfo}>
              <strong>
                {coach.price > 0 ? `${coach.price} MAD` : "Gratuit"}
              </strong>
            </p>
            <p style={styles.cardExp}>Exp: {coach.experience} ans</p>
            <button style={styles.button}>Voir le profil</button>
          </div>
        ))}
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "60px 20px",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "30px",
    color: "#0f172a",
  },
  loadingMessage: {
    color: "#64748b",
    fontSize: "1.1rem",
  },
  grid: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    width: "250px",
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    border: "1px solid rgba(15, 118, 110, 0.12)",
    textAlign: "left",
  },
  cardTitle: {
    margin: "0 0 8px 0",
    fontSize: "1.2rem",
    color: "#0f172a",
  },
  cardSpecialty: {
    margin: "0 0 4px 0",
    color: "#475569",
    fontSize: "0.9rem",
  },
  cardInfo: {
    margin: "0 0 4px 0",
    color: "#166534",
    fontSize: "0.95rem",
  },
  cardExp: {
    margin: "0 0 12px 0",
    color: "#64748b",
    fontSize: "0.85rem",
  },
  button: {
    width: "100%",
    marginTop: "10px",
    padding: "10px 16px",
    border: "none",
    backgroundColor: "#0f766e",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 160ms ease",
  },
};