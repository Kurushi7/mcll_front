import { ListFilter } from "../../types/table";
import axios from "axios";
import { LinersModel } from "../../types/request";

export const getLiner = async (liner_id: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-liner/${liner_id}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getLinerList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/liner-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addLiner = async (liner: LinersModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-liner`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, liner, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateLiner = async (liner: LinersModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-liner`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, liner, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
