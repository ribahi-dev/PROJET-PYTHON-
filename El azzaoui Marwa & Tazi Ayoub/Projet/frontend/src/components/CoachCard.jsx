import { Link } from "react-router-dom";
export default function CoachCard({ coach }) {
  if (!coach) return null;

  const {
    username = "Non renseigné",
    email = "Non renseigné",
    specialty = "Aucune spécialité",
    experience = 0,
    description = "Aucune description",
    price = 0,
  } = coach;

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div>
          <h3 style={styles.title}>{username}</h3>
          <p style={styles.specialty}>{specialty || "Non renseigné"}</p>
        </div>
        <span style={styles.price}>{price > 0 ? `${price} MAD` : "Gratuit"}</span>
      </div>

      <div style={styles.infoRow}>
        <span style={styles.infoLabel}>Email:</span>
        <span style={styles.infoValue}>{email}</span>
      </div>

      <div style={styles.infoRow}>
        <span style={styles.infoLabel}>Expérience:</span>
        <span style={styles.infoValue}>{experience} ans</span>
      </div>

      <div style={styles.descriptionBox}>
        <span style={styles.descriptionLabel}>À propos:</span>
        <p style={styles.descriptionText}>
          {description || "Aucune description"}
        </p>
      </div>

      <Link to={`/coach/${coach.id}`}>
  <button style={styles.button}>
    Voir le profil
  </button>
</Link>
    </div>
  );
}

const styles = {
  card: {
    display: "grid",
    gap: "16px",
    padding: "24px",
    borderRadius: "28px",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fdfb 100%)",
    border: "1px solid rgba(15, 118, 110, 0.14)",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
    minWidth: "280px",
    flex: "1 1 280px",
    transition: "transform 180ms ease, box-shadow 180ms ease",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    color: "#0f172a",
    fontWeight: 900,
  },
  specialty: {
    margin: "8px 0 0",
    color: "#475569",
    fontSize: "14px",
  },
  price: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },
  infoLabel: {
    fontWeight: 700,
    color: "#0f766e",
    minWidth: "90px",
  },
  infoValue: {
    color: "#475569",
  },
  descriptionBox: {
    display: "grid",
    gap: "8px",
    padding: "12px",
    borderRadius: "14px",
    background: "#f8fafc",
  },
  descriptionLabel: {
    fontWeight: 700,
    color: "#0f766e",
    fontSize: "13px",
  },
  descriptionText: {
    margin: 0,
    color: "#475569",
    fontSize: "13px",
    lineHeight: "1.5",
  },
  button: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "none",
    background: "#0f766e",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    transition: "transform 160ms ease, background 160ms ease",
  },
};