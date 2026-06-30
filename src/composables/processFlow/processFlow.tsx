import axios from "axios";
import { ListFilter } from "../../types/table";
import {ShipmentProcess} from "../../types/shipmentProcess.ts";

export const getProcessFlowList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/shipment-process-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchProcessFlowById = async (processFlowId: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-shipment-process/${processFlowId}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addProcessFlow = async (shipmentProcess: ShipmentProcess) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-shipment-process`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipmentProcess, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateShipmentProcess = async (shipment: ShipmentProcess) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-shipment-process`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipment, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

