import axios from "axios";
import { PriceModel } from "../../types/request";
import { ListFilter } from "../../types/table";

export const getPricesList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/prices-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getPriceById = async (priceId: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-price/${priceId}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const savePrice = async (price: PriceModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-price`;
  const token = localStorage.getItem("jwtToken");

  const priceData = {
    from: price.from,
    to: price.to,
    price: price.price,
    person_id: price.person_id,
    product_id: price.product_id,
    date_created: price.date_created,
  };

  return await axios.post(url, priceData, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const editPrice = async (price: PriceModel) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/edit-price`;
  const token = localStorage.getItem("jwtToken");

  const priceData = {
    from: price.from,
    to: price.to,
    price: price.price,
    person_id: price.person_id,
    product_id: price.product_id,
    price_id: price.price_id,
    date_created: price.date_created,
  };

  return await axios.post(url, priceData, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
