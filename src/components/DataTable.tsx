import {
  ButtonList,
  Column,
  FilterItems,
  ListFilter,
  ListRequest,
} from "../types/table";
import React, { useEffect, useRef, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridFilterListIcon,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Snackbar,
  SnackbarCloseReason,
} from "@mui/material";
import FilterPanelPopUp from "./dataTable/FilterPanelPopUp";

interface Request {
  columns: Column[];
  handleFetchData: (filter: ListFilter) => Promise<any>;
  primaryKey: string;
  buttonList: ButtonList[];
  hiddenColumns: GridColumnVisibilityModel;
  reloadData?: boolean;
  setReloadData: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataTable: React.FC<Request> = ({
  columns,
  handleFetchData,
  primaryKey,
  buttonList,
  hiddenColumns,
  reloadData,
  setReloadData,
}) => {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [error, setError] = React.useState("");
  const [showError, setShowError] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [state, setState] = useState<ListRequest>({
    paginationModel: {
      page: 0,
      pageSize: 10,
    },
    filterModel: [],
    sortModel: [
      {
        field: `${primaryKey}`,
        sort: "desc",
      },
    ],
  });
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const [filterData, setFilterData] = React.useState<any[]>([]);
  const isFirstRender = useRef(true);

  const [GridColumns, setGridColumns] = useState<GridColDef[]>([]);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const [sortModel, _setSortModel] = React.useState<GridSortModel>([
    { field: `${primaryKey}`, sort: "asc" },
  ]);

  const convertToGridCol = () => {
    return columns.map((item: Column) => {
      const result: GridColDef = {
        field: item.field,
        headerName: item.headerName ?? "",
      };

      if (item.flex) {
        result.flex = item.flex;
      }

      if (item.renderCell) {
        result.renderCell = item.renderCell;
      }

      if (item.editable) {
        result.editable = item.editable;
      }

      if (item.valueFormatter) {
        result.valueFormatter = item.valueFormatter;
      }

      return result;
    });
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const closePopOver = () => {
    setOpen(false);
  };

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackBar(false);
  };

  const updatePagination = async (newPagination: GridPaginationModel) => {
    setState((prevState) => ({
      ...prevState,
      paginationModel: newPagination,
    }));
    await fetchData([], newPagination);
  };

  const fetchData = async (
    filterItems: FilterItems[],
    pagination?: GridPaginationModel,
  ) => {
    setLoading(true);

    const currentPagination = pagination || state.paginationModel;

    if (filterItems.length !== 0) {
      state.filterModel = filterItems.map((filterItem: FilterItems) => {
        return {
          value: filterItem.value,
          field: filterItem.field,
          operator: filterItem.operator,
          logicOperator: filterItem.logicOperator,
        };
      });
    }

    const offset = currentPagination.page * currentPagination.pageSize;

    const filters: ListFilter = {
      limit: currentPagination.pageSize,
      offset: offset,
      filter: state.filterModel,
      sort: state.sortModel,
    };

    let response: any = undefined;
    try {
      response = await handleFetchData(filters);
      setData(response.data.data);
      setTotal(response.data.total);
      setLoading(false);
    } catch (err) {
      setError(`Error fetching data: ${response?.data.error.response.data}`);
      setShowError(true);
      setOpenSnackBar(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reloadData || reloadData === undefined) {
      (async () => {
        try {
          await fetchData([]);
        } catch (error) {
          console.error("Error fetching data:", error);
          setSnackMessage({
            message: "Error fetching data",
            severity: "error",
          });
          setOpenSnackBar(true);
        }
      })();
      setReloadData(false);
    }
  }, [reloadData]);

  useEffect(() => {
    setGridColumns(convertToGridCol());
    (async () => {
      try {
        await fetchData([], state.paginationModel);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackMessage({
          message: "Error fetching data",
          severity: "error",
        });
        setOpenSnackBar(true);
      }
    })();
  }, []);

  const handleSortUpdate = async (
    model: GridSortModel
  ) => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setState((prevState) => ({
      ...prevState,
      sortModel: model,
    }));

    setReloadData(true);
  };

  const handleProcessRowUpdate = (newRow: any) => {
    const updatedRows = data.map((row) => {
      return row[primaryKey] === newRow[primaryKey]
        ? { ...row, ...newRow }
        : row;
    });
    setData(updatedRows);
    return newRow;
  };

  return (
    <Paper sx={{ width: "100%" }}>
      <Box sx={{ padding: "0 16px" }}>
        <Box sx={{display:"flex", justifyContent: "flex-end", mb:4}}>
          {buttonList &&
            buttonList.map((button) => (
              <Button
                key={button.key}
                variant="outlined"
                onClick={button.handleOnClick}
                sx={{ ...button.style }}
              >
                {button.label}
              </Button>
            ))}
        </Box>

        <Grid container>
          <Grid size={12}>
            <div style={{ display: "flex", gap: "8px", padding: "4px" }}>
              <Button
                variant="outlined"
                startIcon={<GridFilterListIcon />}
                onClick={handlePopoverOpen}
              >
                Filters
              </Button>
            </div>
          </Grid>
          <Grid size={12}>
            <DataGrid
              rows={data}
              columns={GridColumns}
              loading={loading}
              rowCount={total}
              paginationMode="server"
              paginationModel={state.paginationModel}
              pageSizeOptions={[10, 20, 30]}
              checkboxSelection
              sx={{ border: 0 }}
              onPaginationModelChange={(pagination) =>
                updatePagination(pagination)
              }
              columnVisibilityModel={hiddenColumns}
              getRowId={(row) => row[primaryKey]}
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={(model) =>
                handleSortUpdate(model)
              }
              disableColumnFilter={true}
              processRowUpdate={handleProcessRowUpdate}
            />
            <Snackbar
              open={showError}
              autoHideDuration={5000}
              message={error}
            />
          </Grid>
        </Grid>
      </Box>
      {open && (
        <FilterPanelPopUp
          columns={columns}
          open={open}
          handlePopoverClose={closePopOver}
          anchorEl={anchorEl}
          fetchData={fetchData}
          data={filterData}
          setData={setFilterData}
        />
      )}
      {openSnackBar && (
        <Snackbar
          open={openSnackBar}
          autoHideDuration={5000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity={snackMessage.severity}
            variant="filled"
          >
            {snackMessage.message}
          </Alert>
        </Snackbar>
      )}
    </Paper>
  );
};

export default DataTable;
