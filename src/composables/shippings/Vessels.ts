import { ListFilter } from "../../types/table";
import axios from "axios";
import { Vessels } from "../../types/request";

export const getVessel = async (vessel_id: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-vessel/${vessel_id}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getVesselList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/vessel-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addVessel = async (vessel: Vessels) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-vessel`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, vessel, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateVessel = async (vessel: Vessels) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-vessel`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, vessel, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
