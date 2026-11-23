import { useContext } from "react";
import { getSong } from "../services/song.api";
import { SongContext } from "../song.context";

const useSong = () => {
  const { loading, setLoading, song, setSong } = useContext(SongContext);

  const handleGetSong = async ({ mood }) => {
    setLoading(true);
    try {
      const response = await getSong({ mood });
      if (response?.song) setSong(response.song);
      return response;
    } finally {
      setLoading(false);
    }
  };

  return { loading, song, handleGetSong };
};

export default useSong;
