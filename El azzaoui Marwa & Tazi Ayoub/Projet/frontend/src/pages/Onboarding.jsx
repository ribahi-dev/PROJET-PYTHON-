import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const initialFormData = {
  age: "",
  gender: "male",
  weight: "",
  height: "",
  goal: "lose weight",
  experience: "beginner",
  activityLevel: "sedentary",
  injuries: "",
  medicalConditions: "",
  dietType: "normal",
  workoutDays: "3",
  preferredTraining: "home",
};

const goalLabels = {
  "lose weight": "Perte de poids",
  "gain muscle": "Prise de muscle",
  "maintain fitness": "Maintien de forme",
};

const experienceLabels = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
};

function generateProgram(userData) {
  const workoutDays = Number(userData.workoutDays || 3);
  const location =
    userData.preferredTraining === "gym" ? "en salle" : "à la maison";
  const healthNote =
    userData.injuries || userData.medicalConditions
      ? "Le programme reste modéré et doit être adapté à vos contraintes de santé."
      : "Le programme peut progresser chaque semaine si la récupération reste bonne.";

  let title = "Programme forme personnalisé";
  let description =
    `Plan ${location} sur ${workoutDays} jours/semaine pour améliorer votre condition physique.`;
  let exercises = [];
  let nutrition =
    "Privilégiez des repas équilibrés, une bonne hydratation et des portions régulières.";

  if (userData.goal === "lose weight") {
    title = "Programme brûle-graisse cardio + HIIT";
    description =
      `Objectif perte de poids : ${workoutDays} séances/semaine avec cardio, circuits courts et renforcement complet. ${healthNote}`;
    exercises = [
      "Marche rapide ou vélo - 25 minutes",
      "Squats contrôlés - 3 séries x 12 reps",
      "Mountain climbers - 3 séries x 30 secondes",
      "Gainage - 3 séries x 30 secondes",
      "Circuit HIIT léger - 12 minutes",
    ];
    nutrition =
      "Visez un léger déficit calorique, augmentez les légumes, gardez une source de protéines à chaque repas et limitez les boissons sucrées.";
  }

  if (userData.goal === "gain muscle") {
    title = "Programme force et hypertrophie";
    description =
      `Objectif prise de muscle : ${workoutDays} séances/semaine centrées sur la surcharge progressive et les mouvements polyarticulaires. ${healthNote}`;
    exercises = [
      "Développé ou pompes - 4 séries x 8-10 reps",
      "Squat ou presse - 4 séries x 8-10 reps",
      "Rowing - 4 séries x 10 reps",
      "Fentes - 3 séries x 12 reps",
      "Curl + extension triceps - 3 séries x 12 reps",
    ];
    nutrition =
      "Mangez en léger surplus calorique, augmentez les protéines, ajoutez des glucides autour de l'entraînement et dormez suffisamment.";
  }

  if (userData.goal === "maintain fitness") {
    title = "Programme équilibre forme et énergie";
    description =
      `Objectif maintien : ${workoutDays} séances/semaine pour garder force, mobilité et endurance. ${healthNote}`;
    exercises = [
      "Échauffement mobilité - 8 minutes",
      "Circuit full body - 3 tours",
      "Pompes ou développé - 3 séries x 10 reps",
      "Squats - 3 séries x 12 reps",
      "Cardio zone 2 - 20 minutes",
    ];
    nutrition =
      "Gardez une assiette équilibrée, protéines régulières, glucides adaptés à l'activité et hydratation stable sur la journée.";
  }

  if (userData.experience === "beginner") {
    exercises = exercises.map((exercise) => exercise.replace("4 séries", "3 séries"));
    description += " Le volume est volontairement simple pour installer une routine durable.";
  }

  if (userData.experience === "advanced") {
    exercises = [
      ...exercises,
      "Finisher intensif - 6 à 8 minutes",
      "Travail technique ou mobilité ciblée - 10 minutes",
    ];
    description += " Intensité augmentée avec finisher et progression hebdomadaire.";
  }

  if (userData.activityLevel === "sedentary") {
    nutrition += " Ajoutez aussi 20 à 30 minutes de marche quotidienne pour relancer l'activité.";
  }

  if (userData.activityLevel === "very active") {
    nutrition += " Surveillez la récupération et ajoutez une collation protéinée si les séances sont fréquentes.";
  }

  if (userData.dietType === "vegetarian") {
    nutrition += " Sources végétariennes utiles : œufs, yaourt grec, légumineuses, tofu, tempeh et quinoa.";
  }

  if (userData.dietType === "high protein") {
    nutrition += " Répartissez les protéines sur 3 à 4 repas pour soutenir la récupération.";
  }

  return {
    title,
    description,
    exercises,
    nutrition,
  };
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [result, setResult] = useState(() => {
    try {
      const saved = localStorage.getItem("onboarding_program");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      return parsed?.program ? parsed.program : parsed;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (localStorage.getItem("onboarding")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const completion = useMemo(() => {
    const requiredFields = [
      "age",
      "weight",
      "height",
      "goal",
      "experience",
      "activityLevel",
      "dietType",
      "workoutDays",
      "preferredTraining",
    ];
    const filled = requiredFields.filter((field) => Boolean(formData[field])).length;
    return Math.round((filled / requiredFields.length) * 100);
  }, [formData]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const generatedProgram = generateProgram(formData);
    setResult(generatedProgram);

    localStorage.setItem("onboarding", "true");
    localStorage.setItem("onboarding_program", JSON.stringify(generatedProgram));
    localStorage.setItem("onboarding_data", JSON.stringify(formData));

    toast.success("Programme personnalisé généré");
    navigate("/dashboard");
  };

  return (
    <main className="onboarding-page">
      <style>
        {`
          .onboarding-page {
            min-height: 100vh;
            padding: 42px 24px 56px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 52%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .onboarding-container {
            width: min(1160px, 100%);
            margin: 0 auto;
          }

          .onboarding-header {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 240px;
            gap: 24px;
            align-items: end;
            margin-bottom: 28px;
          }

          .onboarding-kicker {
            margin: 0 0 10px;
            color: #0f766e;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .onboarding-title {
            margin: 0;
            color: #0f172a;
            font-size: clamp(34px, 6vw, 56px);
            line-height: 1;
          }

          .onboarding-text {
            max-width: 720px;
            margin: 14px 0 0;
            color: #52645f;
            font-size: 16px;
            line-height: 1.7;
          }

          .progress-card,
          .form-panel,
          .result-card {
            border: 1px solid rgba(15, 118, 110, 0.12);
            background: rgba(255, 255, 255, 0.94);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .progress-card {
            padding: 20px;
            border-radius: 20px;
          }

          .progress-card strong {
            display: block;
            margin-bottom: 10px;
            color: #0f766e;
            font-size: 34px;
          }

          .progress-track {
            height: 10px;
            overflow: hidden;
            border-radius: 999px;
            background: #d1fae5;
          }

          .progress-fill {
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, #0f766e, #22c55e);
          }

          .onboarding-layout {
            display: grid;
            grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
            gap: 24px;
            align-items: start;
          }

          .form-panel,
          .result-card {
            padding: 24px;
            border-radius: 22px;
          }

          .onboarding-form {
            display: grid;
            gap: 22px;
          }

          .form-section {
            display: grid;
            gap: 14px;
          }

          .form-section h2 {
            margin: 0;
            color: #0f172a;
            font-size: 22px;
          }

          .field-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .field {
            display: grid;
            gap: 8px;
          }

          .field label {
            color: #0f172a;
            font-size: 14px;
            font-weight: 850;
          }

          .field input,
          .field select,
          .field textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #d1fae5;
            border-radius: 14px;
            background: #f8fafc;
            color: #0f172a;
            font: inherit;
            outline: none;
          }

          .field input,
          .field select {
            min-height: 46px;
            padding: 0 13px;
          }

          .field textarea {
            min-height: 92px;
            padding: 13px;
            resize: vertical;
          }

          .submit-button {
            min-height: 50px;
            border: 0;
            border-radius: 15px;
            background: #0f766e;
            color: white;
            box-shadow: 0 16px 32px rgba(15, 118, 110, 0.24);
            cursor: pointer;
            font-size: 15px;
            font-weight: 900;
            transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
          }

          .submit-button:hover {
            transform: translateY(-2px);
            background: #115e59;
            box-shadow: 0 20px 38px rgba(15, 118, 110, 0.28);
          }

          .result-card {
            position: sticky;
            top: 104px;
          }

          .result-card h2,
          .result-card h3 {
            margin: 0;
            color: #0f172a;
          }

          .result-card h2 {
            font-size: 24px;
          }

          .result-card h3 {
            margin-top: 14px;
            color: #0f766e;
            font-size: 22px;
          }

          .result-card p {
            color: #52645f;
            line-height: 1.7;
          }

          .result-meta {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin: 16px 0;
          }

          .result-meta span,
          .exercise-list li {
            border-radius: 999px;
            background: #dcfce7;
            color: #166534;
            font-size: 13px;
            font-weight: 850;
          }

          .result-meta span {
            padding: 8px 11px;
          }

          .exercise-list {
            display: grid;
            gap: 10px;
            margin: 16px 0;
            padding: 0;
            list-style: none;
          }

          .exercise-list li {
            padding: 11px 13px;
            border-radius: 14px;
          }

          .nutrition-box,
          .empty-result {
            padding: 16px;
            border-radius: 16px;
            background: #f8fafc;
            border: 1px dashed rgba(15, 118, 110, 0.28);
            color: #52645f;
            line-height: 1.7;
          }

          @media (max-width: 920px) {
            .onboarding-header,
            .onboarding-layout {
              grid-template-columns: 1fr;
            }

            .result-card {
              position: static;
            }
          }

          @media (max-width: 640px) {
            .onboarding-page {
              padding: 28px 16px 42px;
            }

            .field-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="onboarding-container">
        <header className="onboarding-header">
          <div>
            <p className="onboarding-kicker">Onboarding intelligent</p>
            <h1 className="onboarding-title">Créer votre profil fitness</h1>
            <p className="onboarding-text">
              Répondez à quelques questions et obtenez une recommandation de
              programme adaptée à votre objectif, votre niveau et vos contraintes.
            </p>
          </div>

          <div className="progress-card">
            <strong>{completion}%</strong>
            <div className="progress-track" aria-label="Progression du formulaire">
              <div className="progress-fill" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </header>

        <div className="onboarding-layout">
          <section className="form-panel">
            <form className="onboarding-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h2>Informations personnelles</h2>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="age">Âge</label>
                    <input
                      id="age"
                      type="number"
                      min="12"
                      value={formData.age}
                      onChange={(event) => updateField("age", event.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="gender">Genre</label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(event) => updateField("gender", event.target.value)}
                    >
                      <option value="male">Homme</option>
                      <option value="female">Femme</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="weight">Poids (kg)</label>
                    <input
                      id="weight"
                      type="number"
                      min="30"
                      value={formData.weight}
                      onChange={(event) => updateField("weight", event.target.value)}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="height">Taille (cm)</label>
                    <input
                      id="height"
                      type="number"
                      min="120"
                      value={formData.height}
                      onChange={(event) => updateField("height", event.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h2>Objectif & niveau</h2>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="goal">Objectif</label>
                    <select
                      id="goal"
                      value={formData.goal}
                      onChange={(event) => updateField("goal", event.target.value)}
                    >
                      <option value="lose weight">Perdre du poids</option>
                      <option value="gain muscle">Prendre du muscle</option>
                      <option value="maintain fitness">Maintenir la forme</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="experience">Niveau</label>
                    <select
                      id="experience"
                      value={formData.experience}
                      onChange={(event) =>
                        updateField("experience", event.target.value)
                      }
                    >
                      <option value="beginner">Débutant</option>
                      <option value="intermediate">Intermédiaire</option>
                      <option value="advanced">Avancé</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="activityLevel">Activité</label>
                    <select
                      id="activityLevel"
                      value={formData.activityLevel}
                      onChange={(event) =>
                        updateField("activityLevel", event.target.value)
                      }
                    >
                      <option value="sedentary">Sédentaire</option>
                      <option value="active">Actif</option>
                      <option value="very active">Très actif</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="dietType">Nutrition</label>
                    <select
                      id="dietType"
                      value={formData.dietType}
                      onChange={(event) => updateField("dietType", event.target.value)}
                    >
                      <option value="normal">Normal</option>
                      <option value="vegetarian">Végétarien</option>
                      <option value="high protein">High protein</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h2>Santé & préférences</h2>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="workoutDays">Jours/semaine</label>
                    <input
                      id="workoutDays"
                      type="number"
                      min="1"
                      max="7"
                      value={formData.workoutDays}
                      onChange={(event) =>
                        updateField("workoutDays", event.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="preferredTraining">Lieu préféré</label>
                    <select
                      id="preferredTraining"
                      value={formData.preferredTraining}
                      onChange={(event) =>
                        updateField("preferredTraining", event.target.value)
                      }
                    >
                      <option value="home">Maison</option>
                      <option value="gym">Salle de sport</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="injuries">Blessures</label>
                    <textarea
                      id="injuries"
                      value={formData.injuries}
                      onChange={(event) => updateField("injuries", event.target.value)}
                      placeholder="Ex: douleur genou, dos, épaule..."
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="medicalConditions">Conditions médicales</label>
                    <textarea
                      id="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={(event) =>
                        updateField("medicalConditions", event.target.value)
                      }
                      placeholder="Ex: asthme, hypertension..."
                    />
                  </div>
                </div>
              </div>

              <button className="submit-button" type="submit">
                Générer mon programme
              </button>
            </form>
          </section>

          <aside className="result-card">
            <h2>Résultat personnalisé</h2>
            {result ? (
              <>
                <h3>{result.title}</h3>
                <div className="result-meta">
                  <span>{goalLabels[formData.goal]}</span>
                  <span>{experienceLabels[formData.experience]}</span>
                  <span>{formData.workoutDays} jours/semaine</span>
                </div>
                <p>{result.description}</p>
                <ul className="exercise-list">
                  {result.exercises.map((exercise) => (
                    <li key={exercise}>{exercise}</li>
                  ))}
                </ul>
                <div className="nutrition-box">
                  <strong>Conseil nutrition : </strong>
                  {result.nutrition}
                </div>
              </>
            ) : (
              <div className="empty-result">
                Remplissez le formulaire et cliquez sur “Générer mon programme”
                pour obtenir une recommandation intelligente.
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
