import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import FaceExpression from "../../Expression/components/FaceExpression";
import Player from "../components/Player";
import { SongContext } from "../song.context";
import { useAuth } from "../../auth/hook/useAuth";
import { getMoodTheme } from "../moodTheme";
import { LogOutIcon } from "../../shared/components/Icons";
import "../styles/home.scss";

const Home = () => {
  const { user, loading: signingOut, handleLogOut } = useAuth();
  const { mood } = useContext(SongContext);
  const navigate = useNavigate();
  const theme = getMoodTheme(mood);

  const displayName = user?.username || user?.email || "Listener";
  const initial = displayName.trim().charAt(0).toUpperCase() || "L";

  const handleSignOut = async () => {
    await handleLogOut();
    navigate("/login", { replace: true });
  };

  return (
    <div
      className="home-page"
      data-mood={mood}
      style={{ "--mood-a": theme.color, "--mood-b": theme.secondary }}
    >
      <header className="room-header">
        <div className="room-brand">
          <span className="room-brand__ring" aria-hidden="true" />
          <span className="room-brand__name">Moodify</span>
          <span className="room-brand__tag">Listening room</span>
        </div>

        <div className="room-session">
          <span className="room-session__avatar" aria-hidden="true">
            {initial}
          </span>
          <span className="room-session__who">
            <span>Listening as</span>
            <strong title={user?.email || displayName}>{displayName}</strong>
          </span>
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

      <main className="room">
        <Player />
        <FaceExpression />
      </main>
    </div>
  );
};

export default Home;
