import axios, { AxiosError, AxiosResponse } from "axios";
import { CompanyModel, PersonModel } from "../../types/request";
import { ListFilter } from "../../types/table";

export const getPersonsList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/persons-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchPersonById = async (personId: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-person/${personId}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchCompanyDetails = async (personId: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-company/${personId}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchAllRelatedPersons = async (personId: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-related-persons/${personId}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const savePerson = async (
  person: PersonModel,
): Promise<AxiosResponse | AxiosError> => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/insert-person`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, person, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updatePerson = async (
  person: PersonModel,
): Promise<AxiosResponse | AxiosError> => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-person`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, person, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const saveCompany = async (
  company: CompanyModel,
): Promise<AxiosResponse | AxiosError> => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/insert-company`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, company, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateCompany = async (
  company: CompanyModel,
): Promise<AxiosResponse | AxiosError> => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-company`;
  const token = localStorage.getItem("jwtToken");

  return await axios.put(url, company, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export type Persons = {
  person_id: number;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string;
  phone1: string;
  phone2: string;
  watsapp_no: string;
  email: string;
  date_created: Date;
  date_modified: Date;
  type: string;
  city: string;
  country: string;
};
