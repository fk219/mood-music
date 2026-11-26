import { Link } from "react-router-dom";
import "../styles/site-footer.scss";

const SiteFooter = ({ compact = false, className = "" }) => {
  const classes = [
    "site-footer",
    compact ? "site-footer--compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <footer className={classes}>
      <div className="site-footer__inner">
        <span className="site-footer__brand">
          <span className="site-footer__ring" aria-hidden="true" />
          <span>MoodMusic</span>
          <span className="site-footer__note">Beta listening room</span>
        </span>

        <nav className="site-footer__links" aria-label="Footer legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
};

export default SiteFooter;
