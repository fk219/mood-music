import api from "../../shared/services/api";

export const getSong = async ({ mood }) => {
  const response = await api.get("/api/song", { params: { mood } });
  return response.data;
};

export const getLibrary = async () => {
  const response = await api.get("/api/song/library");
  return response.data;
};

export const uploadSong = async ({ file, mood, onProgress }) => {
  const formData = new FormData();
  formData.append("song", file);
  formData.append("mood", mood);

  const response = await api.post("/api/song", formData, {
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  return response.data;
};
