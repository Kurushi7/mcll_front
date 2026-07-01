import {
  Alert,
  Autocomplete,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  ThemeProvider,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { FilterItem, ListFilter } from "../../types/table";
import ListConstants from "../../composables/constants/table";
import { GridSortModel } from "@mui/x-data-grid";
import {
  PortModel,
  Vessels,
  ShipmentVesselsModel,
  LinersModel,
  ShipmentModel, ShipmentProcessModel,
} from "../../types/request";
import { getPortList } from "../../composables/persons/Ports";
import {
  getShipmentVesselList,
  getVesselList,
} from "../../composables/shippings/ShipmentVessel";
import ShipmentVessels from "../../components/shipments/ShipmentVessels";
import { getLinerList } from "../../composables/shippings/Liners";
import { PersonCountry, ShipmentFormModel } from "../../types/ShipmentTypes";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import { fetchPersonOptions } from "../../store/shipment/shipment";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "../../store/store";
import {
  addShipment,
  getShipment,
  updateShipment,
} from "../../composables/shippings/Shipments";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosResponse } from "axios";
import InvoiceList from "./invoiceList";
import ContainerLines from "../../components/shipments/ContainerLines";
import {addShipmentProcess} from "../../composables/processFlow/processFlow.tsx";

const ShipmentInfo = () => {
  const [consigneeList, setConsigneeList] = React.useState<PersonCountry[]>([]);
  const [_allPersonList, setAllPersonList] = React.useState<PersonCountry[]>([]);
  const [linerOptions, setLinerOptions] = React.useState<LinersModel[]>([]);
  const [portOfLoadingList, setPortOfLoadingList] = React.useState<PortModel[]>(
    [],
  );
  const customTheme = createTheme(getTheme());
  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const { id } = useParams<{ id?: string }>();
  const [shipmentId, setShipmentId] = React.useState<number>();
  const navigate = useNavigate();

  const [_shipmentVessels, setShippingVessels] = React.useState<
    ShipmentVesselsModel[] | undefined | null
  >([]);
  const [supplierList, setSupplierList] = React.useState<PersonCountry[]>([]);
  const user_id = useSelector((state: RootState) => state.user.user_id);
  const group = useSelector((state: RootState) => state.user.group);

  const [vesselOptions, setVesselOptions] = React.useState<Vessels[]>([]);
  const [portOfUnloadingList, setPortOfUnloadingList] = React.useState<
    PortModel[]
  >([]);
  const [showContinue, setShowContinue] = React.useState(!!shipmentId);

  const [newShipment, setNewShipment] = useState<ShipmentFormModel>({
    file_ref: "",
    eta: new Date().toISOString().split("T")[0],
    shipment_id: shipmentId,
    port_of_loading: null,
    consignee: null,
    notify_party1: null,
    notify_party2: null,
    port_of_unloading: null,
    liner_id: 0,
    master_bl_ref: "",
    etd: new Date().toISOString().split("T")[0],
    user_id: user_id ?? 0,
    group: group ?? "",
    shipper: null,
    remarks: "",
  });
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const dispatch = useAppDispatch();
  const [reloadContainerLines, setReloadContainerLines] =
    useState<boolean>(false);

  const [errors, _setErrors] = useState<Record<string, any>>({
    hbl_no: 0,
    shipper_id: "",
    consignee_id: "",
    voyage_no: "",
  });

  const getPortOptions = async (type: string, name: string) => {
    const filterItem: FilterItem[] = [
      {
        field: "type",
        value: type,
        operator: ListConstants.EQUALS,
        logicOperator: "and",
      },
      {
        field: "name",
        value: name,
        operator: ListConstants.CONTAINS,
        logicOperator: "and",
      },
    ];

    const sortItem: GridSortModel = [
      {
        field: "port_id",
        sort: "desc",
      },
    ];

    const filters: ListFilter = {
      limit: 0,
      offset: 0,
      filter: filterItem,
      sort: sortItem,
    };

    const result = await getPortList(filters);
    if (!result || !result.data) {
      return;
    }

    if (type === "loading") {
      setPortOfLoadingList(result.data.data);
    } else if (type === "unloading") {
      setPortOfUnloadingList(result.data.data);
    }
  };

  const getPortsListDebounced = async (
    event: any,
    type: string,
    _newInputValue: any,
    reason: string,
  ) => {
    if (!event) return;

    if (reason !== "input") return;

    const name = event.target.value;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(async () => {
      await getPortOptions(type, name);
    }, 500);

    setTimeoutId(newTimeoutId);
  };

  const getPersonsOptions = async (allPerson: boolean, term: string) => {
    const result = await dispatch(fetchPersonOptions({ allPerson, term }));

    if (fetchPersonOptions.fulfilled.match(result)) {
      if (!result.payload && result.payload !== null) {
        return;
      }

      const personOptions = result.payload as PersonCountry[];

      if (allPerson) {
        setAllPersonList(personOptions);
        return;
      }

      const tempSupplierList: PersonCountry[] = [];
      const tempConsigneeList: PersonCountry[] = [];
      personOptions.forEach((person: PersonCountry) => {
        if (person.type === "supplier") {
          tempSupplierList.push(person);
        } else if (person.type === "consignee") {
          tempConsigneeList.push(person);
        }
      });
      setSupplierList(tempSupplierList);
      setConsigneeList(tempConsigneeList);
    }
  };

  const getLinerOptions = async () => {
    const sortItem: GridSortModel = [
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
    newShipment.liner_id =
      newShipment.liner_id && newShipment.liner_id !== 0
        ? newShipment.liner_id
        : result.data.data[0].liner_id;
  };

  const fetchVessels = async () => {
    const filters: ListFilter = {
      limit: 0,
      offset: 0,
      filter: [],
      sort: [],
    };

    const result = await getVesselList(filters);

    if (!result) {
      return;
    }

    setVesselOptions(result.data.data);
  };

  const getShipmentVessels = async (filter: ListFilter) => {
    const filterItem: FilterItem = {
      field: "shipment_id",
      value: shipmentId,
      operator: ListConstants.EQUALS,
      logicOperator: "and",
    };

    const isDuplicate = filter.filter.some(
      (item) =>
        item.value === filterItem.value &&
        item.field === filterItem.field &&
        item.operator === filterItem.operator,
    );

    if (!isDuplicate) {
      filter.filter.push(filterItem);
    }

    const sortItem: GridSortModel = [
      {
        field: "shipment_id",
        sort: "desc",
      },
    ];

    const filters: ListFilter = {
      limit: 0,
      offset: 0,
      filter: [filterItem],
      sort: sortItem,
    };

    const result = await getShipmentVesselList(filters);

    if (!result) {
      return;
    }

    setShippingVessels(result.data.data);
  };

  const handleChange = async (event: any) => {
    const { id, value } = event.target;
    setNewShipment((prevShipment) => ({
      ...prevShipment,
      [id]: value,
    }));
  };

  const handleSelectChange = async (event: any) => {
    const { name, value } = event.target;
    setNewShipment((prevShipment) => ({
      ...prevShipment,
      [name]: value,
    }));
  };

  const handleAutoCompleteChange = async (
    _event: React.SyntheticEvent,
    newValue: any,
    field: string,
  ) => {
    setNewShipment((prevShipment) => ({
      ...prevShipment,
      [field]: newValue,
    }));

    if (field === "consignee") {
      setNewShipment((prevShipment) => ({
        ...prevShipment,
        notify_party1: newValue,
      }));
    }
  };

  const continueToHbls = () => {
    navigate(`/hbl/${shipmentId}`);
  };

  const saveShipmentProcess= async (shipmentId: number) => {
    const ShipmentFlow: ShipmentProcessModel = {
      shipment_id: shipmentId,
      client_identification: "pending",
      booking_instructions: "pending",
      document_entries: "pending",
      tracking: "pending",
      custom_clearance: "pending",
      delivery_haulage: "pending",
      billing_debtors: "pending",
      documents: ""
    }

    const result = await addShipmentProcess(ShipmentFlow);
    if (!result) return;

    if (result.status && result.status !== 200) {
      setSnackMessage({
        message: "Problem saving shipment process",
        severity: "error",
      });
      setOpenSnackBar(true);
      return;
    }
  }

  const executeSaveMbl = async () => {
    const shipmentModel: ShipmentModel = {
      consignee_id: newShipment.consignee?.person_id ?? 0,
      notify_party_id1: newShipment.notify_party1?.person_id ?? 0,
      notify_party_id2: newShipment.notify_party2?.person_id,
      liner_id: newShipment.liner_id,
      master_bl_ref: newShipment.master_bl_ref,
      file_ref: "",
      port_of_loading_id: newShipment.port_of_loading?.port_id ?? 0,
      port_of_unloading_id: newShipment.port_of_unloading?.port_id ?? 0,
      eta: new Date(newShipment.eta).toISOString(),
      etd: new Date(newShipment.etd).toISOString(),
      user_id: user_id ?? 0,
      group: group ?? "",
    };

    let result: AxiosResponse<any, any>;

    if (shipmentId) {
      shipmentModel.shipment_id = shipmentId;
      result = await updateShipment(shipmentModel);

      if (result.status && result.status !== 204) {
        setSnackMessage({
          message: "Problem updating shipment",
          severity: "error",
        });
        setOpenSnackBar(true);
        return;
      }
    } else {
      result = await addShipment(shipmentModel);
      if (!result) return;

      if (result.status && result.status !== 200) {
        setSnackMessage({
          message: "Problem saving shipment",
          severity: "error",
        });
        setOpenSnackBar(true);
        return;
      }
      shipmentModel.shipment_id = result.data.data;

      await saveShipmentProcess(result.data.data)
      setShipmentId(result.data.data);
    }

    setShowContinue(true);
  };

  const handleClose = (
    _event: React.SyntheticEvent<any> | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  const fetchShipmentRecord = async (intShipmentId: number) => {
    if (!intShipmentId) return;

    const result = await getShipment(intShipmentId);

    if (!result) return;

    const shipment: ShipmentFormModel = result.data.Shipment;

    setNewShipment({
      shipment_id: intShipmentId,
      eta: shipment.eta.split("T")[0] ?? new Date().toISOString().split("T")[0],
      file_ref: "",
      port_of_loading: shipment.port_of_loading,
      consignee: shipment.consignee,
      notify_party1: shipment.notify_party1,
      notify_party2: shipment.notify_party2,
      port_of_unloading: shipment.port_of_unloading,
      liner_id: shipment.liner_id,
      master_bl_ref: shipment.master_bl_ref,
      etd: shipment.etd.split("T")[0] ?? new Date().toISOString().split("T")[0],
      user_id: user_id ?? 0,
      group: group ?? "",
      shipper: shipment.shipper ?? null,
      remarks: shipment.remarks ?? "",
    });
  };

  useEffect(() => {
    (async () => {
      try {
        await getPersonsOptions(false, "");
      } catch (error: any) {
        console.log("Error getting agent list", error.response.data);
      }
    })();

    (async () => {
      try {
        await getLinerOptions();
        await fetchVessels();
      } catch (error) {
        console.log("Error getting agent list", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }

    const intShipmentId = parseInt(id, 10);
    setShipmentId(intShipmentId);

    const filters: ListFilter = {
      limit: 0,
      offset: 0,
      filter: [],
      sort: [],
    };

    (async () => {
      try {
        await getShipmentVessels(filters);
        await fetchShipmentRecord(intShipmentId);
      } catch (error) {
        console.log("Error getting agent list", error);
      }
    })();
  }, [id, user_id]);

  return (
    <ThemeProvider theme={customTheme}>
      <Card
        sx={{
          "& .MuiTextField-root": { m: 1 },
          paddingBottom: "4px",
          backgroundColor: "hsl(0deg 0% 100%)",
        }}
      >
        <CardHeader title="Fill shipping info" />
        <CardContent sx={{ paddingTop: "16px", paddingLeft: "16px" }}>
          <Grid container spacing={1} size={12}>
            <Grid size={3}>
              <FormLabel htmlFor="master_bl_ref">Master BL</FormLabel>
              <TextField
                id="master_bl_ref"
                autoFocus
                size="small"
                fullWidth
                required
                color={errors.master_bl_ref ? "error" : "primary"}
                error={!!errors.master_bl_ref}
                helperText={errors.master_bl_ref || ""}
                value={newShipment.master_bl_ref}
                onChange={handleChange}
                slotProps={{
                  htmlInput: {
                    maxLength: 20,
                  },
                }}
              />
            </Grid>
            <Grid size={3}>
              <FormLabel htmlFor="liner_id">Liner</FormLabel>
              {linerOptions && linerOptions.length > 0 && (
                <Select
                  id="liner_id"
                  size="small"
                  value={
                    newShipment.liner_id === 0
                      ? linerOptions[0].liner_id
                      : newShipment.liner_id
                  }
                  onChange={handleSelectChange}
                  name="liner_id"
                  fullWidth
                  sx={{ ml: 1, mt: 1 }}
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
              )}
            </Grid>
            <Grid size={3}>
              <FormLabel htmlFor="consignee">Consignee</FormLabel>
              <Autocomplete
                id="consignee"
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="Type a consignee name"
                  />
                )}
                options={consigneeList}
                getOptionLabel={(option) =>
                  `${option.first_name} ${option.last_name}`
                }
                getOptionKey={(option) => option.person_id}
                value={newShipment.consignee}
                onChange={(event, newValue) =>
                  handleAutoCompleteChange(event, newValue, "consignee")
                }
              />
            </Grid>
            <Grid size={3} />

            <Grid size={3}>
              <FormLabel htmlFor="notify_party1">Notify party 1</FormLabel>
              <Autocomplete
                id="notify_party1"
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="Which party to notify"
                  />
                )}
                options={consigneeList}
                getOptionLabel={(option) =>
                  `${option.first_name} ${option.last_name}`
                }
                getOptionKey={(option) => option.person_id}
                value={newShipment.notify_party1}
                onChange={(event, newValue) =>
                  handleAutoCompleteChange(event, newValue, "notify_party1")
                }
              />
            </Grid>
            <Grid size={3}>
              <FormLabel htmlFor="notify_party2">Notify party 2</FormLabel>
              <Autocomplete
                id="notify_party2"
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="Which party to notify"
                  />
                )}
                options={consigneeList}
                getOptionLabel={(option) =>
                  `${option.first_name} ${option.last_name}`
                }
                getOptionKey={(option) => option.person_id}
                value={newShipment.notify_party2}
                onChange={(event, newValue) =>
                  handleAutoCompleteChange(event, newValue, "notify_party2")
                }
              />
            </Grid>
            <Grid size={3}>
              <FormLabel htmlFor="shipper">Shipper</FormLabel>
              <Autocomplete
                id="shipper"
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="Type a supplier name"
                  />
                )}
                options={supplierList}
                getOptionLabel={(option) =>
                  `${option.first_name} ${option.last_name}`
                }
                getOptionKey={(option) => option.person_id}
                value={newShipment.shipper}
                onChange={(event, newValue) =>
                  handleAutoCompleteChange(event, newValue, "shipper")
                }
              />
            </Grid>
            <Grid size={3} />

            <Grid size={3}>
              <FormLabel htmlFor="port_of_loading">Port of loading</FormLabel>
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
                value={newShipment.port_of_loading}
                onChange={(event, newValue) =>
                  handleAutoCompleteChange(event, newValue, "port_of_loading")
                }
                onInputChange={(event, newInputValue, reason) =>
                  getPortsListDebounced(event, "loading", newInputValue, reason)
                }
              />
            </Grid>
            <Grid size={3}>
              <FormLabel htmlFor="port_of_unloading">
                Port of unloading
              </FormLabel>
              <Autocomplete
                id="port_of_unloading"
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="Type unloading port"
                  />
                )}
                options={portOfUnloadingList}
                getOptionLabel={(option) => option.name}
                getOptionKey={(option) => option.port_id ?? 0}
                value={newShipment.port_of_unloading}
                onChange={(event, newValue) =>
                  handleAutoCompleteChange(event, newValue, "port_of_unloading")
                }
                onInputChange={(event, newInputValue, reason) =>
                  getPortsListDebounced(
                    event,
                    "unloading",
                    newInputValue,
                    reason,
                  )
                }
              />
            </Grid>
            <Grid size={6} />

            <Grid size={3}>
              <FormLabel htmlFor="eta">Eta</FormLabel>
              <TextField
                id="eta"
                autoFocus
                size="small"
                fullWidth
                required
                type="date"
                color={errors.eta ? "error" : "primary"}
                error={!!errors.eta}
                helperText={errors.eta || ""}
                value={newShipment.eta}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={3}>
              <FormLabel htmlFor="etd">Etd</FormLabel>
              <TextField
                id="etd"
                autoFocus
                size="small"
                fullWidth
                required
                type="date"
                color={errors.etd ? "error" : "primary"}
                error={!!errors.etd}
                helperText={errors.etd || ""}
                value={newShipment.etd}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={6} />

            <Grid size={8}>
              <FormLabel htmlFor="remarks">Remarks</FormLabel>
              <TextField
                id="remarks"
                autoFocus
                size="small"
                fullWidth
                value={newShipment.remarks}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={10} sx={{ pt: 2, mb: 2 }}>
              {(showContinue || (shipmentId && shipmentId > 0)) && (
                <ShipmentVessels
                  vesselOptions={vesselOptions}
                  shipmentId={shipmentId ?? 0}
                />
              )}
            </Grid>
            <Grid size={2} />

            <Grid size={10} sx={{ pt: 2, mb: 2 }}>
              {(showContinue || (shipmentId && shipmentId > 0)) && (
                <InvoiceList type="liner" shipmentId={shipmentId} />
              )}
            </Grid>
            <Grid size={2} />

            <Grid size={10} sx={{ pt: 2, mb: 3 }}>
              {(showContinue || shipmentId) && (
                <ContainerLines
                  shipmentId={shipmentId}
                  reloadData={reloadContainerLines}
                  setReloadData={setReloadContainerLines}
                />
              )}
            </Grid>
            <Grid size={2} />

            <Grid size={10} />
          </Grid>
        </CardContent>
        <CardActions
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "8px",
          }}
        >
          <Grid>
            {(showContinue || shipmentId) && (
              <Button type="submit" onClick={continueToHbls}>
                Continue
              </Button>
            )}

            <Button type="submit" onClick={executeSaveMbl}>
              Save
            </Button>
          </Grid>
        </CardActions>
      </Card>
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
    </ThemeProvider>
  );
};

export default ShipmentInfo;
