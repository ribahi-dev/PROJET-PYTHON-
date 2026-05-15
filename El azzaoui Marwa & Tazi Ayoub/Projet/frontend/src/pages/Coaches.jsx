import { useEffect, useMemo, useState } from "react";
import CoachCard from "../components/CoachCard";
import { API_BASE_URL } from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Coaches() {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tous");

  const getRoleFromToken = () => {
    const token = localStorage.getItem("access");
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split(".")[1])).role;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const tokenRole = getRoleFromToken();
    let userRole = null;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      userRole = user?.role;
    } catch {
      userRole = null;
    }

    const role = tokenRole || userRole || localStorage.getItem("user_role");

    if (role === "coach") {
      navigate("/coach-dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const loadCoaches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/coaches/`);
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des coachs");
        }
        const data = await response.json();
        setCoaches(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        toast.error("Impossible de charger les coachs");
        setCoaches([]);
      } finally {
        setLoading(false);
      }
    };

    loadCoaches();
  }, []);

  const uniqueSpecialties = useMemo(() => {
    const specialties = new Set(coaches.map((c) => c.specialty).filter(Boolean));
    return ["Tous", ...Array.from(specialties).sort()];
  }, [coaches]);

  const filteredCoaches = useMemo(() => {
    if (selectedSpecialty === "Tous") {
      return coaches;
    }
    return coaches.filter((coach) => coach.specialty === selectedSpecialty);
  }, [coaches, selectedSpecialty]);

  return (
    <main className="coaches-page">
      <style>
        {`
          .coaches-page {
            min-height: 100vh;
            padding: 42px 24px 60px;
            background: linear-gradient(180deg, #f8fafc 0%, #ecfdf5 56%, #ffffff 100%);
            color: #0f172a;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .coaches-container {
            width: min(1180px, 100%);
            margin: 0 auto;
          }

          .coaches-hero {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 32px;
          }

          .coaches-hero h1 {
            margin: 0;
            font-size: clamp(38px, 6vw, 56px);
            line-height: 1.02;
          }

          .coaches-hero p {
            max-width: 660px;
            margin: 18px 0 0;
            color: #475569;
            font-size: 16px;
            line-height: 1.8;
          }

          .filter-panel {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            align-items: center;
            margin-bottom: 26px;
          }

          .filter-label {
            font-size: 14px;
            font-weight: 800;
            color: #0f766e;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }

          .filter-select {
            min-width: 180px;
            padding: 14px 16px;
            border-radius: 16px;
            border: 1px solid rgba(15, 118, 110, 0.18);
            background: white;
            color: #0f172a;
            font-size: 15px;
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
          }

          .coaches-grid {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            align-items: stretch;
          }

          .loading-state,
          .empty-state {
            margin-top: 24px;
            padding: 40px 24px;
            border-radius: 24px;
            text-align: center;
            background: white;
            border: 1px dashed rgba(15, 118, 110, 0.24);
            box-shadow: 0 20px 48px rgba(15, 23, 42, 0.06);
          }

          .loading-state h2,
          .empty-state h2 {
            margin: 0 0 10px;
            font-size: 24px;
            color: #0f172a;
          }

          .loading-state p,
          .empty-state p {
            margin: 0;
            color: #667085;
            line-height: 1.7;
          }

          .error-state {
            margin-top: 24px;
            padding: 20px 24px;
            border-radius: 16px;
            background: #fee2e2;
            border: 1px solid #fca5a5;
            color: #991b1b;
            text-align: center;
          }

          @media (max-width: 900px) {
            .coaches-hero {
              flex-direction: column;
              gap: 18px;
            }

            .coaches-grid {
              justify-content: center;
            }
          }

          @media (max-width: 640px) {
            .filter-panel {
              flex-direction: column;
              align-items: stretch;
            }

            .filter-select {
              width: 100%;
            }
          }
        `}
      </style>

      <div className="coaches-container">
        <section className="coaches-hero">
          <div>
            <p className="filter-label">Coachs Disponibles</p>
            <h1>Nos coachs</h1>
            <p>
              Découvrez les coachs spécialisés disponibles pour vous accompagner
              dans votre parcours fitness.
            </p>
          </div>

          <div className="filter-panel">
            <label className="filter-label" htmlFor="specialty">
              Filtrer par spécialité
            </label>
            <select
              id="specialty"
              className="filter-select"
              value={selectedSpecialty}
              onChange={(event) => setSelectedSpecialty(event.target.value)}
            >
              {uniqueSpecialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading ? (
          <div className="loading-state">
            <h2>Chargement...</h2>
            <p>Récupération des coachs disponibles.</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <h2>Erreur</h2>
            <p>{error}</p>
          </div>
        ) : coaches.length === 0 ? (
          <div className="empty-state">
            <h2>Aucun coach disponible</h2>
            <p>Revenez plus tard pour de nouvelles offres.</p>
          </div>
        ) : filteredCoaches.length === 0 ? (
          <div className="empty-state">
            <h2>Aucun coach trouvé</h2>
            <p>Essayez un autre filtre ou revenez plus tard pour de nouvelles offres.</p>
          </div>
        ) : (
          <div className="coaches-grid">
            {filteredCoaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
