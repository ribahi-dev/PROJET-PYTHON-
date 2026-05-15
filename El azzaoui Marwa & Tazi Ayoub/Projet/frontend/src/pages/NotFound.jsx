import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="notfound-page">
      <style>
        {`
          .notfound-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            text-align: center;
          }

          .notfound-container {
            max-width: 500px;
          }

          .notfound-code {
            margin: 0;
            font-size: clamp(72px, 15vw, 120px);
            font-weight: 900;
            color: #0f766e;
            line-height: 1;
          }

          .notfound-title {
            margin: 16px 0 0;
            font-size: clamp(24px, 5vw, 36px);
            line-height: 1.2;
          }

          .notfound-text {
            margin: 20px 0 32px;
            color: #52645f;
            font-size: 16px;
            line-height: 1.7;
          }

          .notfound-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 48px;
            padding: 0 24px;
            border-radius: 14px;
            background: #0f766e;
            color: white;
            font-size: 16px;
            font-weight: 900;
            text-decoration: none;
            transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
          }

          .notfound-button:hover {
            transform: translateY(-2px);
            background: #115e59;
            box-shadow: 0 14px 28px rgba(15, 118, 110, 0.22);
          }
        `}
      </style>

      <div className="notfound-container">
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">Page non trouvée</h2>
        <p className="notfound-text">
          La page que vous recherchez n'existe pas ou a été déplacée.
          Retournez à l'accueil pour continuer votre expérience fitness.
        </p>
        <Link to="/" className="notfound-button">
          Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}