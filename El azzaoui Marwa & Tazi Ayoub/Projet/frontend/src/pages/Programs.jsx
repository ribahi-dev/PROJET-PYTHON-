import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { authFetch, API_BASE_URL } from "../services/api";
import ProgramCard from "../components/ProgramCard";

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiProgram, setAiProgram] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const programsResponse = await fetch(`${API_BASE_URL}/programs/`);
        const programsData = await programsResponse.json();

        setPrograms(Array.isArray(programsData) ? programsData : []);

        try {
          const paymentsResponse = await authFetch(`${API_BASE_URL}/payments/my/`);
          const paymentsData = await paymentsResponse.json();
          setPurchasedIds(
            Array.isArray(paymentsData)
              ? paymentsData
                  .map((payment) =>
                    typeof payment.program === "object"
                      ? payment.program?.id
                      : payment.program
                  )
                  .filter(Boolean)
              : []
          );
        } catch {
          setPurchasedIds([]);
        }
      } catch {
        setPrograms([]);
        setError("Impossible de charger les programmes.");
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, []);

  const visiblePrograms = useMemo(() => programs, [programs]);

  const handleGenerateProgram = async () => {
    setAiLoading(true);

    try {
      const response = await authFetch(`${API_BASE_URL}/programs/generate-program/`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error("AI generation failed");
      }

      setAiProgram(data);
      toast.success("Programme IA généré");
    } catch {
      toast.error("Impossible de générer un programme IA");
    } finally {
      setAiLoading(false);
    }
  };

  const renderAiProgram = () => {
    if (!aiProgram) return null;

    if (typeof aiProgram === "string") {
      return <p className="ai-text">{aiProgram}</p>;
    }

    const title = aiProgram.title || aiProgram.name || "Programme personnalisé IA";
    const description =
      aiProgram.description ||
      aiProgram.goal ||
      aiProgram.objective ||
      "Voici une proposition générée automatiquement selon les données disponibles.";
    const exercises = aiProgram.exercises || aiProgram.workouts || [];
    const nutritionPlans = aiProgram.nutrition_plans || aiProgram.nutrition || [];

    return (
      <>
        <h3>{title}</h3>
        <p className="ai-text">{description}</p>

        {Array.isArray(exercises) && exercises.length > 0 && (
          <div className="ai-list">
            <strong>Exercices</strong>
            {exercises.map((exercise, index) => (
              <span key={exercise.id || exercise.name || index}>
                {typeof exercise === "string"
                  ? exercise
                  : `${exercise.name || "Exercice"} - ${exercise.sets || 0} séries x ${
                      exercise.reps || 0
                    } reps`}
              </span>
            ))}
          </div>
        )}

        {Array.isArray(nutritionPlans) && nutritionPlans.length > 0 && (
          <div className="ai-list">
            <strong>Nutrition</strong>
            {nutritionPlans.map((plan, index) => (
              <span key={plan.id || plan.title || index}>
                {typeof plan === "string"
                  ? plan
                  : `${plan.title || "Plan nutritionnel"}${
                      plan.calories ? ` - ${plan.calories} kcal` : ""
                    }`}
              </span>
            ))}
          </div>
        )}

        {!Array.isArray(exercises) && !Array.isArray(nutritionPlans) && (
          <pre className="ai-json">{JSON.stringify(aiProgram, null, 2)}</pre>
        )}
      </>
    );
  };

  return (
    <main className="programs-page">
      <style>
        {`
          .programs-page {
            min-height: 100vh;
            padding: 42px 24px 56px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 52%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .programs-container {
            width: min(1160px, 100%);
            margin: 0 auto;
          }

          .programs-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 24px;
            margin-bottom: 28px;
          }

          .programs-kicker {
            margin: 0 0 10px;
            color: #0f766e;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .programs-title {
            margin: 0;
            font-size: clamp(34px, 6vw, 54px);
            line-height: 1;
          }

          .programs-text {
            max-width: 650px;
            margin: 14px 0 0;
            color: #52645f;
            font-size: 16px;
            line-height: 1.7;
          }

          .programs-count {
            min-width: 180px;
            padding: 20px;
            border-radius: 20px;
            background: #ffffff;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .ai-panel {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 18px;
            align-items: center;
            margin-bottom: 28px;
            padding: 24px;
            border-radius: 22px;
            background: linear-gradient(135deg, #0f766e, #16a34a);
            color: white;
            box-shadow: 0 24px 60px rgba(15, 118, 110, 0.2);
          }

          .ai-panel h2 {
            margin: 0 0 8px;
            font-size: 25px;
          }

          .ai-panel p {
            max-width: 680px;
            margin: 0;
            color: #dcfce7;
            line-height: 1.6;
          }

          .ai-button {
            min-height: 48px;
            padding: 0 18px;
            border: 0;
            border-radius: 15px;
            background: white;
            color: #0f766e;
            box-shadow: 0 14px 28px rgba(15, 23, 42, 0.14);
            cursor: pointer;
            font-size: 15px;
            font-weight: 900;
            white-space: nowrap;
            transition: transform 160ms ease, box-shadow 160ms ease;
          }

          .ai-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 18px 34px rgba(15, 23, 42, 0.2);
          }

          .ai-button:disabled {
            cursor: wait;
            opacity: 0.78;
          }

          .ai-result {
            margin: -8px 0 30px;
            padding: 24px;
            border-radius: 22px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .ai-result h3 {
            margin: 0 0 10px;
            color: #0f172a;
            font-size: 22px;
          }

          .ai-text {
            margin: 0 0 16px;
            color: #52645f;
            line-height: 1.7;
          }

          .ai-list {
            display: grid;
            gap: 10px;
            margin-top: 16px;
          }

          .ai-list strong {
            color: #0f766e;
          }

          .ai-list span,
          .ai-json {
            padding: 12px 14px;
            border-radius: 14px;
            background: #f8fafc;
            border: 1px solid #d1fae5;
            color: #334155;
          }

          .ai-json {
            overflow: auto;
          }

          .programs-count strong {
            display: block;
            color: #0f766e;
            font-size: 38px;
            line-height: 1;
          }

          .programs-count span {
            display: block;
            margin-top: 8px;
            color: #64748b;
            font-size: 14px;
            font-weight: 800;
          }

          .program-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
          }

          .program-card {
            overflow: hidden;
            border-radius: 22px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
          }

          .program-card:hover {
            transform: translateY(-6px) scale(1.01);
            border-color: rgba(20, 184, 166, 0.34);
            box-shadow: 0 26px 62px rgba(15, 23, 42, 0.14);
          }

          .program-image-box {
            position: relative;
            aspect-ratio: 16 / 10;
            overflow: hidden;
            background: #dcfce7;
          }

          .program-image {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            transition: transform 220ms ease;
          }

          .program-card:hover .program-image {
            transform: scale(1.04);
          }

          .paid-badge {
            position: absolute;
            top: 14px;
            right: 14px;
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(220, 252, 231, 0.95);
            color: #166534;
            box-shadow: 0 10px 22px rgba(22, 101, 52, 0.16);
            font-size: 13px;
            font-weight: 900;
          }

          .program-content {
            padding: 22px;
          }

          .program-title {
            margin: 0 0 10px;
            color: #0f172a;
            font-size: 22px;
            line-height: 1.25;
          }

          .program-description {
            min-height: 72px;
            margin: 0 0 18px;
            color: #52645f;
            font-size: 15px;
            line-height: 1.6;
          }

          .program-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .program-price {
            color: #0f766e;
            font-size: 18px;
            font-weight: 900;
          }

          .program-button {
            padding: 11px 16px;
            border-radius: 13px;
            background: #0f766e;
            color: white;
            font-weight: 900;
            text-decoration: none;
            transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
          }

          .program-button:hover {
            transform: translateY(-2px);
            background: #115e59;
            box-shadow: 0 14px 28px rgba(15, 118, 110, 0.22);
          }

          .empty-state {
            padding: 42px 24px;
            border-radius: 22px;
            background: white;
            border: 1px dashed rgba(15, 118, 110, 0.35);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
            color: #64748b;
            text-align: center;
          }

          @media (max-width: 760px) {
            .programs-page {
              padding: 28px 16px 42px;
            }

            .programs-header {
              align-items: stretch;
              flex-direction: column;
            }

            .programs-count {
              min-width: 0;
            }

            .ai-panel {
              grid-template-columns: 1fr;
            }

            .ai-button {
              width: 100%;
            }
          }
        `}
      </style>

      <div className="programs-container">
        <header className="programs-header">
          <div>
            <p className="programs-kicker">Programmes fitness</p>
            <h1 className="programs-title">Tous les programmes</h1>
            <p className="programs-text">
              Choisissez un programme adapte a votre objectif et accedez a une
              experience simple, claire et motivante.
            </p>
          </div>

          <div className="programs-count">
            <strong>{loading ? "..." : visiblePrograms.length}</strong>
            <span>Programmes disponibles</span>
          </div>
        </header>

        <section className="ai-panel">
          <div>
            <h2>Coach IA instantané</h2>
            <p>
              Génère une proposition de programme personnalisée et affiche-la
              directement ici pour inspirer ton prochain entraînement.
            </p>
          </div>
          <button
            type="button"
            className="ai-button"
            onClick={handleGenerateProgram}
            disabled={aiLoading}
          >
            {aiLoading ? "Génération..." : "Générer un programme avec IA"}
          </button>
        </section>

        {aiProgram && <section className="ai-result">{renderAiProgram()}</section>}

        {loading ? (
          <div className="empty-state">Chargement des programmes...</div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : visiblePrograms.length === 0 ? (
          <div className="empty-state">Aucun programme disponible</div>
        ) : (
          <section className="program-grid">
            {visiblePrograms.map((program) => {
              const isPaid = purchasedIds.some(
                (purchasedId) => String(purchasedId) === String(program.id)
              );

              return (
                <ProgramCard
                  key={program.id}
                  program={program}
                  isPaid={isPaid}
                  showPaidBadge={true}
                />
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
