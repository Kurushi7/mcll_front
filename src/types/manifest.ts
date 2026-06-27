export interface UpdateShipmentZoneModel {
  shipment_limit_id: number;
  shipment_zone?: string;
  country?: string;
  salesman_id?: number;
  max_charge: number;
  currency: string;
}

export interface UpdateShipmentManifestStagingModel {
  staging_id: number;
  valid_from?: string;
  valid_to?: string;
  price?: number;
  port?: string;
  country?: string;
}

export interface UpdateFreightQuoteModel {
  manifest_id: number;
  valid_from?: string;
  valid_to?: string;
  price?: number;
  port?: string;
  country?: string;
}
