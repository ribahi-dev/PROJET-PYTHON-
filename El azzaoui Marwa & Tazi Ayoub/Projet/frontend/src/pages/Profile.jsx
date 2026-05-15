import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL, authFetchJson, getProfile, updateProfile } from "../services/api";

const goalOptions = [
  { value: "weight_loss", label: "Perte de poids" },
  { value: "muscle_gain", label: "Prise de masse" },
  { value: "maintenance", label: "Maintien" },
  { value: "general_fitness", label: "Fitness général" },
];

const toInputValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

export default function Profile() {
  const [profile, setProfile] = useState({
    id: null,
    username: "",
    email: "",
    role: "client",
    weight: "",
    height: "",
    goal: "",
  });
  const [coachInfo, setCoachInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isCoach = profile.role === "coach";

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        const nextProfile = {
          id: data.id || null,
          username: data.username || "",
          email: data.email || "",
          role: data.role || localStorage.getItem("user_role") || "client",
          weight: toInputValue(data.weight),
          height: toInputValue(data.height),
          goal: data.goal || "",
        };

        setProfile(nextProfile);

        if (nextProfile.role === "coach") {
          try {
            const coaches = await authFetchJson(`${API_BASE_URL}/coaches/`);
            const currentCoach = Array.isArray(coaches)
              ? coaches.find((coach) => String(coach.user) === String(nextProfile.id))
              : null;
            setCoachInfo(currentCoach || null);
          } catch {
            setCoachInfo(null);
          }
        }
      } catch {
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (field, value) => {
    if (isCoach) {
      setCoachInfo((prev) => ({ ...prev, [field]: value }));
    } else {
      setProfile((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSaveClient = async () => {
    const weight = profile.weight === "" ? null : Number(profile.weight);
    const height = profile.height === "" ? null : Number(profile.height);

    if (profile.weight !== "" && (!Number.isFinite(weight) || weight <= 0)) {
      toast.error("Le poids doit être un nombre valide.");
      return;
    }

    if (profile.height !== "" && (!Number.isFinite(height) || height <= 0)) {
      toast.error("La taille doit être un nombre valide.");
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        weight,
        height,
        goal: profile.goal,
      });
      toast.success("Profil sauvegardé avec succès!");
    } catch {
      toast.error("Erreur lors de la sauvegarde du profil");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCoach = async () => {
    if (!coachInfo || !profile.id) {
      toast.error("Impossible de charger les données du coach");
      return;
    }

    if (!coachInfo.specialty?.trim()) {
      toast.error("La spécialité est requise");
      return;
    }

    const experience = Number(coachInfo.experience);
    const price = Number(coachInfo.price);

    if (!Number.isFinite(experience) || experience < 0) {
      toast.error("L'expérience doit être un nombre valide (0 ou plus)");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Le prix doit être un nombre valide (0 ou plus)");
      return;
    }

    try {
      setSaving(true);
      const response = await authFetchJson(`${API_BASE_URL}/coaches/${coachInfo.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          specialty: coachInfo.specialty.trim(),
          experience,
          description: coachInfo.description?.trim() || "",
          price,
        }),
      });

      if (response) {
        setCoachInfo(response);
        toast.success("Profil coach sauvegardé avec succès!");
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde du profil coach");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="profile-page">
      <style>
        {`
          .profile-page {
            min-height: 100vh;
            padding: 42px 24px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .profile-container {
            width: min(600px, 100%);
            margin: 0 auto;
          }

          .profile-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .profile-kicker {
            margin: 0 0 10px;
            color: #0f766e;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .profile-title {
            margin: 0;
            font-size: clamp(34px, 6vw, 54px);
            line-height: 1;
          }

          .profile-card {
            padding: 32px;
            border-radius: 22px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .profile-field {
            margin-bottom: 24px;
          }

          .profile-field:last-of-type {
            margin-bottom: 32px;
          }

          .profile-label {
            display: block;
            margin-bottom: 8px;
            color: #0f172a;
            font-size: 16px;
            font-weight: 700;
          }

          .profile-input,
          .profile-textarea,
          .profile-static {
            width: 100%;
            box-sizing: border-box;
            padding: 12px 16px;
            border: 1px solid rgba(15, 118, 110, 0.2);
            border-radius: 12px;
            background: #f8fafc;
            color: #0f172a;
            font-size: 16px;
            font-family: inherit;
          }

          .profile-textarea {
            min-height: 100px;
            resize: vertical;
          }

          .profile-static {
            min-height: 48px;
            display: flex;
            align-items: center;
            background: #f0fdfa;
            border-color: rgba(15, 118, 110, 0.1);
          }

          .profile-input:focus,
          .profile-textarea:focus {
            outline: none;
            border-color: #0f766e;
            box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
          }

          .profile-button {
            width: 100%;
            padding: 14px 24px;
            border: 0;
            border-radius: 14px;
            background: #0f766e;
            color: white;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
            transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
          }

          .profile-button:hover:not(:disabled) {
            transform: translateY(-2px);
            background: #115e59;
            box-shadow: 0 14px 28px rgba(15, 118, 110, 0.22);
          }

          .profile-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .loading {
            text-align: center;
            padding: 40px;
            color: #64748b;
          }
        `}
      </style>

      <div className="profile-container">
        <header className="profile-header">
          <p className="profile-kicker">Mon profil</p>
          <h1 className="profile-title">
            {isCoach ? "Profil coach" : "Informations personnelles"}
          </h1>
        </header>

        {loading ? (
          <div className="loading">Chargement du profil...</div>
        ) : (
          <div className="profile-card">
            <div className="profile-field">
              <label className="profile-label">Nom d'utilisateur</label>
              <div className="profile-static">{profile.username || "Non disponible"}</div>
            </div>

            <div className="profile-field">
              <label className="profile-label">Email</label>
              <div className="profile-static">{profile.email || "Non disponible"}</div>
            </div>

            {isCoach ? (
              <>
                <div className="profile-field">
                  <label className="profile-label" htmlFor="specialty">
                    Spécialité *
                  </label>
                  <input
                    id="specialty"
                    type="text"
                    className="profile-input"
                    value={coachInfo?.specialty || ""}
                    onChange={(e) => handleChange("specialty", e.target.value)}
                    placeholder="Ex: Musculation, Perte de poids, etc."
                  />
                </div>

                <div className="profile-field">
                  <label className="profile-label" htmlFor="experience">
                    Expérience (années)
                  </label>
                  <input
                    id="experience"
                    type="number"
                    min="0"
                    step="1"
                    className="profile-input"
                    value={coachInfo?.experience ?? ""}
                    onChange={(e) => handleChange("experience", e.target.value)}
                    placeholder="Ex: 5"
                  />
                </div>

                <div className="profile-field">
                  <label className="profile-label" htmlFor="price">
                    Tarif (MAD)
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="profile-input"
                    value={coachInfo?.price ?? ""}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="Ex: 250"
                  />
                </div>

                <div className="profile-field">
                  <label className="profile-label" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className="profile-textarea"
                    value={coachInfo?.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Décrivez votre approche et vos services..."
                  />
                </div>

                <button
                  type="button"
                  className="profile-button"
                  onClick={handleSaveCoach}
                  disabled={saving}
                >
                  {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
                </button>
              </>
            ) : (
              <>
                <div className="profile-field">
                  <label className="profile-label" htmlFor="weight">
                    Poids (kg)
                  </label>
                  <input
                    id="weight"
                    type="number"
                    min="1"
                    step="0.1"
                    className="profile-input"
                    value={profile.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                  />
                </div>

                <div className="profile-field">
                  <label className="profile-label" htmlFor="height">
                    Taille (cm)
                  </label>
                  <input
                    id="height"
                    type="number"
                    min="1"
                    step="1"
                    className="profile-input"
                    value={profile.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                  />
                </div>

                <div className="profile-field">
                  <label className="profile-label" htmlFor="goal">
                    Objectif
                  </label>
                  <select
                    id="goal"
                    className="profile-input"
                    value={profile.goal}
                    onChange={(e) => handleChange("goal", e.target.value)}
                  >
                    <option value="">Sélectionnez votre objectif</option>
                    {goalOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="profile-button"
                  onClick={handleSaveClient}
                  disabled={saving}
                >
                  {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
