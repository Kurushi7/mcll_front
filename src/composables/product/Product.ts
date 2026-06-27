import { ListFilter } from "../../types/table";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ProductModel } from "../../types/request";

export const getProductList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/product-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchProductById = async (productId: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-product/${productId}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const saveProduct = async (
  product: ProductModel,
): Promise<AxiosResponse | AxiosError> => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/insert-product`;
  const token = localStorage.getItem("jwtToken");

  const personData = {
    name: product.name,
    tags: product.tags,
    date_created: new Date(),
  };

  return await axios.post(url, personData, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateProduct = async (
  product: ProductModel,
): Promise<AxiosResponse | AxiosError> => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-product`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, product, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
