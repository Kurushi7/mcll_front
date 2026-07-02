
export interface PersonModel {
  person_id?: number;
  first_name: string;
  last_name: string;
  city: string;
  country: string;
  address_line1: string;
  address_line2: string;
  phone1: string;
  phone2: string;
  fax?: string;
  watsapp_no: string;
  email: string;
  type: string;
  blocked?: boolean;
  date_created?: Date;
  date_modified?: Date;
  id_linked_to?: number;
  port_ids?: string;
}

export interface CompanyModel {
  company_id?: number;
  name: string;
  email: string;
  address_line1: string;
  address_line2: string;
  country: string;
  city: string;
  person_id: number;
}

export interface PortModel {
  port_id?: number;
  name: string;
  code: string;
  type: "loading" | "unloading";
  default: boolean;
}

export interface PriceModel {
  from: string;
  to: string;
  price: number;
  // type: "trucking" | "trucking + labour" | "trucking + labour + arrangements";
  price_id?: number;
  person_id?: number;
  product_id?: number;
  date_created?: Date;
  date_modified?: Date;
}

export interface ProductModel {
  product_id?: number;
  name: string;
  tags: string;
  date_created?: Date;
  date_modified?: Date;
}

export interface ShipmentModel {
  shipment_id?: number;
  consignee_id: number;
  notify_party_id1: number;
  notify_party_id2?: number;
  liner_id: number;
  master_bl_ref: string;
  file_ref: string;
  port_of_loading_id: number;
  port_of_unloading_id: number;
  etd?: string;
  eta?: string;
  user_id: number;
  group: string;
}

export interface ShipmentVesselsModel {
  shipment_vessel_id?: number;
  shipment_id: number;
  vessel_id: number;
  name: string;
  type: string;
  voyage_no: string;
}

export interface Vessels {
  vessel_id?: number;
  vessel_name: string;
  liner_id: number;
}

export interface ContainerLinesModel {
  container_line_id?: number;
  shipment_hbl_id?: number;
  container_no: string;
  seal_no: string;
  no_of_packages: number;
  weight: number;
  measurement: number;
  size: string;
  description: string;
  marks_numbers: string;
  shipment_id?: number;
}

export interface UpdateContainerLinesModel {
  container_line_id?: number;
  shipment_hbl_id?: number;
  container_no?: string;
  seal_no?: string;
  no_of_packages?: number;
  weight?: number;
  measurement?: number;
  size?: string;
  description?: string;
  marks_numbers?: string;
  shipment_id?: number;
  deleted?: boolean;
  deleted_at?: string;
}

export interface LinersModel {
  liner_id?: number;
  name: string;
  type: string;
}

export interface InvoiceModel {
  invoice_id?: number;
  shipment_id: number;
  invoice_ref: string;
  currency: string;
  invoice_date: Date;
  due_date: Date;
  total: number;
  vat: number;
  total_with_vat: number;
  type: string;
  rate: number;
  date_created: Date;
}

export interface VesselModel {
  vessel_id?: number;
  vessel_name: string;
  liner_id: number;
  liner_name: string;
  type: string;
}

export interface ShipmentHblModel {
  shipment_hbl_id?: number;
  shipment_id: number;
  hbl_no: string;
  consignee_id: number;
  first_name: string;
  last_name: string;
  movement_type: string;
  delivery_agent_id: number;
  shipper_id: number;
  unstuffing_place: string;
  notify_party_id1: number;
  notify_party_id2: number;
  deleted: boolean;
  deleted_at?: string;
}

export interface TransactionNoteModel {
  transaction_id?: number;
  shipment_id: number;
  ref_no: string;
  amount: number;
  type: string;
  currency: string;
  rate: number;
  date_created?: string;
  shipment_hbl_id: number;
}

export interface RateModel {
  rate_id?: number;
  currency: string;
  rate: number;
  date: string;
}

export interface ShipmentLimitModel {
  shipment_limit_id?: number;
  port_of_loading: PortModel | null;
  valid_from: string;
  valid_to: string;
  liner_id: number;
  third_party: string;
  size: string;
  max_charge: number;
  currency: string;
}

export interface ShipmentManifestStagingModel {
  staging_id?: number;
  valid_from: string;
  valid_to: string;
  rate: number;
  port_of_destination: PortModel | null;
  port_of_trans_shipment: PortModel | null;
  size: string;
  liner_id: number;
  salesman_id: number;
  third_party: string;
  currency: string;
}

export interface FreightQuoteModel {
  quote_id?: number;
  valid_from: string;
  valid_to: string;
  rate: number;
  port_of_destination: PortModel | null;
  port_of_trans_shipment: PortModel | null;
  size: string;
  liner_id: number;
  salesman_id: number;
  third_party: string;
  currency: string;
}

export interface FreightQuoteStagingFormModel {
  staging_id?: number;
  valid_from: string;
  valid_to: string;
  rate: number;
  port_of_destination: PortModel | null;
  port_of_trans_shipment: PortModel | null;
  size: string;
  liner: string;
  liner_id: number;
  salesman_id: number;
  third_party: string;
  currency: string;
}

export interface ShipmentProcessModel{
  shipment_process_id?: number;
  shipment_id?: number;
  client_identification?: string;
  booking_instructions?: string;
  document_entries?: string;
  tracking?: string;
  custom_clearance?: string;
  delivery_haulage?: string;
  billing_debtors?: string;
  documents?: string;
}