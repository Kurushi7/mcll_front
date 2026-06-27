import { ListFilter } from "../../types/table";
import axios from "axios";
import { ShipmentManifestStagingModel } from "../../types/request";

export const getManifestStagingList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/freight-quote-staging-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getManifestStaging = async (staging_id: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-freight-quote-staging/${staging_id}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addManifestStaging = async (
  shipmentManifestStaging: ShipmentManifestStagingModel,
) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-freight-quote-staging`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipmentManifestStaging, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateManifestStaging = async (
  shipmentManifestStaging: ShipmentManifestStagingModel,
) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-freight-quote-staging`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipmentManifestStaging, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteManifestStaging = async (manifestStagingIds: number[]) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/delete-freight-quote-staging`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, manifestStagingIds, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
