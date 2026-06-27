import { ListFilter } from "../../types/table";
import axios from "axios";
import {
  ContainerLinesModel,
  UpdateContainerLinesModel,
} from "../../types/request";

export const getShipmentVesselList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/shipment-vessel-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getContainerLine = async (container_line_id: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-container-line/${container_line_id}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getContainerLinesList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/container-lines-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addContainerLine = async (containerLines: ContainerLinesModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-container-line`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, containerLines, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateContainerLine = async (
  containerLines: ContainerLinesModel,
) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-container-line`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, containerLines, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteContainerLine = async (containerLineId: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/delete-container-line/${containerLineId}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.put(url, "", {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
