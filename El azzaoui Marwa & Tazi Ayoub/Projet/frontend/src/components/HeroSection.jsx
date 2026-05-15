export default function HeroSection() {
  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <h1 style={styles.title}>
  Transformez votre corps et gagnez en confiance
</h1>

<p style={styles.subtitle}>
  Trouvez les meilleurs coachs fitness et nutrition pour atteindre vos objectifs plus rapidement.
</p>

<div style={styles.buttons}>
  <button style={styles.primary}>Commencer</button>
  <button style={styles.secondary}>Voir les coachs</button>
</div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "80px 20px",
    background: "linear-gradient(to right, #f9fafb, #ecfdf5)",
    textAlign: "center",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#6b7280",
    marginBottom: "30px",
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  primary: {
    padding: "12px 25px",
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  secondary: {
    padding: "12px 25px",
    backgroundColor: "white",
    border: "2px solid #22c55e",
    color: "#22c55e",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};