export default function Footer() {
  return (
    <footer style={styles.footer}>
      <p>© 2026 Fitness Coaching App - Tous droits réservés</p>
    </footer>
  );
}

const styles = {
  footer: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#222",
    color: "white",
    marginTop: "40px",
  },
};