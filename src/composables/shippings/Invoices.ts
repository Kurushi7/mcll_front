import { ListFilter } from "../../types/table";
import axios from "axios";
import { TransformedInvoiceModel } from "../../types/invoiceTypes";

export const getInvoice = async (invoice_id: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-invoice/${invoice_id}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getInvoiceList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/invoice-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addInvoice = async (invoice: TransformedInvoiceModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-invoice`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, invoice, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateInvoice = async (invoice: TransformedInvoiceModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-invoice`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, invoice, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteInvoice = async (invoice_id: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/delete-invoice/${invoice_id}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.put(url, "", {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
