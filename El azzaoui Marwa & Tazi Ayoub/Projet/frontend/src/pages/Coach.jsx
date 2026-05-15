import { useState, useEffect } from "react";
import { useParams}from "react-router-dom";
import { API_BASE_URL } from "../services/api";
import toast from "react-hot-toast";



const COACH_IMAGE =
  "https://mh-sportsante.com/wp-content/uploads/2025/02/therapie-manuelle-methode-poyet-.png";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80";


export default function Coach() {

  const { id } = useParams();
  

  const [coachData, setCoachData] = useState(null);
  const [message, setMessage] = useState("");
  

  const [contactForm, setContactForm] = useState({
    name: "",
    subject: "",
    text: "",
  });

  const [coachPaid, setCoachPaid] = useState(
  localStorage.getItem(`coach_paid_${id}`) === "true"
);
  const [payingCoach, setPayingCoach] = useState(false);
 

  useEffect(() => {
    const loadCoach = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/coaches/`);
        const data = await response.json();

        const selectedCoach = data.find(
          (coach) => String(coach.id) === String(id)
        );

        setCoachData(selectedCoach);
      } catch (error) {
        console.error("Erreur chargement coach", error);
      }
    };

    loadCoach();
  }, [id]);

  const handleContact = (event) => {
    event.preventDefault();

    if (!contactForm.name.trim() || !contactForm.text.trim()) {
      toast.error("Ajoute ton nom et ton message avant l'envoi");
      return;
    }

    setMessage("Votre message a été envoyé au coach.");

    setContactForm({
      name: "",
      subject: "",
      text: "",
    });

    toast.success("Message envoyé au coach");
  };

  const handleCoachPayment = () => {
  if (coachPaid || payingCoach) return;

  setPayingCoach(true);

  window.setTimeout(() => {
    setCoachPaid(true);

    localStorage.setItem(`coach_paid_${id}`, "true");

    setPayingCoach(false);

    setMessage(
      "Paiement confirmé. Votre séance coaching est activée."
    );

    toast.success("Paiement coach confirmé");
  }, 900);
};

  const handleVideoCall = () => {
    setMessage("Lancement de la session avec le coach...");
    window.open("https://meet.google.com/wvx-bnii-fta", "_blank");
  };

  return (
    <main className="coach-page">
      <style>
        {`
          .coach-page {
            min-height: 100vh;
            padding: 42px 24px 56px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, sans-serif;
          }

          .coach-container {
            width: min(1160px, 100%);
            margin: 0 auto;
          }

          .coach-hero {
            display: grid;
            grid-template-columns: 0.95fr 1.05fr;
            overflow: hidden;
            border-radius: 28px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 26px 75px rgba(15, 23, 42, 0.12);
          }

          .coach-image {
            width: 100%;
            height: 100%;
            min-height: 520px;
            object-fit: cover;
          }

          .coach-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 46px;
          }

          .coach-kicker {
            color: #0f766e;
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
          }

          .coach-content h1 {
            margin: 10px 0;
            color: #0f172a;
            font-size: clamp(36px, 6vw, 58px);
          }

          .coach-speciality {
            display: inline-flex;
            width: fit-content;
            margin: 18px 0;
            padding: 9px 13px;
            border-radius: 999px;
            background: #dcfce7;
            color: #166534;
            font-size: 14px;
            font-weight: 900;
          }

          .coach-description {
            margin: 0 0 26px;
            color: #52645f;
            font-size: 17px;
            line-height: 1.75;
          }

          .coach-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .coach-button {
            min-height: 48px;
            padding: 0 18px;
            border: 0;
            border-radius: 15px;
            background: #0f766e;
            color: white;
            cursor: pointer;
            font-size: 15px;
            font-weight: 900;
          }

          .coach-button.secondary {
            background: #ecfdf5;
            color: #0f766e;
          }

          .coach-message {
            margin-top: 22px;
            padding: 14px 16px;
            border-radius: 16px;
            background: #f0fdfa;
            color: #0f766e;
            font-weight: 800;
          }

          .coach-sections {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 22px;
            margin-top: 24px;
          }

          .coach-panel {
            padding: 24px;
            border-radius: 22px;
            background: rgba(255, 255, 255, 0.94);
            border: 1px solid rgba(15, 118, 110, 0.12);
          }

          .coach-form {
            display: grid;
            gap: 12px;
          }

          .coach-input,
          .coach-textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #d1fae5;
            border-radius: 14px;
            background: #f8fafc;
            color: #0f172a;
            font: inherit;
          }

          .coach-input {
            min-height: 46px;
            padding: 0 14px;
          }

          .coach-textarea {
            min-height: 128px;
            padding: 13px 14px;
            resize: vertical;
          }

          .coach-price {
            display: flex;
            align-items: baseline;
            gap: 10px;
            margin: 18px 0;
          }

          .coach-price strong {
            color: #0f766e;
            font-size: 34px;
          }

          @media (max-width: 860px) {
            .coach-hero {
              grid-template-columns: 1fr;
            }

            .coach-sections {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="coach-container">
        <section className="coach-hero">
          <img
            className="coach-image"
            src={COACH_IMAGE}
            alt="Coach sportif"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          <div className="coach-content">
            <p className="coach-kicker">Coach certifié</p>

            <h1>{coachData?.username || "Coach Fitness"}</h1>

            <span className="coach-speciality">
              Spécialisation : {coachData?.specialty || "Fitness"}
            </span>

            <p className="coach-description">
              Accompagnement personnalisé en fitness, nutrition et progression
              sportive.
            </p>

            <div className="coach-actions">
              <button
                type="button"
                className="coach-button secondary"
                onClick={handleVideoCall}
              >
                Démarrer appel vidéo
              </button>
            </div>

            {message && <div className="coach-message">{message}</div>}
          </div>
        </section>

        <section className="coach-sections">
          <div className="coach-panel">
            <h2>Envoyer un message</h2>

            <form className="coach-form" onSubmit={handleContact}>
              <input
                className="coach-input"
                type="text"
                placeholder="Votre nom"
                value={contactForm.name}
                onChange={(event) =>
                  setContactForm({
                    ...contactForm,
                    name: event.target.value,
                  })
                }
              />

              <input
                className="coach-input"
                type="text"
                placeholder="Sujet du message"
                value={contactForm.subject}
                onChange={(event) =>
                  setContactForm({
                    ...contactForm,
                    subject: event.target.value,
                  })
                }
              />

              <textarea
                className="coach-textarea"
                placeholder="Votre message au coach"
                value={contactForm.text}
                onChange={(event) =>
                  setContactForm({
                    ...contactForm,
                    text: event.target.value,
                  })
                }
              />

              <button type="submit" className="coach-button">
                Contacter le coach
              </button>
            </form>
          </div>

          <div className="coach-panel">
            <h2>Paiement coach</h2>

            <p>
              Active une séance premium avec suivi personnalisé et appel vidéo.
            </p>

            <div className="coach-price">
              <strong>
                {coachData?.price} DH
              </strong>

              <span>
                séance coaching personnalisée
              </span>
            </div>

            {coachPaid ? (
              <div className="coach-message">
                Paiement coach confirmé
              </div>
            ) : (
              <button
                type="button"
                className="coach-button"
                onClick={handleCoachPayment}
                disabled={payingCoach}
              >
                {payingCoach
                  ? "Paiement en cours..."
                  : "Payer la séance coach"}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}