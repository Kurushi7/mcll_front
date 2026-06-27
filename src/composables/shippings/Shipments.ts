import { ListFilter } from "../../types/table";
import axios from "axios";
import { ShipmentModel } from "../../types/request";
import { UpdateShipmentModel } from "../../types/updateRequest";

export const getShipmentList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/shipment-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getShipment = async (shipment_id: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-shipment/${shipment_id}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addShipment = async (shipment: ShipmentModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-shipment`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipment, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateShipment = async (shipment: UpdateShipmentModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-shipment`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipment, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
