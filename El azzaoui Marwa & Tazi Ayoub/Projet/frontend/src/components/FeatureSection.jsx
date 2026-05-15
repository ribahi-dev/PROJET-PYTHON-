export default function FeatureSection() {
  return (
    <section style={styles.section}>
      <h2 style={styles.title}>Pourquoi nous choisir</h2>

<div style={styles.grid}>
  <div style={styles.card}>
    <h3>Coaching personnalisé</h3>
    <p>Des programmes adaptés à votre corps et vos objectifs.</p>
  </div>

  <div style={styles.card}>
    <h3>Plans nutritionnels</h3>
    <p>Des repas équilibrés conçus par des experts.</p>
  </div>

  <div style={styles.card}>
    <h3>Suivi des progrès</h3>
    <p>Suivez votre évolution étape par étape.</p>
  </div>
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
  },
  grid: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  card: {
    width: "250px",
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "#f9fafb",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
};