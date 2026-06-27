import { ListFilter } from "../../types/table";
import axios from "axios";
import { ShipmentHblModel } from "../../types/request";
import { UpdateShipmentModel } from "../../types/updateRequest";

export const getShipmentHbl = async (shipmentHblId: string) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-shipment-hbl/${shipmentHblId}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getShipmentHblList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/shipment-hbl-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addShipmentHbl = async (shipmentHbl: ShipmentHblModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-shipment-hbl`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipmentHbl, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateShipmentHbl = async (shipmentHbl: UpdateShipmentModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-shipment-hbl`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipmentHbl, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const DeleteShipmentHbl = async (shipmentHblId: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/delete-shipment-hbl/${shipmentHblId}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.put(url, "", {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const cloneShipmentHbl = async (shipment_hbl_id: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/clone-shipment-hbl`;
  const token = localStorage.getItem("jwtToken");

  const request: { shipment_hbl_id: number } = {
    shipment_hbl_id: shipment_hbl_id,
  };

  return await axios.post(url, request, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
