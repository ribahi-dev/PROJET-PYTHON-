import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  createAppointmentSlot,
  getAvailableSlots,
  getMyAppointments,
  bookAppointmentSlot,
  confirmAppointment,
  getUserById,
} from "../services/api";

const getUserIdFromToken = () => {
  const token = localStorage.getItem("access");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch {
    return null;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "#f59e0b";
    case "confirmed":
      return "#10b981";
    case "booked":
      return "#3b82f6";
    case "completed":
      return "#6b7280";
    case "cancelled":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "confirmed":
      return "Confirmé";
    case "booked":
      return "Réservé";
    case "completed":
      return "Terminé";
    case "cancelled":
      return "Annulé";
    default:
      return status || "Non disponible";
  }
};

const formatDate = (value) => {
  if (!value) return "Non disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Non disponible";
  return date.toLocaleDateString("fr-FR");
};

export default function Appointments() {
  const [userRole, setUserRole] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ date: "", time: "", notes: "" });

  useEffect(() => {
    loadPage();
  }, []);

  const fetchUserRole = async () => {
    const userId = getUserIdFromToken();
    if (!userId) return null;

    try {
      const user = await getUserById(userId);
      return user.role;
    } catch (error) {
      console.error("Unable to load user role:", error);
      return null;
    }
  };

  const loadPage = async () => {
    setLoading(true);

    try {
      const role = (await fetchUserRole()) || "client";
      setUserRole(role);

      const appointmentsData = await getMyAppointments();
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);

      if (role === "client") {
        await loadAvailableSlots();
      }
    } catch (error) {
      console.error("Appointments load failed:", error);
      toast.error("Erreur lors du chargement des rendez-vous");
      setAppointments([]);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const slots = await getAvailableSlots();
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch (error) {
      console.error("Available slots load failed:", error);
      toast.error("Impossible de charger les créneaux disponibles");
      setAvailableSlots([]);
    }
  };

  const loadAppointments = async () => {
    try {
      const data = await getMyAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Appointments load failed:", error);
      toast.error("Erreur lors du chargement des rendez-vous");
      setAppointments([]);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time) {
      toast.error("La date et l'heure sont requises.");
      return;
    }

    try {
      await createAppointmentSlot(formData.date, formData.time, formData.notes);
      toast.success("Créneau créé avec succès !");
      setFormData({ date: "", time: "", notes: "" });
      setShowCreateForm(false);
      loadAppointments();
    } catch (error) {
      console.error("Create slot failed:", error);
      toast.error(error.message || "Erreur lors de la création du créneau");
    }
  };

  const handleBookSlot = async (appointmentId) => {
    try {
      await bookAppointmentSlot(appointmentId);
      toast.success("Rendez-vous réservé avec succès !");
      loadAvailableSlots();
      loadAppointments();
    } catch (error) {
      console.error("Book slot failed:", error);
      toast.error(error.message || "Impossible de réserver ce créneau");
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await confirmAppointment(appointmentId);
      toast.success("Rendez-vous confirmé !");
      loadAppointments();
    } catch (error) {
      console.error("Confirm appointment failed:", error);
      toast.error("Erreur lors de la confirmation");
    }
  };

  return (
    <main className="appointments-page">
      <style>
        {`
          .appointments-page {
            min-height: 100vh;
            padding: 42px 24px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .appointments-container {
            width: min(1000px, 100%);
            margin: 0 auto;
          }

          .appointments-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 32px;
          }

          .appointments-title {
            margin: 0;
            font-size: clamp(34px, 6vw, 54px);
            line-height: 1;
          }

          .appointments-description {
            margin: 8px 0 0;
            color: #475569;
            font-size: 16px;
            max-width: 640px;
            line-height: 1.6;
          }

          .create-button {
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

          .create-button:hover {
            transform: translateY(-2px);
            background: #115e59;
            box-shadow: 0 14px 28px rgba(15, 118, 110, 0.22);
          }

          .section {
            margin-bottom: 32px;
          }

          .section-title {
            margin: 0 0 20px;
            font-size: 26px;
            font-weight: 900;
          }

          .appointments-grid {
            display: grid;
            gap: 24px;
          }

          .appointment-card,
          .slot-card {
            padding: 24px;
            border-radius: 22px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .appointment-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
          }

          .appointment-coach {
            margin: 0 0 4px;
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
          }

          .appointment-status {
            padding: 6px 12px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            color: white;
          }

          .appointment-details,
          .slot-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
          }

          .appointment-detail,
          .slot-detail {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .appointment-label {
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
          }

          .appointment-value,
          .slot-value {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
          }

          .appointment-notes {
            margin: 0 0 20px;
            padding: 16px;
            border-radius: 12px;
            background: #f8fafc;
            color: #374151;
            font-style: italic;
          }

          .appointment-actions,
          .slot-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .action-button,
          .reserve-button {
            padding: 10px 20px;
            border: 0;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
            transition: transform 160ms ease, background 160ms ease;
          }

          .confirm-button {
            background: #10b981;
            color: white;
          }

          .confirm-button:hover,
          .reserve-button:hover {
            transform: translateY(-2px);
          }

          .reserve-button {
            background: #0f766e;
            color: white;
          }

          .reserve-button:hover {
            background: #115e59;
          }

          .create-form {
            margin-bottom: 32px;
            padding: 24px;
            border-radius: 22px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .form-title {
            margin: 0 0 20px;
            font-size: 24px;
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

          .cancel-form-button {
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

          .cancel-form-button:hover {
            background: #f9fafb;
          }

          .empty-state {
            display: grid;
            place-items: center;
            min-height: 240px;
            padding: 32px 24px;
            border: 2px dashed rgba(15, 118, 110, 0.2);
            border-radius: 22px;
            text-align: center;
          }

          .empty-state h2 {
            margin: 0 0 10px;
            color: #0f172a;
            font-size: 25px;
          }

          .empty-state p {
            margin: 0;
            color: #64748b;
            line-height: 1.6;
          }

          .loading {
            text-align: center;
            padding: 40px;
            color: #64748b;
          }

          @media (max-width: 768px) {
            .appointments-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 16px;
            }

            .form-grid {
              grid-template-columns: 1fr;
            }

            .appointment-details,
            .slot-details {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="appointments-container">
        <header className="appointments-header">
          <div>
            <h1 className="appointments-title">
              {userRole === "coach" ? "Mes rendez-vous" : "Réservez un créneau"}
            </h1>
            <p className="appointments-description">
              {userRole === "coach"
                ? "Créez des créneaux disponibles et suivez les réservations de vos clients."
                : "Choisissez un créneau disponible et réservez votre séance avec un coach."}
            </p>
          </div>

          {userRole === "coach" && (
            <button
              className="create-button"
              onClick={() => setShowCreateForm((prev) => !prev)}
            >
              {showCreateForm ? "Annuler" : "Nouveau créneau"}
            </button>
          )}
        </header>

        {userRole === "coach" && showCreateForm && (
          <form className="create-form" onSubmit={handleCreateSlot}>
            <h2 className="form-title">Créer un créneau disponible</h2>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="date">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="time">
                  Heure
                </label>
                <input
                  id="time"
                  type="time"
                  className="form-input"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">
                Notes (optionnel)
              </label>
              <textarea
                id="notes"
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Ajoutez des informations sur votre séance..."
              />
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-form-button" onClick={() => setShowCreateForm(false)}>
                Annuler
              </button>
              <button type="submit" className="submit-button">
                Créer le créneau
              </button>
            </div>
          </form>
        )}

        {userRole === "client" && (
          <section className="section">
            <h2 className="section-title">Créneaux disponibles</h2>

            {loading ? (
              <div className="loading">Chargement des créneaux...</div>
            ) : availableSlots.length === 0 ? (
              <div className="empty-state">
                <div>
                  <h2>Aucun créneau disponible</h2>
                  <p>Patientez pendant que les coachs ajoutent de nouveaux créneaux.</p>
                </div>
              </div>
            ) : (
              <div className="appointments-grid">
                {availableSlots.map((slot) => (
                  <div key={slot.id} className="slot-card">
                    <div className="appointment-header">
                      <div>
                        <h3 className="appointment-coach">
                          {slot.coach_name || "Coach non disponible"}
                        </h3>
                      </div>
                      <span className="appointment-status" style={{ backgroundColor: getStatusColor(slot.status) }}>
                        {getStatusText(slot.status)}
                      </span>
                    </div>

                    <div className="slot-details">
                      <div className="slot-detail">
                        <span className="appointment-label">Date</span>
                        <span className="slot-value">
                          {formatDate(slot.date)}
                        </span>
                      </div>

                      <div className="slot-detail">
                        <span className="appointment-label">Heure</span>
                        <span className="slot-value">{slot.time || "Non disponible"}</span>
                      </div>
                    </div>

                    {slot.notes && <p className="appointment-notes">"{slot.notes}"</p>}

                    <div className="slot-actions">
                      <button className="reserve-button" onClick={() => handleBookSlot(slot.id)}>
                        Réserver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="section">
          <h2 className="section-title">{userRole === "coach" ? "Vos rendez-vous" : "Mes rendez-vous"}</h2>

          {loading ? (
            <div className="loading">Chargement des rendez-vous...</div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <div>
                <h2>Aucun rendez-vous</h2>
                <p>
                  {userRole === "coach"
                    ? "Vos rendez-vous apparaîtront ici lorsque des clients réserveront un créneau."
                    : "Réservez un créneau pour voir votre rendez-vous ici."}
                </p>
              </div>
            </div>
          ) : (
            <div className="appointments-grid">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <div>
                      <h3 className="appointment-coach">
                        {userRole === "coach"
                          ? appointment.client_name || "Client non disponible"
                          : appointment.coach_name || "Coach non disponible"}
                      </h3>
                    </div>
                    <span className="appointment-status" style={{ backgroundColor: getStatusColor(appointment.status) }}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>

                  <div className="appointment-details">
                    <div className="appointment-detail">
                      <span className="appointment-label">Date</span>
                      <span className="appointment-value">
                        {formatDate(appointment.date)}
                      </span>
                    </div>

                    <div className="appointment-detail">
                      <span className="appointment-label">Heure</span>
                      <span className="appointment-value">
                        {appointment.time || "Non disponible"}
                      </span>
                    </div>

                    {appointment.video_link && (
                      <div className="appointment-detail">
                        <span className="appointment-label">Lien vidéo</span>
                        <a
                          href={appointment.video_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="appointment-value"
                          style={{ color: "#0f766e", textDecoration: "underline" }}
                        >
                          Rejoindre la réunion
                        </a>
                      </div>
                    )}
                  </div>

                  {appointment.notes && <p className="appointment-notes">"{appointment.notes}"</p>}

                  <div className="appointment-actions">
                    {userRole === "coach" && appointment.status === "pending" && (
                      <button className="action-button confirm-button" onClick={() => handleConfirmAppointment(appointment.id)}>
                        Confirmer
                      </button>
                    )}

                    {appointment.status === "confirmed" && appointment.video_link && (
                      <a
                        href={appointment.video_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-button confirm-button"
                      >
                        Rejoindre
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
