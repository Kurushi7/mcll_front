export interface UpdateShipmentModel {
  shipment_id?: number;
  shipment_hbl_id?: number;
  eta?: string;
  movement_type?: string;
  voyage_id?: string;
  first_name?: string;
  last_name?: string;
  hbl_no?: string;
  port_of_loading_id?: number;
  vessel?: string;
  consignee_id?: number;
  delivery_agent_id?: number;
  notify_party_id1?: number;
  notify_party_id2?: number;
  shipper_id?: number;
  salesman_id?: number;
  port_of_unloading_id?: number;
  liner?: number;
  master_bl_ref?: string;
  transact_not_ref?: string;
  etd?: string;
  file_ref?: string;
  transact_amount?: number;
  deleted?: boolean;
  deleted_at?: string;
  unstuffing_place?: string;
}
