import { ListFilter } from "../../types/table";
import axios from "axios";
import { TransactionNoteModel } from "../../types/request";

export const getTransactionNote = async (transaction_id: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-transaction-note/${transaction_id}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getTransactionNoteList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/transaction-note-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addTransactionNote = async (
  transactionNote: TransactionNoteModel,
) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-transaction-note`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, transactionNote, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateTransactionNote = async (
  transactionNote: TransactionNoteModel,
) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-transaction-note`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, transactionNote, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
