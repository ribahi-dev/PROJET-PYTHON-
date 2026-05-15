import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { authFetch, API_BASE_URL } from "../services/api";
import ProgramCard from "../components/ProgramCard";

export default function Home() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${API_BASE_URL}/programs/`)
      .then((res) => res.json())
      .then((data) => setPrograms(Array.isArray(data) ? data : []))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, []);

  const visiblePrograms = useMemo(() => programs, [programs]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <p style={styles.kicker}>Coaching sportif moderne</p>
          <h1 style={styles.heroTitle}>Fitness Coaching App</h1>
          <p style={styles.heroText}>
            Choisissez votre programme, suivez vos entraînements et avancez vers
            vos objectifs avec une expérience claire, motivante et professionnelle.
          </p>
          <div style={styles.heroActions}>
            <a href="#programmes" style={styles.primaryButton}>
              Voir les programmes
            </a>
            <Link to="/dashboard" style={styles.secondaryButton}>
              Mon dashboard
            </Link>
          </div>
        </div>
      </section>

      <section style={styles.statsBand}>
        <div style={styles.statItem}>
          <strong>3+</strong>
          <span>Objectifs sportifs</span>
        </div>
        <div style={styles.statItem}>
          <strong>100%</strong>
          <span>Plans guidés</span>
        </div>
        <div style={styles.statItem}>
          <strong>24/7</strong>
          <span>Accès aux programmes</span>
        </div>
      </section>

      <section id="programmes" style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.kicker}>Programmes</p>
          <h2 style={styles.sectionTitle}>Nos Programmes</h2>
          <p style={styles.sectionText}>
            Des plans simples et efficaces pour prendre du muscle, perdre du poids
            ou démarrer correctement.
          </p>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Chargement des programmes...</div>
        ) : visiblePrograms.length === 0 ? (
          <div style={styles.emptyState}>Aucun programme disponible</div>
        ) : (
          <div style={styles.programGrid}>
            {visiblePrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </section>

      <section style={styles.featureGrid}>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>🏋️</span>
          <h3>Entraînements structurés</h3>
          <p>Des exercices organisés pour savoir exactement quoi faire.</p>
        </div>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>🥗</span>
          <h3>Nutrition claire</h3>
          <p>Des plans alimentaires simples pour soutenir vos progrès.</p>
        </div>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>📈</span>
          <h3>Progression motivante</h3>
          <p>Un dashboard propre pour retrouver vos achats rapidement.</p>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "34px 24px 56px",
    background: "linear-gradient(135deg, #f8fafc 0%, #ecfdf5 52%, #ffffff 100%)",
    color: "#10201c",
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  hero: {
    width: "min(1160px, 100%)",
    minHeight: "520px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    borderRadius: "30px",
    overflow: "hidden",
    backgroundImage:
      "linear-gradient(90deg, rgba(6, 78, 59, 0.9), rgba(15, 118, 110, 0.38)), url(https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 26px 75px rgba(15, 23, 42, 0.18)",
  },
  heroContent: {
    maxWidth: "680px",
    padding: "48px",
    color: "white",
  },
  kicker: {
    margin: "0 0 10px",
    color: "#0f766e",
    fontSize: "13px",
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(42px, 8vw, 74px)",
    lineHeight: 0.95,
  },
  heroText: {
    margin: "20px 0 28px",
    color: "#ecfdf5",
    fontSize: "18px",
    lineHeight: 1.7,
  },
  heroActions: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "14px 22px",
    borderRadius: "15px",
    background: "#22c55e",
    color: "white",
    boxShadow: "0 16px 32px rgba(34, 197, 94, 0.28)",
    fontWeight: 900,
    textDecoration: "none",
  },
  secondaryButton: {
    padding: "14px 22px",
    borderRadius: "15px",
    background: "rgba(255, 255, 255, 0.16)",
    border: "1px solid rgba(255, 255, 255, 0.45)",
    color: "white",
    fontWeight: 900,
    textDecoration: "none",
  },
  statsBand: {
    width: "min(980px, calc(100% - 28px))",
    margin: "-42px auto 56px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    position: "relative",
    zIndex: 2,
  },
  statItem: {
    padding: "22px",
    borderRadius: "20px",
    background: "white",
    border: "1px solid rgba(15, 118, 110, 0.12)",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.09)",
    textAlign: "center",
  },
  section: {
    width: "min(1160px, 100%)",
    margin: "0 auto 34px",
  },
  sectionHeader: {
    maxWidth: "680px",
    marginBottom: "22px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "clamp(30px, 5vw, 44px)",
  },
  sectionText: {
    margin: "12px 0 0",
    color: "#52645f",
    lineHeight: 1.7,
  },
  programGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
  },
  programCard: {
    overflow: "hidden",
    borderRadius: "22px",
    background: "white",
    border: "1px solid rgba(15, 118, 110, 0.12)",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  imageBox: {
    aspectRatio: "16 / 10",
    overflow: "hidden",
    background: "#dcfce7",
  },
  programImage: {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "cover",
  },
  programContent: {
    padding: "22px",
  },
  programTitle: {
    margin: "0 0 10px",
    fontSize: "22px",
  },
  programDescription: {
    minHeight: "70px",
    margin: "0 0 18px",
    color: "#52645f",
    lineHeight: 1.6,
  },
  programFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  price: {
    color: "#0f766e",
    fontSize: "18px",
  },
  cardButton: {
    padding: "11px 16px",
    borderRadius: "13px",
    background: "#0f766e",
    color: "white",
    fontWeight: 900,
    textDecoration: "none",
  },
  featureGrid: {
    width: "min(1160px, 100%)",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
  },
  featureCard: {
    padding: "24px",
    borderRadius: "20px",
    background: "white",
    border: "1px solid rgba(15, 118, 110, 0.12)",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.07)",
  },
  featureIcon: {
    display: "inline-grid",
    placeItems: "center",
    width: "48px",
    height: "48px",
    marginBottom: "12px",
    borderRadius: "15px",
    background: "#dcfce7",
    fontSize: "24px",
  },
  emptyState: {
    padding: "36px",
    borderRadius: "22px",
    background: "white",
    border: "1px dashed rgba(15, 118, 110, 0.35)",
    color: "#64748b",
    textAlign: "center",
  },
};
