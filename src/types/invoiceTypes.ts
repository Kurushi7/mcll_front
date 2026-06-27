export interface TransformedInvoiceModel {
  invoice_id?: number;
  shipment_id?: number;
  invoice_ref: string;
  currency: string;
  invoice_date: string;
  due_date: string;
  total: number;
  vat: number;
  total_with_vat: number;
  type: string;
  date_created?: string;
  rate: number;
  shipment_hbl_id?: number;
}
