import { useContext } from "react";
import FaceExpression from "../../Expression/components/FaceExpression";
import Player from "../components/Player";
import ManualMoodPicker from "../components/ManualMoodPicker";
import LibraryPanel from "../components/LibraryPanel";
import JournalPanel from "../components/JournalPanel";
import RoomHeader from "../../shared/components/RoomHeader";
import SiteFooter from "../../shared/components/SiteFooter";
import { SongContext } from "../song.context";
import { getMoodTheme } from "../moodTheme";
import "../styles/home.scss";
import "../styles/panels.scss";

const Home = () => {
  const { mood } = useContext(SongContext);
  const theme = getMoodTheme(mood);

  return (
    <div
      className="home-page"
      data-mood={mood}
      style={{ "--mood-a": theme.color, "--mood-b": theme.secondary }}
    >
      <div className="room-ambient" aria-hidden="true">
        <span className="room-ambient__glow room-ambient__glow--primary" />
        <span className="room-ambient__glow room-ambient__glow--secondary" />
        <span className="room-ambient__veil" />
      </div>

      <RoomHeader active="room" />

      <main className="room-main">
        <Player />
        <ManualMoodPicker />

        <div className="room-tools">
          <FaceExpression />
        </div>

        <div className="room-floor">
          <LibraryPanel />
          <JournalPanel />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Home;
