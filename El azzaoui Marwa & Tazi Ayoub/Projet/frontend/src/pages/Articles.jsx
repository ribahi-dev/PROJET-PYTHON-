const articles = [
  {
    id: 1,
    title: "Nutrition pour prise de masse",
    description:
      "Un guide réel sur le bulking, le surplus calorique et les aliments à privilégier pour construire du muscle.",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
    source: "Healthline",
    url: "https://www.healthline.com/nutrition/bulking",
  },
  {
    id: 2,
    title: "Top 5 exercices pour débutants",
    description:
      "Un entraînement débutant publié par ACE Fitness avec des mouvements de base pour progresser en sécurité.",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
    source: "ACE Fitness",
    url: "https://www.acefitness.org/resources/everyone/blog/3714/beginner-strength-training-workout/",
  },
  {
    id: 3,
    title: "Comment perdre du poids efficacement",
    description:
      "Les recommandations Mayo Clinic pour combiner alimentation, activité physique et habitudes durables.",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
    source: "Mayo Clinic",
    url: "https://www.mayoclinic.org/healthy-lifestyle/weight-loss/basics/diet-and-exercise/hlv-20049483",
  },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80";

export default function Articles() {
  return (
    <main className="articles-page">
      <style>
        {`
          .articles-page {
            min-height: 100vh;
            padding: 42px 24px 56px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 52%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .articles-container {
            width: min(1160px, 100%);
            margin: 0 auto;
          }

          .articles-header {
            max-width: 720px;
            margin-bottom: 28px;
          }

          .articles-kicker {
            margin: 0 0 10px;
            color: #0f766e;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .articles-title {
            margin: 0;
            color: #0f172a;
            font-size: clamp(34px, 6vw, 54px);
            line-height: 1;
          }

          .articles-text {
            margin: 14px 0 0;
            color: #52645f;
            font-size: 16px;
            line-height: 1.7;
          }

          .articles-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
          }

          .article-card {
            overflow: hidden;
            border-radius: 22px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
          }

          .article-card:hover {
            transform: translateY(-6px);
            border-color: rgba(20, 184, 166, 0.34);
            box-shadow: 0 26px 62px rgba(15, 23, 42, 0.14);
          }

          .article-image-box {
            aspect-ratio: 16 / 10;
            overflow: hidden;
            background: #dcfce7;
          }

          .article-image {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            transition: transform 220ms ease;
          }

          .article-card:hover .article-image {
            transform: scale(1.04);
          }

          .article-content {
            padding: 22px;
          }

          .article-content h2 {
            margin: 0 0 10px;
            color: #0f172a;
            font-size: 22px;
            line-height: 1.25;
          }

          .article-content p {
            min-height: 78px;
            margin: 0 0 20px;
            color: #52645f;
            line-height: 1.6;
          }

          .article-source {
            display: inline-flex;
            width: fit-content;
            margin-bottom: 14px;
            padding: 7px 10px;
            border-radius: 999px;
            background: #dcfce7;
            color: #166534;
            font-size: 13px;
            font-weight: 900;
          }

          .article-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 44px;
            padding: 0 16px;
            border-radius: 14px;
            background: #0f766e;
            color: white;
            font-weight: 900;
            text-decoration: none;
            box-shadow: 0 14px 28px rgba(15, 118, 110, 0.22);
            transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
          }

          .article-button:hover {
            transform: translateY(-2px);
            background: #115e59;
            box-shadow: 0 18px 34px rgba(15, 118, 110, 0.28);
          }
        `}
      </style>

      <div className="articles-container">
        <header className="articles-header">
          <p className="articles-kicker">Conseils fitness</p>
          <h1 className="articles-title">Articles & nutrition</h1>
          <p className="articles-text">
            Des guides courts et pratiques pour mieux t'entraîner, mieux manger
            et garder une progression régulière.
          </p>
        </header>

        <section className="articles-grid">
          {articles.map((article) => (
            <article className="article-card" key={article.id}>
              <div className="article-image-box">
                <img
                  className="article-image"
                  src={article.image}
                  alt={article.title}
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </div>

              <div className="article-content">
                <span className="article-source">{article.source}</span>
                <h2>{article.title}</h2>
                <p>{article.description}</p>
                <a
                  className="article-button"
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Lire l'article
                </a>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
