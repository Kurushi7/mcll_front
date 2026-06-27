import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FilterItem, ListFilter } from "../../types/table";
import ListConstants from "../../composables/constants/table";
import { GridSortItem } from "@mui/x-data-grid";
import { getPersonsList } from "../../composables/persons/Persons";
import { PersonCountry } from "../../types/ShipmentTypes";
import { getPortList } from "../../composables/persons/Ports";

export const fetchPersonOptions = createAsyncThunk(
  "personOptions",
  async ({ allPerson, term }: { allPerson: boolean; term: string }) => {
    const filterItem: FilterItem[] = [];

    if (!allPerson && term !== "") {
      filterItem.push(
        {
          field: "first_name",
          value: term,
          operator: ListConstants.CONTAINS,
          logicOperator: "or",
        },
        {
          field: "last_name",
          value: term,
          operator: ListConstants.CONTAINS,
          logicOperator: "or",
        },
      );
    }

    if (allPerson) {
      filterItem.push({
        field: "type",
        value: "agent,consignee,supplier",
        operator: ListConstants.ANY_OF,
        logicOperator: "and",
      });
    }

    const sortItem: GridSortItem[] = [
      {
        field: "first_name",
        sort: "asc",
      },
      {
        field: "last_name",
        sort: "asc",
      },
    ];

    const filters: ListFilter = {
      limit: 0,
      offset: 0,
      filter: filterItem,
      sort: sortItem,
    };

    const result = await getPersonsList(filters);
    const personOptions: PersonCountry[] | null = result
      ? result.data.data
      : null;

    return personOptions;
  },
);
