import axios from "axios";
import { PortModel } from "../../types/request";
import { ListFilter } from "../../types/table";

export const getPortList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/ports-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getPortById = async (portId: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-port/${portId}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addPort = async (port: PortModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-port`;
  const token = localStorage.getItem("jwtToken");

  const portData = {
    name: port.name,
    code: port.code,
    type: port.type,
  };

  return await axios.post(url, portData, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updatePort = async (port: PortModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-port`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, port, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
