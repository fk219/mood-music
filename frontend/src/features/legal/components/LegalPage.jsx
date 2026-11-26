import { useEffect } from "react";
import { Link } from "react-router-dom";
import SiteFooter from "../../shared/components/SiteFooter";
import "../styles/legal.scss";

const LegalPage = ({ title, intro, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link to="/" className="legal-brand" aria-label="MoodMusic listening room">
          <span className="legal-brand__ring" aria-hidden="true" />
          <span className="legal-brand__name">MoodMusic</span>
          <span className="legal-brand__tag">Listening room</span>
        </Link>

        <Link to="/" className="legal-header__back">
          Back to the room
        </Link>
      </header>

      <main className="legal-shell">
        <article className="legal-doc">
          <p className="eyebrow">Legal</p>
          <h1>{title}</h1>
          <p className="legal-doc__meta">Last updated 23 November 2026</p>
          <p className="legal-doc__intro">{intro}</p>

          <div className="legal-doc__body">{children}</div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
};

export default LegalPage;
