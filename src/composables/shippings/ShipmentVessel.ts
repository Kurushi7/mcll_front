import { ListFilter } from "../../types/table";
import axios from "axios";
import { ShipmentVesselsModel } from "../../types/request";

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

export const getShipmentVessel = async (shipment_vessel_id: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-shipment-vessel/${shipment_vessel_id}`;
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

export const addShipmentVessels = async (
  shipmentVessels: ShipmentVesselsModel,
) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-shipment-vessel`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipmentVessels, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateShipmentVessels = async (
  shipmentVessels: ShipmentVesselsModel,
) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-shipment-vessel`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, shipmentVessels, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
