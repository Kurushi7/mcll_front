import { PortModel } from "./request";

export interface PersonCountry {
  person_id: number;
  first_name: string;
  last_name: string;
  type?: string;
}

export interface ShipmentFormModel {
  shipment_id?: number;
  consignee: PersonCountry | null;
  notify_party1: PersonCountry | null;
  notify_party2: PersonCountry | null;
  liner_id: number;
  master_bl_ref: string;
  eta: string;
  etd: string;
  port_of_loading: PortModel | null;
  port_of_unloading: PortModel | null;
  file_ref: string;
  user_id: number;
  shipper: PersonCountry | null;
  group: string;
  remarks: string;
}

export interface HblFormModel {
  shipment_hbl_id?: number;
  shipment_id: number;
  hbl_no?: string;
  consignee_id: number;
  first_name: string;
  last_name: string;
  consignee: PersonCountry | null;
  shipper: PersonCountry | null;
  transact_note_ref: string;
  transact_amount: number;
  movement_type: string;
  delivery_agent: PersonCountry | null;
  unstuffing_place: string;
  notify_party1: PersonCountry | null;
  notify_party2: PersonCountry | null;
}

export interface ShipmentHblFormModel {
  shipment_hbl_id: number;
  shipment_id: number;
  hbl_no: string;
  consignee_id: number;
  consignee: PersonCountry | null;
  first_name: string;
  last_name: string;
  shipper_id: number;
  shipper: PersonCountry | null;
  delivery_agent: PersonCountry | null;
}
