import { useContext } from "react";
import { SongContext } from "../song.context";

const useSong = () => {
  const { loading, song, selectMood } = useContext(SongContext);

  const handleGetSong = ({ mood, source = "manual" }) =>
    selectMood(mood, source);

  return { loading, song, handleGetSong };
};

export default useSong;
