import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { authFetchJson, API_BASE_URL } from "../services/api";

const getUserIdFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch {
    return null;
  }
};

export default function CoachDashboard() {
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [newProgram, setNewProgram] = useState({
    title: "",
    description: "",
    duration: "30",
    price: "",
  });

  useEffect(() => {
    loadCoachData();
  }, []);

  const loadCoachData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Charger les rendez-vous du coach
      const appointmentsRes = await authFetchJson(
        `${API_BASE_URL}/appointments/my/`
      );
      setAppointments(Array.isArray(appointmentsRes) ? appointmentsRes : []);

      // 2️⃣ Récupérer les clients uniques (via rendez-vous)
      const clientsMap = new Map();
      (Array.isArray(appointmentsRes) ? appointmentsRes : []).forEach((apt) => {
        if (!apt.client) return;
        clientsMap.set(apt.client, {
          id: apt.client,
          name: apt.client_name || `Client #${apt.client}`,
        });
      });
      setClients(Array.from(clientsMap.values()));

      // 3️⃣ Charger les programmes du coach
      const programsRes = await authFetchJson(`${API_BASE_URL}/programs/`);
      const allPrograms = Array.isArray(programsRes) ? programsRes : [];
      const currentUserId = getUserIdFromToken(localStorage.getItem("access"));

      const ownedPrograms = allPrograms.filter(
        (program) => String(program.coach) === String(currentUserId)
      );

      setPrograms(ownedPrograms);
    } catch (error) {
      setError("Impossible de charger les données du dashboard.");
      toast.error("Erreur lors du chargement du dashboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async () => {
    if (!newProgram.title.trim() || !newProgram.description.trim()) {
      toast.error("Titre et description requis");
      return;
    }

    const duration = Number(newProgram.duration);
    const price = Number(newProgram.price);

    if (!Number.isFinite(duration) || duration <= 0) {
      toast.error("La durée doit être un nombre valide.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Le prix doit être un nombre valide.");
      return;
    }

    try {
      const response = await authFetchJson(`${API_BASE_URL}/programs/`, {
        method: "POST",
        body: JSON.stringify({
          title: newProgram.title.trim(),
          description: newProgram.description.trim(),
          duration,
          price,
        }),
      });

      setPrograms([...programs, response]);
      setNewProgram({ title: "", description: "", duration: "30", price: "" });
      setShowCreateProgram(false);
      toast.success("Programme créé !");
      await loadCoachData();
    } catch (error) {
      toast.error("Erreur lors de la création du programme");
      console.error(error);
    }
  };

  const stats = {
    clients: clients.length,
    appointments: appointments.filter((a) => a.status === "booked").length,
    programs: programs.length,
    revenue: "Non disponible",
  };

  const formatPrice = (value) => {
    const price = Number(value);
    if (!Number.isFinite(price) || price <= 0) return "Prix non disponible";
    return `${price.toFixed(2)} DH`;
  };

  const formatDate = (value) => {
    if (!value) return "Non disponible";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Non disponible";
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <main className="coach-dashboard">
      <style>
        {`
          .coach-dashboard {
            min-height: 100vh;
            padding: 42px 24px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .coach-container {
            width: min(1280px, 100%);
            margin: 0 auto;
          }

          .coach-header {
            margin-bottom: 42px;
          }

          .coach-title {
            margin: 0 0 8px;
            font-size: clamp(36px, 6vw, 48px);
            font-weight: 900;
            color: #0f172a;
          }

          .coach-subtitle {
            margin: 0;
            color: #64748b;
            font-size: 18px;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 42px;
          }

          .stat-card {
            background: white;
            border-radius: 18px;
            border: 1px solid rgba(15, 118, 110, 0.12);
            padding: 28px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
            text-align: center;
          }

          .stat-number {
            margin: 0;
            font-size: 42px;
            font-weight: 900;
            color: #0f766e;
          }

          .stat-label {
            margin: 8px 0 0;
            color: #64748b;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .section {
            margin-bottom: 42px;
          }

          .section-title {
            margin: 0 0 20px;
            font-size: 22px;
            font-weight: 900;
            color: #0f172a;
            border-bottom: 2px solid #0f766e;
            padding-bottom: 12px;
          }

          .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
          }

          .card {
            background: white;
            border-radius: 16px;
            border: 1px solid rgba(15, 118, 110, 0.12);
            padding: 20px;
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
            transition: all 200ms ease;
          }

          .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 12px;
          }

          .card-title {
            margin: 0;
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
          }

          .card-badge {
            background: #dcfce7;
            color: #166534;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .card-badge.booked {
            background: #fef08a;
            color: #854d0e;
          }

          .card-badge.available {
            background: #dbeafe;
            color: #1e40af;
          }

          .card-content {
            margin: 0;
            color: #52645f;
            font-size: 14px;
            line-height: 1.6;
          }

          .progress-item {
            background: #f8fafc;
            border-radius: 10px;
            padding: 12px;
            margin: 8px 0;
            font-size: 13px;
            color: #52645f;
          }

          .progress-weight {
            font-weight: 700;
            color: #0f766e;
          }

          .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #64748b;
          }

          .empty-state h3 {
            margin: 0 0 8px;
            font-size: 18px;
          }

          .empty-state p {
            margin: 0;
            font-size: 14px;
          }

          .create-program-section {
            background: white;
            border-radius: 18px;
            border: 1px solid rgba(15, 118, 110, 0.12);
            padding: 28px;
            margin-bottom: 42px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-label {
            display: block;
            margin-bottom: 6px;
            font-weight: 700;
            color: #0f172a;
            font-size: 14px;
          }

          .form-input,
          .form-textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid rgba(15, 118, 110, 0.2);
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            box-sizing: border-box;
          }

          .form-input:focus,
          .form-textarea:focus {
            outline: none;
            border-color: #0f766e;
            box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
          }

          .form-textarea {
            resize: vertical;
            min-height: 100px;
          }

          .button-group {
            display: flex;
            gap: 12px;
          }

          .btn {
            padding: 12px 24px;
            border-radius: 10px;
            border: 0;
            font-weight: 700;
            cursor: pointer;
            transition: all 160ms ease;
            font-size: 14px;
          }

          .btn-primary {
            background: #0f766e;
            color: white;
            box-shadow: 0 8px 16px rgba(15, 118, 110, 0.24);
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(15, 118, 110, 0.32);
          }

          .btn-secondary {
            background: #ecfdf5;
            color: #0f766e;
            border: 1px solid rgba(15, 118, 110, 0.2);
          }

          .btn-secondary:hover {
            background: #d1fae5;
          }

          @media (max-width: 768px) {
            .coach-dashboard {
              padding: 24px 16px;
            }

            .coach-title {
              font-size: 28px;
            }

            .stats-grid {
              grid-template-columns: 1fr;
            }

            .cards-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="coach-container">
        {loading ? (
          <div className="empty-state">
            <h3>Chargement du dashboard...</h3>
          </div>
        ) : (
          <>
            <div className="coach-header">
              <h1 className="coach-title">entraineur
                🎯</h1>
              <p className="coach-subtitle">
                Gérez vos clients, rendez-vous et programmes
              </p>
            </div>

            {error && (
              <div className="empty-state">
                <h3>Erreur</h3>
                <p>{error}</p>
              </div>
            )}

            {/* 📊 STATISTIQUES */}
            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-number">{stats.clients}</p>
                <p className="stat-label">Clients actifs</p>
              </div>
              <div className="stat-card">
                <p className="stat-number">{stats.appointments}</p>
                <p className="stat-label">Rendez-vous réservés</p>
              </div>
              <div className="stat-card">
                <p className="stat-number">{stats.programs}</p>
                <p className="stat-label">Programmes créés</p>
              </div>
              <div className="stat-card">
                <p className="stat-number">{stats.revenue}</p>
                <p className="stat-label">Revenus</p>
              </div>
            </div>

            {/* ➕ CRÉER UN PROGRAMME */}
            <div className="section">
              {!showCreateProgram ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateProgram(true)}
                  style={{ marginBottom: "20px" }}
                >
                  + Créer un nouveau programme
                </button>
              ) : (
                <div className="create-program-section">
                  <h2 className="section-title">Nouveau Programme</h2>
                  <div className="form-group">
                    <label className="form-label">Titre du programme</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Ex: Prise de masse 12 semaines"
                      value={newProgram.title}
                      onChange={(e) =>
                        setNewProgram({ ...newProgram, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Décrivez le programme..."
                      value={newProgram.description}
                      onChange={(e) =>
                        setNewProgram({
                          ...newProgram,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Durée (jours)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      step="1"
                      value={newProgram.duration}
                      onChange={(e) =>
                        setNewProgram({
                          ...newProgram,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prix (DH)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Ex: 199"
                      value={newProgram.price}
                      onChange={(e) =>
                        setNewProgram({
                          ...newProgram,
                          price: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="button-group">
                    <button
                      className="btn btn-primary"
                      onClick={handleCreateProgram}
                    >
                      Créer le programme
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowCreateProgram(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 👥 MES CLIENTS */}
            <div className="section">
              <h2 className="section-title">👥 Mes clients ({clients.length})</h2>
              {clients.length === 0 ? (
                <div className="empty-state">
                  <h3>Aucun client pour le moment</h3>
                  <p>Les clients apparaîtront quand ils réserveront un créneau</p>
                </div>
              ) : (
                <div className="cards-grid">
                  {clients.map((client) => (
                    <div key={client.id} className="card">
                      <div className="card-header">
                        <h3 className="card-title">
                          {client.name || "Client non disponible"}
                        </h3>
                      </div>
                      <p className="card-content">Client suivi via rendez-vous.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 📅 MES CRÉNEAUX */}
            <div className="section">
              <h2 className="section-title">
                📅 Mes rendez-vous ({appointments.length})
              </h2>
              {appointments.length === 0 ? (
                <div className="empty-state">
                  <h3>Aucun rendez-vous</h3>
                  <p>Créez des créneaux disponibles pour que les clients vous réservent</p>
                </div>
              ) : (
                <div className="cards-grid">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="card">
                      <div className="card-header">
                        <h3 className="card-title">
                          {formatDate(apt.date)} à {apt.time || "Non disponible"}
                        </h3>
                        <span
                          className={`card-badge ${apt.status === "booked" ? "booked" : "available"}`}
                        >
                          {apt.status === "booked" ? "Réservé" : "Disponible"}
                        </span>
                      </div>
                      <p className="card-content">
                        <strong>Client:</strong>{" "}
                        {apt.client_name || "Non réservé"}
                      </p>
                      {apt.notes && (
                        <p className="card-content">
                          <strong>Notes:</strong> {apt.notes}
                        </p>
                      )}
                      {apt.video_link && (
                        <p className="card-content">
                          <strong>Lien vidéo:</strong>{" "}
                          <a
                            href={apt.video_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#0f766e" }}
                          >
                            Rejoindre
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 📚 MES PROGRAMMES */}
            <div className="section">
              <h2 className="section-title">
                📚 Mes programmes ({programs.length})
              </h2>
              {programs.length === 0 ? (
                <div className="empty-state">
                  <h3>Aucun programme créé</h3>
                  <p>Créez votre premier programme pour vos clients</p>
                </div>
              ) : (
                <div className="cards-grid">
                  {programs.map((prog) => (
                    <div key={prog.id} className="card">
                      <h3 className="card-title">{prog.title || "Programme fitness"}</h3>
                      <p className="card-content">
                        {prog.description || "Description non disponible"}
                      </p>
                      <p className="card-content">
                        <strong>Durée:</strong> {prog.duration || "Non disponible"} jours
                      </p>
                      <p className="card-content">
                        <strong>Prix:</strong> {formatPrice(prog.price)}
                      </p>
                      <p className="card-content">
                        <strong>Exercices:</strong>{" "}
                        {prog.exercises?.length ? prog.exercises.length : "Aucun exercice"}
                      </p>
                      <p className="card-content">
                        <strong>Nutrition:</strong>{" "}
                        {prog.nutrition_plans?.length
                          ? prog.nutrition_plans.length
                          : "Aucun plan nutritionnel"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
