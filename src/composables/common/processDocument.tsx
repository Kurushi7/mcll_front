import axios from "axios";

export interface ProcessDocumentModel {
  shipment_document_id?: number;
  shipment_process_id?: number;
  shipment_id?: number;
  tas?: number;
  noa?: string;
  delivery_note_required?: boolean;
  delivery_note_uploaded?: boolean;
  house_bl_required?: boolean;
  house_bl_uploaded?: boolean;
  master_bl_required?: boolean;
  master_bl_uploaded?: boolean;
  liner_invoice_required?: boolean;
  liner_invoice_uploaded?: boolean;
  cpw_invoice_required?: boolean;
  cpw_invoice_uploaded?: boolean;
  credit_invoice_required?: boolean;
  credit_invoice_uploaded?: boolean;
}

export const updateProcessDocuments = async (
  document: ProcessDocumentModel,
) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-process-document`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, document, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
