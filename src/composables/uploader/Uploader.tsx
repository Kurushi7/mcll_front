import axios from "axios";

export const getSignedUrl = async (count: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/api/get-signed-url`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(
    url,
    { count: count },
    {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const uploadFile = async (file: File, uploadUrl: string) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/api${uploadUrl}`;
  const token = localStorage.getItem("jwtToken");

  const formData = new FormData();
  formData.append("file", file);

  return await axios.post(url, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getFile = async (path: string) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/api/get-file`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(
    url,
    { path: path },
    {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    },
  );
};
