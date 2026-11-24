import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hook/useAuth";
import { LogOutIcon, SettingsIcon } from "./Icons";
import "../styles/room-header.scss";

const RoomHeader = ({ active = "room" }) => {
  const { user, loading: signingOut, handleLogOut } = useAuth();
  const navigate = useNavigate();

  const displayName =
    user?.displayName || user?.username || user?.email || "Listener";
  const initial = displayName.trim().charAt(0).toUpperCase() || "L";
  const inRoom = active === "room";

  const handleSignOut = async () => {
    await handleLogOut();
    navigate("/login", { replace: true });
  };

  return (
    <header className="room-header">
      <Link to="/" className="room-brand" aria-label="Moodify listening room">
        <span className="room-brand__ring" aria-hidden="true" />
        <span className="room-brand__name">Moodify</span>
        <span className="room-brand__tag">Listening room</span>
      </Link>

      <nav className="room-nav" aria-label="Room navigation">
        {inRoom ? (
          <>
            <a href="#library" className="room-nav__link room-nav__anchor">
              Library
            </a>
            <a href="#journal" className="room-nav__link room-nav__anchor">
              Journal
            </a>
          </>
        ) : (
          <Link to="/" className="room-nav__link">
            Back to room
          </Link>
        )}
        <Link
          to="/studio"
          className={`room-nav__link room-nav__studio${active === "studio" ? " is-active" : ""}`}
          aria-current={active === "studio" ? "page" : undefined}
        >
          Studio
        </Link>
      </nav>

      <div className="room-session">
        <span className="room-session__avatar" aria-hidden="true">
          {initial}
        </span>
        <span className="room-session__who">
          <span>Listening as</span>
          <strong title={user?.email || displayName}>{displayName}</strong>
        </span>
        <Link
          to="/settings"
          className={`room-session__settings${active === "settings" ? " is-active" : ""}`}
          aria-current={active === "settings" ? "page" : undefined}
          aria-label="Account settings"
        >
          <SettingsIcon />
          <span>Settings</span>
        </Link>
        <nav className="room-session__legal" aria-label="Legal">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
        <button
          type="button"
          className="room-session__logout"
          onClick={handleSignOut}
          disabled={signingOut}
          aria-label={signingOut ? "Signing out" : "Sign out"}
        >
          <LogOutIcon />
          <span>{signingOut ? "Signing out…" : "Sign out"}</span>
        </button>
      </div>
    </header>
  );
};

export default RoomHeader;
