import axios from "axios";
import { ListFilter } from "../../types/table";
import {ShipmentProcessModel} from "../../types/request.ts";

export const getShipmentProcessList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/shipment-process-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchShipmentProcessById = async (shipmentProcessId: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-shipment-process/${shipmentProcessId}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addShipmentProcess = async (shipmentProcess: ShipmentProcessModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-shipment-process`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipmentProcess, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateShipmentProcess = async (shipmentProcess: ShipmentProcessModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-shipment-process`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipmentProcess, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

