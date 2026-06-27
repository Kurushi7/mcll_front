import { ListFilter } from "../../types/table";
import axios from "axios";
import { ShipmentLimitModel } from "../../types/request";

export const getShipmentLimitList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/shipment-limit-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getShipmentLimit = async (shipment_limit_id: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-shipment-limit/${shipment_limit_id}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addShipmentLimit = async (shipmentLimit: ShipmentLimitModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-shipment-limit`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipmentLimit, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateShipmentLimit = async (shipmentZone: ShipmentLimitModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-shipment-limit`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipmentZone, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
