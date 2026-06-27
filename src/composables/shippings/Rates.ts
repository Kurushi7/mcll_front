import { ListFilter } from "../../types/table";
import axios from "axios";
import { RateModel } from "../../types/request";

export const getRate = async (rate_id: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-rate/${rate_id}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getRateAtDate = async (currency: string, date: any) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-rate-as-at/${currency}/${date}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getRateList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/rate-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addRate = async (rate: RateModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-rate`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, rate, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateRate = async (rate: RateModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-rate`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, rate, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
