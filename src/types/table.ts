import {
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";
import {JSX} from "react";

export interface Operator {
  name: string;
  component: string;
  defaultValue?: any;
  options?: any;
}

export interface Column {
  field: string;
  headerName?: string;
  minWidth?: number;
  align?: "left";
  style?: object;
  hidden?: boolean;
  flex?: number;
  type?: string;
  operators?: Operator[];
  renderCell?: (row: any) => JSX.Element;
  editable?: boolean;
  valueFormatter?: (params: any) => string;
}

export interface FilterItem {
  field: string;
  value: any;
  operator: string;
  logicOperator: string;
}

export interface SortItem {
  field: string;
  sort: string;
}

export interface ListFilter {
  limit: number;
  offset: number;
  filter: FilterItem[];
  sort: GridSortModel;
}

export interface ButtonList {
  key: string;
  handleOnClick: (data?: any) => void;
  label: string;
  style: { [key: string]: any };
}

export type ListRequest = {
  paginationModel: GridPaginationModel;
  filterModel: FilterItem[];
  sortModel: GridSortModel;
};

export type FilterItems = {
  logicOperator: string;
  field: string;
  operator: string;
  operatorList: Operator[];
  value: string;
  component: string;
  options?: any;
};

export type ListResponse = {
  total: number;
  data: any[];
};
