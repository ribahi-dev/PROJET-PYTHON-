import { Link } from "react-router-dom";
import { BACKEND_BASE_URL } from "../services/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80";

export default function ProgramCard({
  program,
  isPaid = false,
  showPaidBadge = false,
  customPrice,
  variant = "default",
}) {
  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") return FALLBACK_IMAGE;
    if (image.startsWith("http")) return image;
    return `${BACKEND_BASE_URL}${image}`;
  };

  const getPriceLabel = () => {
    if (customPrice) return customPrice;

    const price = Number(program?.price ?? program?.amount);
    if (!Number.isFinite(price) || price <= 0) return "Prix non disponible";
    return `${price.toFixed(2)} DH`;
  };

  const getShortDescription = (description) => {
    if (!description) {
      return "Un programme fitness clair, motivant et facile à suivre.";
    }

    return description.length > 115 ? `${description.slice(0, 115)}...` : description;
  };

  const detailLink = program?.id ? `/program/${program.id}` : "/programmes";

  return (
    <>
      <style>
        {`
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

          .program-topline {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 14px;
            margin-bottom: 10px;
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
        `}
      </style>

      <article className="program-card">
        <div className="program-image-box">
          <img
            className="program-image"
            src={getImageUrl(program?.image)}
            alt={program?.title || "Programme fitness"}
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
          {showPaidBadge && isPaid && <span className="paid-badge">Payé</span>}
        </div>

        <div className="program-content">
          {variant === "dashboard" ? (
            <>
              <div className="program-topline">
                <h3 className="program-title">
                  {program?.title || "Programme fitness"}
                </h3>
                <span className="program-price">{getPriceLabel()}</span>
              </div>
              <p className="program-description">
                {getShortDescription(program?.description)}
              </p>
              <Link className="program-button" to={detailLink}>
                Voir le programme
              </Link>
            </>
          ) : (
            <>
              <h3 className="program-title">{program?.title || "Programme fitness"}</h3>
              <p className="program-description">
                {getShortDescription(program?.description)}
              </p>
              <div className="program-footer">
                <strong className="program-price">{getPriceLabel()}</strong>
                <Link className="program-button" to={detailLink}>
                  Voir
                </Link>
              </div>
            </>
          )}
        </div>
      </article>
    </>
  );
}
