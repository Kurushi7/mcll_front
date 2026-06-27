import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import ShipmentListDocument from "./ShipmentListDocument";
import { getShipmentList } from "../../composables/shippings/Shipments";
import {
  Column,
  FilterItems,
  ListFilter,
  ListRequest,
} from "../../types/table";
import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid2,
  Paper,
  Snackbar,
  SnackbarCloseReason,
  ThemeProvider,
} from "@mui/material";
import { pdf } from "@react-pdf/renderer";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import React, { useEffect, useState } from "react";
import ListConstants from "../../composables/constants/table";
import { GridPaginationModel } from "@mui/x-data-grid";
import { CheckBox } from "@mui/icons-material";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import FilterPanel from "../../components/dataTable/FilterPanel";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

const ShipmentListView = () => {
  const columns: Column[] = [
    {
      field: "shipment_id",
      headerName: "Shipment Id",
      operators: [
        {
          name: ListConstants.EQUALS,
          component: "number",
        },
        {
          name: ListConstants.NOT_EQUALS,
          component: "number",
        },
        {
          name: ListConstants.GREATER_THAN,
          component: "number",
        },
        {
          name: ListConstants.EQUAL_OR_GREATER_THAN,
          component: "number",
        },
        {
          name: ListConstants.LESS_THAN,
          component: "number",
        },
        {
          name: ListConstants.EQUAL_OR_LESS_THAN,
          component: "number",
        },
      ],
    },
    {
      field: "hbl_no",
      headerName: "Hbl No",
      flex: 1,
      operators: [
        {
          name: ListConstants.CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.NOT_CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.STARTS_WITH,
          component: "text",
        },
        {
          name: ListConstants.ENDS_WITH,
          component: "text",
        },
      ],
    },
    {
      field: "master_bl_ref",
      headerName: "Master Bl Ref",
      flex: 1,
      operators: [
        {
          name: ListConstants.CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.NOT_CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.STARTS_WITH,
          component: "text",
        },
        {
          name: ListConstants.ENDS_WITH,
          component: "text",
        },
      ],
    },
    {
      field: "eta",
      headerName: "Eta",
      type: "date",
      valueFormatter: (params) => {
        return params ? new Date(params).toISOString().split("T")[0] : "";
      },
      operators: [
        {
          name: ListConstants.LESS_THAN,
          component: "date",
          defaultValue: null,
        },
        {
          name: ListConstants.EQUAL_OR_LESS_THAN,
          component: "date",
          defaultValue: null,
        },
        {
          name: ListConstants.GREATER_THAN,
          component: "date",
          defaultValue: null,
        },
        {
          name: ListConstants.EQUAL_OR_GREATER_THAN,
          component: "date",
          defaultValue: null,
        },
      ],
    },
    {
      field: "etd",
      headerName: "Etd",
      type: "date",
      valueFormatter: (params) => {
        return params ? new Date(params).toISOString().split("T")[0] : "";
      },
      operators: [
        {
          name: ListConstants.LESS_THAN,
          component: "date",
          defaultValue: null,
        },
        {
          name: ListConstants.EQUAL_OR_LESS_THAN,
          component: "date",
          defaultValue: null,
        },
        {
          name: ListConstants.GREATER_THAN,
          component: "date",
          defaultValue: null,
        },
        {
          name: ListConstants.EQUAL_OR_GREATER_THAN,
          component: "date",
          defaultValue: null,
        },
      ],
    },
    {
      field: "port_of_loading",
      headerName: "Loading port",
      flex: 1,
      operators: [
        {
          name: ListConstants.CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.NOT_CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.STARTS_WITH,
          component: "text",
        },
        {
          name: ListConstants.ENDS_WITH,
          component: "text",
        },
      ],
    },
    {
      field: "port_of_unloading",
      headerName: "Unloading port",
      flex: 1,
      operators: [
        {
          name: ListConstants.CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.NOT_CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.STARTS_WITH,
          component: "text",
        },
        {
          name: ListConstants.ENDS_WITH,
          component: "text",
        },
      ],
    },
  ];

  const [selectedColumns, setSelectedColumns] = useState<Column[]>(columns);
  const [loading, setLoading] = React.useState(false);
  const primaryKey = "shipment_id";
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
  const customTheme = createTheme(getTheme());

  const [data, setData] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [filterData, setFilterData] = React.useState<any[]>([]);
  const [error, setError] = React.useState("");
  const [showError, setShowError] = React.useState(false);
  const [pdfUrl, setPdfUrl] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const [reload, setReload] = React.useState(false);

  const fetchShipmentData = (filter: ListFilter) => {
    return getShipmentList(filter);
  };

  const fetchData = async (
    filterItems: FilterItems[],
    pagination?: GridPaginationModel,
  ) => {
    setReload(false);
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
      response = await fetchShipmentData(filters);
      setData(response.data.data);
      setTotal(response.data.total);
      setLoading(false);
      setReload(true);
    } catch (err) {
      setError(`Error fetching data: ${response?.data.error.response.data}`);
      setShowError(true);
      setOpenSnackBar(true);
      setLoading(false);
    }
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackBar(false);
  };

  const handleToggle = (event: any, columnId: string) => {
    const checked = event.target.checked;
    const column = columns.find((col) => col.field === columnId);

    if (!column) return;

    setSelectedColumns((prev) => {
      return prev.find((col) => col.field === columnId)
        ? prev.filter((col) => col.field !== columnId)
        : [...prev, column];
    });
  };

  const generatePDFReport = async () => {
    const pdfBlob = await pdf(
      <ShipmentListDocument
        data={data}
        total={total}
        selectedColumns={selectedColumns}
      />,
    ).toBlob();

    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
  };

  useEffect(() => {
    if (pdfUrl) {
      setOpen(true);
    }
  }, [pdfUrl]);

  useEffect(() => {
    if (reload && data.length > 0) {
      (async () => {
        await generatePDFReport();
      })();
    }
  }, [reload]);

  return (
    <ThemeProvider theme={customTheme}>
      <Paper sx={{ width: "100%" }}>
        <Grid2 container spacing={2}>
          <Grid2 size={5}>
            <FilterPanel
              columns={columns}
              fetchData={fetchData}
              data={filterData}
              setData={setFilterData}
            />
          </Grid2>

          <Grid2 size={1} sx={{ display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                width: "1px",
                backgroundColor: "rgba(0,0,0,0.12)",
                height: "100%",
              }}
            />
          </Grid2>

          <Grid2 size={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Select columns</FormLabel>
              <FormGroup>
                <Grid2 container spacing={2}>
                  {selectedColumns.map((column, index) => {
                    return (
                      <Grid2 size={3} key={index}>
                        <FormControlLabel
                          key={index}
                          label={column.headerName}
                          control={
                            <CheckBox
                              aria-checked={
                                !!selectedColumns.find(
                                  (col) => column.field === col.field,
                                )
                              }
                              onChange={(event: any) =>
                                handleToggle(event, column.field)
                              }
                            />
                          }
                        />
                      </Grid2>
                    );
                  })}
                </Grid2>
              </FormGroup>
            </FormControl>
          </Grid2>

          {open && (
            <Dialog
              open={open}
              onClose={() => setOpen(false)}
              maxWidth="md"
              hideBackdrop={true}
              PaperProps={{
                style: {
                  width: "100%",
                  maxHeight: "90vh",
                },
              }}
            >
              <DialogContent>
                <Card
                  sx={{
                    "& .MuiTextField-root": { m: 1 },
                    paddingBottom: "4px",
                    backgroundColor: "hsl(0deg 0% 100%)",
                  }}
                >
                  {pdfUrl && (
                    <Box
                      sx={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        overflow: "auto",
                      }}
                    >
                      <PDFViewer width="100%" height="600">
                        <ShipmentListDocument
                          data={data}
                          total={total}
                          selectedColumns={selectedColumns}
                        />
                      </PDFViewer>
                    </Box>
                  )}
                </Card>
                <DialogActions>
                  <Button onClick={() => setOpen(false)}>Close</Button>
                </DialogActions>
              </DialogContent>
            </Dialog>
          )}
        </Grid2>

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
    </ThemeProvider>
  );
};

export default ShipmentListView;
