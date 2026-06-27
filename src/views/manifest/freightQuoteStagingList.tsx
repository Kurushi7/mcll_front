import React, { useEffect, useRef, useState } from "react";
import { ButtonList, Column, FilterItem, ListFilter } from "../../types/table";
import DataTable from "../../components/DataTable";
import {
  Alert,
  Autocomplete,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Grid2,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  SnackbarCloseReason,
  TextField,
  ThemeProvider,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import SmartButtonOutlinedIcon from "@mui/icons-material/SmartButtonOutlined";
import ListConstants from "../../composables/constants/table";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  LinersModel,
  PortModel,
  FreightQuoteStagingFormModel,
  ShipmentManifestStagingModel,
} from "../../types/request";
import {
  addManifestStaging,
  getManifestStaging,
  getManifestStagingList,
  updateManifestStaging,
} from "../../composables/manifest/FreightQuoteStaging";
import { z } from "zod";
import { validateForm } from "../../composables/product/FormValidation";
import { GridSortItem } from "@mui/x-data-grid";
import { getPortList } from "../../composables/persons/Ports";
import ImportFile from "./importFile";
import { getLinerList } from "../../composables/shippings/Liners";

interface VesselsParams {
  vessel_id?: number;
  name: string;
  liner_id: number;
}

const FreightQuoteStagingList = () => {
  const [reloadData, setReloadData] = React.useState(false);
  const customTheme = createTheme(getTheme());
  const user_id = useSelector((state: RootState) => state.user.user_id);
  const [openImportEl, setOpenImportEl] = useState(false);

  const buttonRefs = useRef<any>({});
  const [open, setOpen] = React.useState(false);

  const columns: Column[] = [
    { field: "staging_id", headerName: "", hidden: true },
    {
      field: "valid_from",
      headerName: "Valid from",
      flex: 1,
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
      field: "valid_to",
      headerName: "Valid to",
      flex: 1,
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
      field: "rate",
      headerName: "rate",
      flex: 1,
      operators: [
        {
          name: ListConstants.EQUALS,
          component: "text",
        },
        {
          name: ListConstants.NOT_EQUALS,
          component: "text",
        },
        {
          name: ListConstants.LESS_THAN,
          component: "text",
        },
        {
          name: ListConstants.EQUAL_OR_LESS_THAN,
          component: "text",
        },
        {
          name: ListConstants.GREATER_THAN,
          component: "text",
        },
        {
          name: ListConstants.EQUAL_OR_GREATER_THAN,
          component: "text",
        },
      ],
    },
    {
      field: "currency",
      headerName: "Currency",
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
      field: "size",
      headerName: "Size",
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
      field: "liner_name",
      headerName: "Liner name",
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
      field: "",
      headerName: "Actions",
      type: "action",
      flex: 1,
      renderCell: (params) => <ActionDropdown row={params.row} />,
    },
  ];
  const [errors, setErrors] = useState<Record<string, string | null>>({
    valid_from: "",
    valid_to: "",
    rate: "",
    currency: "",
    salesman_id: "",
  });

  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });

  const hiddenColumns = {
    staging_id: false,
  };
  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const handleFetchData = async (filter: ListFilter) => {
    const filterItem: FilterItem = {
      field: "salesman_id",
      value: user_id,
      operator: ListConstants.EQUALS,
      logicOperator: "and",
    };

    filter.filter = [...filter.filter, filterItem];
    return getManifestStagingList(filter);
  };

  const actions: ButtonList[] = [
    {
      key: "import-freight-quote-staging",
      handleOnClick: async (event: any) => {
        setOpenImportEl(true);
      },
      label: "Import manifest staging",
      style: { mt: 2 },
    },
  ];

  const [port, setPort] = React.useState<PortModel[]>([]);

  const blankManifestStaging: FreightQuoteStagingFormModel = {
    staging_id: 0,
    valid_from: new Date().toISOString().split("T")[0],
    valid_to: new Date().toISOString().split("T")[0],
    rate: 0,
    port_of_destination: null,
    port_of_trans_shipment: null,
    size: "20",
    liner: "",
    salesman_id: 0,
    third_party: "Sela",
    currency: "MUR",
    liner_id: 0,
  };

  const [manifestStaging, setManifestStaging] =
    React.useState<FreightQuoteStagingFormModel>(blankManifestStaging);

  const ActionDropdown: React.FC<{ row: any }> = ({ row }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleAction = async (selectedAction: string) => {
      handleMenuClose();
      if (selectedAction === "edit") {
        await fetchManifest(row.staging_id);
        setOpen(true);
      }
    };

    return (
      <>
        <IconButton size="small" onClick={(event) => handleMenuOpen(event)}>
          <SmartButtonOutlinedIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <MenuItem onClick={(row) => handleAction("edit")}>Edit</MenuItem>
        </Menu>
      </>
    );
  };

  const handlePopOverClose = () => {
    setOpen(false);
  };

  const handleCloseSnackBar = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  const handleSelectChange = async (event: any) => {
    const { name, value } = event.target;
    setManifestStaging((prevShipmentManifestStaging) => ({
      ...prevShipmentManifestStaging,
      [name]: value,
    }));
  };

  const formSchema = z.object({
    valid_from: z
      .string()
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: "Invalid valid from date format",
      })
      .transform((val) => new Date(val)),
    valid_to: z
      .string()
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: "Invalid valid to date format",
      })
      .transform((val) => new Date(val)),
    currency: z.string().min(2, "The currency is required"),
    price: z.number().gt(0, "Price cannot be zero"),
    port: z.string().min(2, "The port is required"),
  });

  const [linerOptions, setLinerOptions] = React.useState<LinersModel[] | null>(
    null,
  );

  const blankVesssel = {
    name: "",
    liner_id: 0,
  };

  const [vessels, setVessels] = useState<VesselsParams>(blankVesssel);

  const getLinerOptions = async () => {
    const sortItem: GridSortItem[] = [
      {
        field: "liner_id",
        sort: "desc",
      },
    ];

    const filters: ListFilter = {
      limit: 0,
      offset: 0,
      filter: [],
      sort: sortItem,
    };

    const result = await getLinerList(filters);

    if (!result) {
      return;
    }

    setLinerOptions(result.data.data);
    manifestStaging.liner_id =
      manifestStaging.liner_id && manifestStaging.liner_id !== 0
        ? manifestStaging.liner_id
        : result.data.data[0].liner_id;

    const data: LinersModel[] = result.data.data;

    if (data[0].liner_id) {
      vessels.liner_id = data[0].liner_id;
    }
  };

  const fetchManifest = async (staging_id: number) => {
    const result = await getManifestStaging(staging_id);

    if (!result) return;

    const shipmentManifestStaging: FreightQuoteStagingFormModel =
      result.data.shipmentManifestStaging;

    setManifestStaging({
      liner_id: shipmentManifestStaging.liner_id,
      staging_id: shipmentManifestStaging.staging_id,
      liner: shipmentManifestStaging.liner,
      size: shipmentManifestStaging.size,
      third_party: shipmentManifestStaging.third_party,
      valid_from: shipmentManifestStaging.valid_from,
      valid_to: shipmentManifestStaging.valid_to,
      rate: shipmentManifestStaging.rate,
      port_of_destination: shipmentManifestStaging.port_of_destination,
      port_of_trans_shipment: shipmentManifestStaging.port_of_trans_shipment,
      salesman_id: shipmentManifestStaging.salesman_id,
      currency: shipmentManifestStaging.currency,
    });
  };

  const currencyOptions: { id: string; label: string }[] = [
    {
      id: "MUR",
      label: "MUR",
    },
    {
      id: "USD",
      label: "USD",
    },
    {
      id: "EUR",
      label: "EUR",
    },
    {
      id: "GBP",
      label: "GBP",
    },
  ];

  const sizeOptions: { id: string; label: string }[] = [
    {
      id: "20",
      label: "20",
    },
    {
      id: "40",
      label: "40",
    },
    {
      id: "40_hc",
      label: "40HC",
    },
    {
      id: "20_reefer",
      label: "20 Reefer",
    },
    {
      id: "40_reefer_hc",
      label: "40 Reefer HC",
    },
    {
      id: "20_nor",
      label: "20 Nor",
    },
    {
      id: "40_nor",
      label: "40 Nor",
    },
    {
      id: "flatrack",
      label: "Flatrack",
    },
    {
      id: "roro",
      label: "RoRo",
    },
  ];

  const thirdPartiesOptions: { id: string; label: string }[] = [
    {
      id: "sela",
      label: "Sela",
    },
    {
      id: "kyle",
      label: "Kyle",
    },
    {
      id: "fac",
      label: "fac",
    },
  ];

  const handleChange = async (event: any, type: string) => {
    const { id, value } = event.target;

    const finalValue = type === "float" ? parseFloat(value) : value;
    setManifestStaging((prevManifestStaging) => ({
      ...prevManifestStaging,
      [id]: finalValue,
    }));
  };

  const handleAddShipmentManifestStaging = async (event: any) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();

      const isValid = validateForm(formSchema, manifestStaging, setErrors);

      if (!isValid) {
        return;
      }

      if (!manifestStaging) return;

      const manifestStagingRecord: ShipmentManifestStagingModel = {
        valid_from: manifestStaging.valid_from,
        valid_to: manifestStaging.valid_to,
        rate: manifestStaging.rate,
        port_of_destination: manifestStaging.port_of_destination,
        port_of_trans_shipment: manifestStaging.port_of_trans_shipment,
        salesman_id: manifestStaging.salesman_id,
        currency: manifestStaging.currency,
        size: manifestStaging.size,
        liner_id: manifestStaging.liner_id,
        third_party: manifestStaging.third_party,
      };

      let result = null;

      if (
        manifestStagingRecord.staging_id &&
        manifestStagingRecord.staging_id != 0
      ) {
        manifestStagingRecord.staging_id = manifestStaging.staging_id;
        result = await updateManifestStaging(manifestStagingRecord);
      } else {
        result = await addManifestStaging(manifestStagingRecord);
      }

      if (!result) return;

      if (result.status) {
        if (result.status === 200) {
          setSnackMessage({
            message: `Manifest staging saved successfully`,
            severity: "success",
          });
        } else if (result.status === 204) {
          setSnackMessage({
            message: `Manifest staging updated successfully`,
            severity: "success",
          });
        }
        setReloadData(true);
        setOpenSnackBar(true);
      } else {
        setSnackMessage({
          message: `Error while saving manifest staging`,
          severity: "error",
        });
        setOpenSnackBar(true);
      }

      setManifestStaging(blankManifestStaging);

      handlePopOverClose();
    }
  };

  const getPortOptions = async () => {
    const sortItem: GridSortItem[] = [
      {
        field: "port_id",
        sort: "desc",
      },
    ];

    const filters: ListFilter = {
      limit: 0,
      offset: 0,
      filter: [],
      sort: sortItem,
    };

    const result = await getPortList(filters);
    if (!result || !result.data) {
      return;
    }

    setPort(result.data.data);
  };

  const handleAutoCompleteChange = async (
    event: React.SyntheticEvent,
    newValue: any,
  ) => {
    setManifestStaging((prevManifestStaging) => ({
      ...prevManifestStaging,
      country: newValue.name,
    }));
  };

  const getPorts = async (event: any, reason: string) => {
    if (!event) return;

    if (reason !== "input") return;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(async () => {
      await getPortOptions();
    }, 500);

    setTimeoutId(newTimeoutId);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onCloseImportEL = () => {
    setOpenImportEl(false);
  };

  useEffect(() => {
    (async () => {
      try {
        await getLinerOptions();
      } catch (error) {
        console.log("Error getting agent list", error);
      }
    })();
  }, []);

  return (
    <ThemeProvider theme={customTheme}>
      <Dialog
        open={open}
        onClose={() => onClose()}
        maxWidth="md"
        hideBackdrop={true}
        PaperProps={{
          style: {
            width: "100%",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle>Create new freight quote</DialogTitle>
        <DialogContent>
          <Card
            sx={{
              "& .MuiTextField-root": { m: 1 },
              paddingBottom: "4px",
              backgroundColor: "hsl(0deg 0% 100%)",
            }}
          >
            <CardHeader title="Add/edit manifest staging" />
            <CardContent sx={{ paddingTop: "16px", paddingLeft: "16px" }}>
              <Grid2 container spacing={1} size={12}>
                <Grid2 size={6}>
                  <FormLabel htmlFor="valid_from">Valid from</FormLabel>
                  <TextField
                    id="valid_from"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    type="date"
                    color={errors.valid_from ? "error" : "primary"}
                    error={!!errors.valid_from}
                    helperText={errors.valid_from || ""}
                    value={manifestStaging.valid_from}
                    onChange={(event) => handleChange(event, "string")}
                  />
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel htmlFor="valid_to">Valid to</FormLabel>
                  <TextField
                    id="valid_to"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    type="date"
                    color={errors.valid_to ? "error" : "primary"}
                    error={!!errors.valid_to}
                    helperText={errors.valid_to || ""}
                    value={manifestStaging.valid_to}
                    onChange={(event) => handleChange(event, "string")}
                  />
                </Grid2>

                <Grid2 size={6}>
                  <InputLabel htmlFor="liner_id">Liner name</InputLabel>
                  <FormControl variant="outlined" style={{ width: "100%" }}>
                    <Select
                      labelId="liner_id"
                      id="liner_id"
                      value={vessels.liner_id}
                      name="liner_id"
                      label={vessels.name}
                      onChange={(event) => handleChange(event, "string")}
                      variant="outlined"
                      size="small"
                    >
                      {linerOptions &&
                        linerOptions.map((option: any, index: number) => {
                          return (
                            <MenuItem key={index} value={option.liner_id}>
                              {option.name}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel id="size">Size</FormLabel>
                  <Select
                    id="size"
                    labelId="size"
                    name="size"
                    value={manifestStaging.size}
                    onChange={handleSelectChange}
                    label="Select an option"
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ ml: 1 }}
                  >
                    {sizeOptions &&
                      sizeOptions.map((option, index: number) => {
                        return (
                          <MenuItem key={index} value={option.id}>
                            {option.label}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel htmlFor="Rate">Price</FormLabel>
                  <TextField
                    id="price"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="100"
                    color={errors.rate ? "error" : "primary"}
                    error={!!errors.rate}
                    helperText={errors.rate || ""}
                    value={manifestStaging.rate}
                    onChange={(event) => {
                      const value = parseFloat(event.target.value);
                      setManifestStaging({
                        ...manifestStaging,
                        rate: isNaN(value) ? 0 : value,
                      });
                    }}
                  />
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel htmlFor="port_of_trans_shipment">
                    Port of destination
                  </FormLabel>
                  <Autocomplete
                    id="port_of_trans_shipment"
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="Type port"
                      />
                    )}
                    options={port}
                    getOptionLabel={(option) => option.name}
                    getOptionKey={(option) => option.port_id ?? 0}
                    value={manifestStaging.port_of_trans_shipment}
                    onChange={(event, newValue) =>
                      handleAutoCompleteChange(event, newValue)
                    }
                    onInputChange={(event, newInputValue, reason) =>
                      getPorts(event, reason)
                    }
                  />
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel htmlFor="port_of_destinaton">
                    Port of destination
                  </FormLabel>
                  <Autocomplete
                    id="port_of_destination"
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="Type port"
                      />
                    )}
                    options={port}
                    getOptionLabel={(option) => option.name}
                    getOptionKey={(option) => option.port_id ?? 0}
                    value={manifestStaging.port_of_destination}
                    onChange={(event, newValue) =>
                      handleAutoCompleteChange(event, newValue)
                    }
                    onInputChange={(event, newInputValue, reason) =>
                      getPorts(event, reason)
                    }
                  />
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel id="currency">Currency</FormLabel>
                  <Select
                    id="currency"
                    labelId="currency"
                    name="currency"
                    value={manifestStaging.currency}
                    onChange={handleSelectChange}
                    label="Select an option"
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ ml: 1 }}
                  >
                    {currencyOptions &&
                      currencyOptions.map((option, index: number) => {
                        return (
                          <MenuItem key={index} value={option.id}>
                            {option.label}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel id="third_party">Third parties</FormLabel>
                  <Select
                    id="third_party"
                    labelId="third_party"
                    name="third_party"
                    value={manifestStaging.third_party}
                    onChange={handleSelectChange}
                    label="Select an option"
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ ml: 1 }}
                  >
                    {thirdPartiesOptions &&
                      thirdPartiesOptions.map((option, index: number) => {
                        return (
                          <MenuItem key={index} value={option.id}>
                            {option.label}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "8px",
          }}
        >
          <div style={{ paddingTop: "3px" }}>
            <Button onClick={() => handlePopOverClose()}>Close</Button>
            <Button type="submit" onClick={handleAddShipmentManifestStaging}>
              Save manifest staging
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      {openImportEl && (
        <ImportFile open={openImportEl} onClose={onCloseImportEL} />
      )}

      <DataTable
        columns={columns}
        redirectTo=""
        handleFetchData={handleFetchData}
        primaryKey="staging_id"
        buttonList={actions}
        hiddenColumns={hiddenColumns}
        reloadData={reloadData}
        setReloadData={setReloadData}
      />
      {openSnackBar && (
        <Snackbar
          open={openSnackBar}
          autoHideDuration={5000}
          onClose={handleCloseSnackBar}
        >
          <Alert
            onClose={handleCloseSnackBar}
            severity={snackMessage.severity}
            variant="filled"
          >
            {snackMessage.message}
          </Alert>
        </Snackbar>
      )}
    </ThemeProvider>
  );
};

export default FreightQuoteStagingList;
