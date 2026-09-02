import {
  Alert,
  Autocomplete,
  Button,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  Snackbar,
  SnackbarCloseReason,
  TextField,
  ThemeProvider,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import ContainerLines from "../../components/shipments/ContainerLines";
import { HblFormModel, PersonCountry } from "../../types/ShipmentTypes";
import { fetchPersonOptions } from "../../store/shipment/shipment";
import { useAppDispatch } from "../../store/store";
import { FilterItem, ListFilter } from "../../types/table";
import ListConstants from "../../composables/constants/table";
import { useParams } from "react-router-dom";
import {
  addShipmentHbl,
  getShipmentHbl,
  getShipmentHblList,
  updateShipmentHbl,
} from "../../composables/shippings/Hbls";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import { validateForm } from "../../composables/product/FormValidation";
import { z } from "zod";
import { AxiosResponse } from "axios";
import { ShipmentHblModel } from "../../types/request";
import CardTitle from "../../components/global/Card/CardTitle";
import { UpdateShipmentModel } from "../../types/updateRequest";
import { useNavigate } from "react-router-dom";

interface hblProps {
  pShipmentId?: number;
  onSave: () => Promise<void>;
  clone?: boolean;
  setClone: React.Dispatch<React.SetStateAction<boolean>>;
  shipmentHblId?: string;
}

const HblForm: React.FC<hblProps> = ({
  pShipmentId,
  onSave,
  clone,
  shipmentHblId,
  setClone,
}) => {
  const movementsOptions = [
    {
      id: "fcl",
      label: "FCL",
    },
    {
      id: "lcl",
      label: "LCL",
    },
    {
      id: "cld",
      label: "CLD",
    },
  ];

  const blankItem: HblFormModel = {
    delivery_agent: null,
    movement_type: movementsOptions[0].id,
    shipper: null,
    transact_amount: 0,
    transact_note_ref: "",
    shipment_id: 0,
    hbl_no: "",
    consignee_id: 0,
    first_name: "",
    last_name: "",
    consignee: null,
    unstuffing_place: "",
    notify_party1: null,
    notify_party2: null,
  };
  const [errors, setErrors] = useState<Record<string, any>>({
    hbl_no: "",
    consignee: "",
    delivery_agent: "",
    movement_type: "",
  });
  const urlParams = useParams();
  const shipmentId =
    pShipmentId ??
    (urlParams.shipmentId ? parseInt(urlParams.shipmentId, 10) : undefined);
  const [reloadContainerLines, setReloadContainerLines] =
    useState<boolean>(false);
  const navigate = useNavigate();

  const formSchema = z.object({
    hbl_no: z.string().min(3, "The hbl no is required"),
    movement_type: z.string().min(3, "The movement type is required"),
    consignee: z
      .object({
        person_id: z.number().min(1, "Consignee is required"),
        first_name: z.string().min(1, "Consignee is required"),
      })
      .nullable()
      .refine(
        (data) => {
          return !(!data || !data.person_id || data.person_id === 0);
        },
        {
          message: "Consignee is required",
          path: ["person_id"],
        },
      ),
    delivery_agent: z
      .object({
        person_id: z.number().min(1, "Delivery agent is required"),
        first_name: z.string().min(1, "Delivery agent  is required"),
      })
      .nullable()
      .refine(
        (data) => {
          return !(!data || !data.person_id || data.person_id === 0);
        },
        {
          message: "Delivery agent is required",
          path: ["person_id"],
        },
      ),
  });

  const dispatch = useAppDispatch();

  const [shipmentHbl, setShipmentHbl] = useState<HblFormModel>(blankItem);
  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [allPersonList, setAllPersonList] = React.useState<PersonCountry[]>([]);
  const [supplierList, setSupplierList] = React.useState<PersonCountry[]>([]);
  const [consigneeList, setConsigneeList] = React.useState<PersonCountry[]>([]);
  const [_hblRecords, setHblRecords] = React.useState<HblFormModel[]>([]);
  const customTheme = createTheme(getTheme());
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const intHblId = 0;

  const handleAutoCompleteChange = async (
    _event: React.SyntheticEvent,
    newValue: any,
    field: string,
  ) => {
    setShipmentHbl((prevShipment) => ({
      ...prevShipment,
      [field]: newValue,
    }));

    if (field === "delivery_agent") {
      setShipmentHbl((prevShipment) => ({
        ...prevShipment,
        transact_agent: newValue,
      }));
    }
  };

  const findFromAllPersons = async (
    _event: React.SyntheticEvent,
    newValue: any,
  ) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(async () => {
      await getPersonsOptions(true, newValue);
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

  const handleChange = async (event: any) => {
    const { id, value } = event.target;
    setShipmentHbl((prevShipmentHbl) => ({
      ...prevShipmentHbl,
      [id]: value,
    }));
  };

  const fetchShipmentHblList = async () => {
    if (shipmentId && shipmentId !== 0) {
      const filterItem: FilterItem = {
        field: "shipment_id",
        value: shipmentId,
        operator: ListConstants.EQUALS,
        logicOperator: "and",
      };

      const filter: ListFilter = {
        limit: 0,
        offset: 0,
        filter: [filterItem],
        sort: [
          {
            field: `shipment_hbl_id`,
            sort: "asc",
          },
        ],
      };

      const result = await getShipmentHblList(filter);

      setHblRecords(result.data.data);
    }
  };

  const fetchShipmentHblById = async (cloneRecord: boolean) => {
    if (!shipmentHblId) return;

    const result = await getShipmentHbl(shipmentHblId);

    if (!result || !shipmentId) {
      return;
    }

    const hblFormResult: HblFormModel = result.data.ShipmentHbl;

    setShipmentHbl({
      shipment_hbl_id: intHblId ?? 0,
      delivery_agent: hblFormResult.delivery_agent,
      movement_type: hblFormResult.movement_type ?? movementsOptions[0].id,
      shipper: hblFormResult.shipper,
      hbl_no: hblFormResult.hbl_no,
      transact_amount: hblFormResult.transact_amount,
      transact_note_ref: hblFormResult.transact_note_ref,
      shipment_id: shipmentId,
      consignee_id: hblFormResult.consignee_id,
      first_name: hblFormResult.first_name,
      last_name: hblFormResult.last_name,
      consignee: hblFormResult.consignee,
      unstuffing_place: hblFormResult.unstuffing_place,
      notify_party1: hblFormResult.notify_party1,
      notify_party2: hblFormResult.notify_party2,
    });

    if (!cloneRecord) {
      setShipmentHbl((prevShipmentHbl) => ({
        ...prevShipmentHbl,
        hbl_no: hblFormResult.hbl_no,
      }));
    }
  };

  const saveHbl = async (event: any) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    let result: AxiosResponse<any, any> | undefined = undefined;

    const isValid = validateForm(formSchema, shipmentHbl, setErrors);

    if (!isValid || !shipmentId) {
      return;
    }

    shipmentHbl.consignee_id = shipmentHbl.consignee?.person_id as number;

    const shipmentHblRecord: ShipmentHblModel = {
      shipment_id: shipmentId,
      hbl_no: shipmentHbl.hbl_no ?? "",
      first_name: shipmentHbl.consignee?.first_name ?? "",
      last_name: shipmentHbl.consignee?.last_name ?? "",
      movement_type: shipmentHbl.movement_type,
      delivery_agent_id: shipmentHbl.delivery_agent?.person_id ?? 0,
      shipper_id: shipmentHbl.shipper?.person_id ?? 0,
      consignee_id: shipmentHbl.consignee?.person_id ?? 0,
      unstuffing_place: shipmentHbl.unstuffing_place,
      notify_party_id1: shipmentHbl.notify_party1?.person_id ?? 0,
      notify_party_id2: shipmentHbl.notify_party2?.person_id ?? 0,
      deleted: false,
    };

    if (clone) {
      delete shipmentHbl.shipment_hbl_id;
      setClone(false);
    }

    if (shipmentHbl.shipment_hbl_id) {
      shipmentHblRecord.shipment_hbl_id = shipmentHbl.shipment_hbl_id;

      const updateHblRecord: UpdateShipmentModel = {
        shipment_id: shipmentId,
        hbl_no: shipmentHbl.hbl_no ?? "",
        first_name: shipmentHbl.consignee?.first_name ?? "",
        last_name: shipmentHbl.consignee?.last_name ?? "",
        movement_type: shipmentHbl.movement_type,
        delivery_agent_id: shipmentHbl.delivery_agent?.person_id ?? 0,
        shipper_id: shipmentHbl.shipper?.person_id ?? 0,
        consignee_id: shipmentHbl.consignee?.person_id ?? 0,
        unstuffing_place: shipmentHbl.unstuffing_place,
        notify_party_id1: shipmentHbl.notify_party1?.person_id ?? 0,
        notify_party_id2: shipmentHbl.notify_party2?.person_id ?? 0,
        deleted: false,
      };
      result = await updateShipmentHbl(updateHblRecord);
    } else {
      if ("shipment_hbl_id" in shipmentHbl) {
        delete shipmentHbl.shipment_hbl_id;
      }
      result = await addShipmentHbl(shipmentHblRecord);
      navigate(`/hbl/${shipmentId}/${result.data.data}`);
    }

    if (!result) return;

    if (result.status) {
      if (result.status === 200) {
        setSnackMessage({
          message: `Hbl saved successfully`,
          severity: "success",
        });
      } else if (result.status === 204) {
        setSnackMessage({
          message: `Hbl updated successfully`,
          severity: "success",
        });
      }
      await onSave();
      setOpenSnackBar(true);
    } else {
      setSnackMessage({
        message: `Error while saving hbl`,
        severity: "error",
      });
      setOpenSnackBar(true);
    }
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

  const handleSelectChange = async (event: any) => {
    const { name, value } = event.target;
    setShipmentHbl((prevShipment) => ({
      ...prevShipment,
      [name]: value,
    }));
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchShipmentHblList();
        await getPersonsOptions(false, "");
      } catch (error) {
        console.log("Error getting hbl list", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (shipmentHblId || clone) {
      (async () => {
        try {
          await fetchShipmentHblById(true);
        } catch (error) {
          console.log("Error getting shipment hbl", error);
        }
      })();
    }
  }, [shipmentHblId]);

  return (
    <ThemeProvider theme={customTheme}>
      <div
        style={{
          backgroundColor: "hsl(0deg 0% 100%)",
          padding: "16px",
        }}
      >
        <CardTitle>
          {shipmentHblId ? shipmentHbl.hbl_no : "Adding new hbl"}
        </CardTitle>
        <div style={{ paddingTop: "16px", paddingLeft: "16px" }}>
          <Grid container spacing={2}>
            <Grid size={5}>
              <FormLabel htmlFor="hbl_no">Hbl no</FormLabel>
              <TextField
                id="hbl_no"
                autoFocus
                size="small"
                fullWidth
                required
                color={errors.hbl_no ? "error" : "primary"}
                error={!!errors.hbl_no}
                helperText={errors.hbl_no || ""}
                value={shipmentHbl.hbl_no}
                onChange={handleChange}
                slotProps={{
                  htmlInput: {
                    maxLength: 20,
                  },
                }}
              />
            </Grid>
            <Grid size={5}>
              <FormLabel htmlFor="movement_type">Movement type</FormLabel>
              <Select
                id="movement_type"
                labelId="movement_type"
                value={shipmentHbl.movement_type}
                onChange={handleSelectChange}
                name="movement_type"
                size="small"
                fullWidth
              >
                {movementsOptions &&
                  movementsOptions.map((option: any, index: number) => {
                    return (
                      <MenuItem key={index} value={option.id}>
                        {option.label}
                      </MenuItem>
                    );
                  })}
              </Select>
            </Grid>
            <Grid size={2}></Grid>

            <Grid size={5}>
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
                value={shipmentHbl.shipper}
                onChange={(event, newValue) =>
                  handleAutoCompleteChange(event, newValue, "shipper")
                }
              />
            </Grid>
            <Grid size={5}>
              <FormLabel htmlFor="delivery_agent">Delivery agent</FormLabel>
              <Autocomplete
                id="delivery_agent1"
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="standard"
                    placeholder="Which agent to deliver to"
                  />
                )}
                options={allPersonList}
                getOptionLabel={(option) =>
                  `${option.first_name} ${option.last_name}`
                }
                getOptionKey={(option) => option.person_id}
                value={shipmentHbl.delivery_agent}
                onChange={(event, newValue) =>
                  handleAutoCompleteChange(event, newValue, "delivery_agent")
                }
                onInputChange={(event, newInputValue) =>
                  findFromAllPersons(event, newInputValue)
                }
              />
              {errors.delivery_agent && <span>{errors.delivery_agent}</span>}
            </Grid>
            <Grid size={2}></Grid>

            <Grid size={5}>
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
                value={shipmentHbl.consignee}
                onChange={(event, newValue) =>
                  handleAutoCompleteChange(event, newValue, "consignee")
                }
              />
              {errors.consignee && <span>{errors.consignee}</span>}
            </Grid>

            <Grid size={5}>
              <FormLabel htmlFor="unstuffing_place">Unstuffing place</FormLabel>
              <TextField
                id="unstuffing_place"
                autoFocus
                size="small"
                fullWidth
                required
                onChange={handleChange}
                value={shipmentHbl.unstuffing_place}
                slotProps={{
                  htmlInput: {
                    maxLength: 30,
                  },
                }}
              />
            </Grid>

            <Grid size={5}>
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
                value={shipmentHbl.notify_party1}
                onChange={(event, newValue) =>
                  handleAutoCompleteChange(event, newValue, "notify_party1")
                }
              />
            </Grid>
            <Grid size={5}>
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
                value={shipmentHbl.notify_party2}
                onChange={(event, newValue) =>
                  handleAutoCompleteChange(event, newValue, "notify_party2")
                }
              />
            </Grid>
            <Grid size={2} />

            <Grid size={10} sx={{ pt: 2, mb: 3 }}>
              {shipmentHblId && !clone && (
                <ContainerLines
                  shipmentHblId={shipmentHblId}
                  reloadData={reloadContainerLines}
                  setReloadData={setReloadContainerLines}
                />
              )}
            </Grid>
            <Grid size={2} />
          </Grid>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "8px",
          }}
        >
          <Grid>
            <Button type="submit" onClick={saveHbl}>
              Save Hbl
            </Button>
          </Grid>
        </div>
      </div>
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

export default HblForm;
