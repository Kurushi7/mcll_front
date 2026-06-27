import React, { useRef, useState } from "react";
import { ButtonList, Column, FilterItem, ListFilter } from "../../types/table";
import DataTable from "../../components/DataTable";
import {
  Alert,
  Autocomplete,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Grid,
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
  addShipmentLimit,
  getShipmentLimit,
  getShipmentLimitList,
  updateShipmentLimit,
} from "../../composables/manifest/ShipmentLimit";
import {
  LinersModel,
  PortModel,
  ShipmentLimitModel,
} from "../../types/request";
import { GridSortModel } from "@mui/x-data-grid";
import { getPortList } from "../../composables/persons/Ports";

interface VesselsParams {
  vessel_id?: number;
  name: string;
  liner_id: number;
}

const ShipmentLimitsList = () => {
  const [reloadData, setReloadData] = React.useState(false);
  const customTheme = createTheme(getTheme());
  const user_id = useSelector((state: RootState) => state.user.user_id);
  const [_popOverAnchorEl, setPopOverAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const buttonRefs = useRef<any>({});
  const [open, setOpen] = React.useState(false);

  const columns: Column[] = [
    { field: "shipment_limit_id", headerName: "", hidden: true },
    {
      field: "shipment_zone",
      headerName: "Shipment Zone",
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
      field: "country",
      headerName: "Country",
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
      field: "",
      headerName: "Actions",
      type: "action",
      flex: 1,
      renderCell: (params) => <ActionDropdown row={params.row} />,
    },
  ];
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });

  const hiddenColumns = {
    shipment_limit_id: false,
  };

  const handleFetchData = async (filter: ListFilter) => {
    const filterItem: FilterItem = {
      field: "salesman_id",
      value: user_id,
      operator: ListConstants.EQUALS,
      logicOperator: "and",
    };

    filter.filter = [...filter.filter, filterItem];
    return getShipmentLimitList(filter);
  };

  const actions: ButtonList[] = [
    {
      key: "create-shipment-zone",
      handleOnClick: async (event: any) => {
        setPopOverAnchorEl(event.currentTarget);
      },
      label: "Create new shipment zone",
      style: { mt: 2 },
    },
  ];

  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const [_port, setPort] = React.useState<PortModel[]>([]);

  const blankShipmentLimit: ShipmentLimitModel = {
    port_of_loading: null,
    valid_from: new Date().toISOString().split("T")[0],
    valid_to: new Date().toISOString().split("T")[0],
    liner_id: 0,
    third_party: "",
    size: "",
    max_charge: 0,
    currency: "",
  };

  const [portOfLoadingList, _setPortOfLoadingList] = React.useState<PortModel[]>(
    [],
  );

  const [shipmentLimit, setShipmentLimit] =
    React.useState<ShipmentLimitModel>(blankShipmentLimit);

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
        await fetchShipmentLimit(row.shipment_limit_id);
        setPopOverAnchorEl(buttonRefs.current[row.shipment_vessel_id]);
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
          <MenuItem onClick={() => handleAction("edit")}>Edit</MenuItem>
        </Menu>
      </>
    );
  };

  const handlePopOverClose = () => {
    setPopOverAnchorEl(null);
  };

  const handleCloseSnackBar = (
      _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  const [linerOptions, _setLinerOptions] = React.useState<LinersModel[] | null>(
    null,
  );

  const handleSelectChange = async (event: any) => {
    const { name, value } = event.target;
    setShipmentLimit((prevShipmentLimit: any) => ({
      ...prevShipmentLimit,
      [name]: value,
    }));
  };

  const blankVesssel = {
    name: "",
    liner_id: 0,
  };

  const [vessels, _] = useState<VesselsParams>(blankVesssel);

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

  const [errors, _setErrors] = useState<Record<string, string | null>>({
    valid_from: "",
    valid_to: "",
    max_rate: "",
    currency: "",
  });

  const getPortOptions = async () => {
    const sortItem: GridSortModel = [
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

  const fetchShipmentLimit = async (shipment_limit_id: number) => {
    const result = await getShipmentLimit(shipment_limit_id);

    if (!result) return;

    const shipmentLimit: ShipmentLimitModel = result.data.shipmentLimit;

    setShipmentLimit({
      liner_id: shipmentLimit.liner_id,
      port_of_loading: shipmentLimit.port_of_loading,
      shipment_limit_id: shipmentLimit.shipment_limit_id,
      size: shipmentLimit.size,
      third_party: shipmentLimit.third_party,
      valid_from: shipmentLimit.valid_from,
      valid_to: shipmentLimit.valid_to,
      max_charge: shipmentLimit.max_charge,
      currency: shipmentLimit.currency,
    });
  };

  const getPortsListDebounced = async (
    event: any,
    reason: string,
  ) => {
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

  const handleAutoCompleteChange = async (
      _event: React.SyntheticEvent,
    newValue: any,
    field: string,
  ) => {
    setShipmentLimit((prevShipmentLimit: any) => ({
      ...prevShipmentLimit,
      [field]: newValue,
    }));
  };

  const handleAddShipmentLimit = async () => {
    if (!shipmentLimit) return;

    const shipmentLimitRecord: ShipmentLimitModel = {
      ...shipmentLimit,
    };

    let result = null;

    if (
      shipmentLimit.shipment_limit_id &&
      shipmentLimit.shipment_limit_id != 0
    ) {
      shipmentLimitRecord.shipment_limit_id = shipmentLimit.shipment_limit_id;
      result = await updateShipmentLimit(shipmentLimitRecord);
    } else {
      result = await addShipmentLimit(shipmentLimitRecord);
    }

    if (!result) return;

    if (result.status) {
      if (result.status === 200) {
        setSnackMessage({
          message: `Shipment zone saved successfully`,
          severity: "success",
        });
      } else if (result.status === 204) {
        setSnackMessage({
          message: `Shipment zone updated successfully`,
          severity: "success",
        });
      }
      setReloadData(true);
      setOpenSnackBar(true);
    } else {
      setSnackMessage({
        message: `Error while saving shipmentVessel`,
        severity: "error",
      });
      setOpenSnackBar(true);
    }

    setShipmentLimit(blankShipmentLimit);

    handlePopOverClose();
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleChange = async (event: any, type: string) => {
    const { id, value } = event.target;

    const finalValue = type === "float" ? parseFloat(value) : value;
    setShipmentLimit((prevShipmentLimit: any) => ({
      ...prevShipmentLimit,
      [id]: finalValue,
    }));
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Dialog
        open={open}
        onClose={() => onClose()}
        maxWidth="md"
        hideBackdrop={true}
        slotProps={{
          paper: {
            sx: {
              width: "100%",
              maxHeight: "90vh",
            },
          }
        }}
      >
        <>
        <DialogTitle>Add/edit shipment limits</DialogTitle>
        <DialogContent>
          <Card
            sx={{
              "& .MuiTextField-root": { m: 1 },
              paddingBottom: "4px",
              backgroundColor: "hsl(0deg 0% 100%)",
            }}
          >
            <CardContent sx={{ paddingTop: "16px", paddingLeft: "16px" }}>
              <Grid container spacing={1} size={12}>
                <Grid size={6}>
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
                    value={shipmentLimit.valid_from}
                    onChange={(event) => handleChange(event, "string")}
                  />
                </Grid>

                <Grid size={6}>
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
                    value={shipmentLimit.valid_to}
                    onChange={(event) => handleChange(event, "string")}
                  />
                </Grid>

                <Grid size={6}>
                  <FormLabel htmlFor="port_of_loading">
                    Port of loading
                  </FormLabel>
                  <Autocomplete
                    id="port_of_loading"
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="Type port of loading"
                      />
                    )}
                    options={portOfLoadingList}
                    getOptionLabel={(option) => option.name}
                    getOptionKey={(option) => option.port_id ?? 0}
                    value={shipmentLimit.port_of_loading}
                    onChange={(event, newValue) =>
                      handleAutoCompleteChange(
                        event,
                        newValue,
                        "port_of_loading",
                      )
                    }
                    onInputChange={(event, _newInputValue, reason) =>
                      getPortsListDebounced(
                        event,
                        reason,
                      )
                    }
                  />
                </Grid>

                <Grid size={6}>
                  <InputLabel htmlFor="liner_id">Liner name</InputLabel>
                  <FormControl variant="outlined" style={{ width: "100%" }}>
                    <Select
                      labelId="liner_id"
                      id="liner_id"
                      value={vessels.liner_id}
                      name="liner_id"
                      label={vessels.name}
                      onChange={handleSelectChange}
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
                </Grid>

                <Grid size={6}>
                  <FormLabel id="third_party">Third parties</FormLabel>
                  <Select
                    id="third_party"
                    labelId="third_party"
                    name="third_party"
                    value={shipmentLimit.third_party}
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
                </Grid>

                <Grid size={6}>
                  <FormLabel htmlFor="Rate">Price</FormLabel>
                  <TextField
                    id="price"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="100"
                    color={errors.max_charge ? "error" : "primary"}
                    error={!!errors.max_charge}
                    helperText={errors.max_charge || ""}
                    value={shipmentLimit.max_charge}
                    onChange={(event) => {
                      const value = parseFloat(event.target.value);
                      setShipmentLimit({
                        ...shipmentLimit,
                        max_charge: isNaN(value) ? 0 : value,
                      });
                    }}
                  />
                </Grid>

                <Grid size={6}>
                  <FormLabel id="currency">Currency</FormLabel>
                  <Select
                    id="currency"
                    labelId="currency"
                    name="currency"
                    value={shipmentLimit.currency}
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
                </Grid>
              </Grid>
            </CardContent>
            <CardActions
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingTop: "8px",
              }}
            >
              <div style={{ paddingTop: "3px" }}>
                <Button onClick={() => handlePopOverClose()}>Close</Button>
                <Button type="submit" onClick={handleAddShipmentLimit}>
                  Save Shipment Vessel
                </Button>
              </div>
            </CardActions>
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
            <Button type="submit" onClick={handleAddShipmentLimit}>
              Save shipment limit
            </Button>
          </div>
        </DialogActions>
        </>
      </Dialog>
      <DataTable
        columns={columns}
        handleFetchData={handleFetchData}
        primaryKey="shipment_limit_id"
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

export default ShipmentLimitsList;
