import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { addProgress, getMyProgress } from "../services/api";
import ProgressCharts from "../components/ProgressCharts";
import ProgressStats from "../components/ProgressStats";
import BadgeSystem from "../components/BadgeSystem";

export default function Progress() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    notes: ""
  });

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await getMyProgress();
      setProgressData(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Erreur lors du chargement des progrès");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgress = async (e) => {
    e.preventDefault();

    if (!formData.weight) {
      toast.error("Veuillez indiquer votre poids.");
      return;
    }

    const weight = Number(formData.weight);
    if (!Number.isFinite(weight) || weight <= 0) {
      toast.error("Le poids doit être un nombre valide.");
      return;
    }

    try {
      await addProgress(weight, formData.notes);
      toast.success("Progression ajoutée avec succès!");
      setShowForm(false);
      setFormData({ weight: "", notes: "" });
      loadProgress();
    } catch {
      toast.error("Erreur lors de l'ajout de la progression");
    }
  };

  return (
    <main className="progress-page">
      <style>
        {`
          .progress-page {
            min-height: 100vh;
            padding: 42px 24px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .progress-container {
            width: min(800px, 100%);
            margin: 0 auto;
          }

          .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
          }

          .progress-header-content {
            flex: 1;
          }

          .progress-kicker {
            margin: 0 0 10px;
            color: #0f766e;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .progress-title {
            margin: 0;
            font-size: clamp(34px, 6vw, 54px);
            line-height: 1;
          }

          .progress-subtitle {
            max-width: 600px;
            margin: 14px 0 0;
            color: #52645f;
            font-size: 16px;
            line-height: 1.7;
          }

          .add-progress-button {
            padding: 12px 24px;
            border: 0;
            border-radius: 12px;
            background: #0f766e;
            color: white;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
            transition: transform 160ms ease, background 160ms ease;
          }

          .add-progress-button:hover {
            transform: translateY(-2px);
            background: #115e59;
          }

          .progress-card {
            margin-bottom: 24px;
            padding: 24px;
            border-radius: 22px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .progress-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 0;
            border-bottom: 1px solid rgba(15, 118, 110, 0.08);
          }

          .progress-item:last-child {
            border-bottom: 0;
          }

          .progress-info {
            flex: 1;
          }

          .progress-day {
            font-weight: 700;
            color: #0f766e;
            margin-bottom: 4px;
          }

          .progress-date {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 4px;
          }

          .progress-note {
            color: #64748b;
            font-size: 14px;
            font-style: italic;
          }

          .progress-weight {
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
          }

          .add-progress-form {
            margin-bottom: 24px;
            padding: 24px;
            border-radius: 22px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .form-title {
            margin: 0 0 20px;
            font-size: 20px;
            font-weight: 900;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-label {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
          }

          .form-input,
          .form-select,
          .form-textarea {
            padding: 12px 16px;
            border: 1px solid rgba(15, 118, 110, 0.2);
            border-radius: 12px;
            background: #f8fafc;
            color: #0f172a;
            font-size: 16px;
            transition: border-color 160ms ease, box-shadow 160ms ease;
          }

          .form-input:focus,
          .form-select:focus,
          .form-textarea:focus {
            outline: none;
            border-color: #0f766e;
            box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
          }

          .form-textarea {
            resize: vertical;
            min-height: 80px;
          }

          .form-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }

          .submit-button {
            padding: 12px 24px;
            border: 0;
            border-radius: 12px;
            background: #0f766e;
            color: white;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
            transition: transform 160ms ease, background 160ms ease;
          }

          .submit-button:hover {
            transform: translateY(-2px);
            background: #115e59;
          }

          .cancel-button {
            padding: 12px 24px;
            border: 1px solid #d1d5db;
            border-radius: 12px;
            background: white;
            color: #374151;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: background 160ms ease;
          }

          .cancel-button:hover {
            background: #f9fafb;
          }

          .empty-state {
            padding: 48px 24px;
            border-radius: 22px;
            background: white;
            border: 1px dashed rgba(15, 118, 110, 0.35);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
            color: #64748b;
            text-align: center;
          }

          .empty-state h2 {
            margin: 0 0 10px;
            color: #0f172a;
            font-size: 25px;
          }

          .empty-state p {
            margin: 0;
            line-height: 1.6;
          }

          .loading {
            text-align: center;
            padding: 40px;
            color: #64748b;
          }

          @media (max-width: 760px) {
            .progress-page {
              padding: 28px 16px;
            }

            .progress-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 16px;
            }

            .progress-card {
              padding: 20px;
            }

            .progress-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }

            .form-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="progress-container">
        <header className="progress-header">
          <div className="progress-header-content">
            <p className="progress-kicker">Suivi des progrès</p>
            <h1 className="progress-title">Mon évolution</h1>
            <p className="progress-subtitle">
              Suivez votre progression au fil des jours avec vos mesures de poids et vos notes personnelles.
            </p>
          </div>

          <button
            className="add-progress-button"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Annuler' : 'Ajouter une mesure'}
          </button>
        </header>

        {showForm && (
          <form className="add-progress-form" onSubmit={handleAddProgress}>
            <h2 className="form-title">Ajouter une mesure de poids</h2>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="weight">Poids (kg)</label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">Notes (optionnel)</label>
              <textarea
                id="notes"
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Comment vous sentez-vous ? Des observations particulières ?"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </button>
              <button type="submit" className="submit-button">
                Ajouter la mesure
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="loading">Chargement des progrès...</div>
        ) : progressData.length === 0 ? (
          <div className="empty-state">
            <h2>Aucune donnée de progression</h2>
            <p>
              Commencez votre programme pour voir apparaître vos mesures de poids et vos notes ici.
            </p>
          </div>
        ) : (
          <>
            <ProgressStats data={progressData} />
            <ProgressCharts data={progressData} />
            <BadgeSystem data={progressData} />

            <div className="progress-card">
              <h2>Dernière mise à jour</h2>
              <p>
                {progressData[0]?.date
                  ? `Dernière mesure enregistrée le ${new Date(progressData[0].date).toLocaleDateString('fr-FR')}`
                  : "Aucune mise à jour disponible"}
              </p>
            </div>
            <div className="progress-card">
              {progressData.map((item, index) => (
                <div key={item.id || index} className="progress-item">
                  <div className="progress-info">
                    <div className="progress-day">{item.program_title || `Programme #${item.program}`}</div>
                    <div className="progress-date">
                      {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : "Date inconnue"}
                    </div>
                    {item.notes && <div className="progress-note">{item.notes}</div>}
                  </div>
                  <div className="progress-weight">{item.weight} kg</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
