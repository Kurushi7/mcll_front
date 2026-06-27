import { ShipmentModel } from "../../types/request";
import axios from "axios";
import { ShipmentFormModel } from "../../types/ShipmentTypes";

export const updateShipment = async (shipment: ShipmentFormModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-shipment`;
  const token = localStorage.getItem("jwtToken");

  const shipmentData: ShipmentModel = {
    shipment_id: shipment.shipment_id,
    port_of_loading_id: shipment.port_of_loading
      ? (shipment.port_of_loading.port_id ?? 0)
      : 0,
    consignee_id: shipment.consignee ? (shipment.consignee.person_id ?? 0) : 0,
    notify_party_id1: shipment.notify_party1
      ? (shipment.notify_party1.person_id ?? 0)
      : 0,
    notify_party_id2: shipment.notify_party2
      ? (shipment.notify_party2.person_id ?? 0)
      : 0,
    port_of_unloading_id: shipment.port_of_unloading
      ? (shipment.port_of_unloading.port_id ?? 0)
      : 0,
    liner_id: shipment.liner_id,
    master_bl_ref: shipment.master_bl_ref,
    eta: new Date(shipment.eta).toISOString(),
    etd: new Date(shipment.etd).toISOString(),
    file_ref: shipment.file_ref,
    user_id: shipment.user_id,
    group: shipment.group,
  };

  return await axios.post(url, shipmentData, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
