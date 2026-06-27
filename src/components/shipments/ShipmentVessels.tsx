import DataTable from "../DataTable";
import React, { useRef, useState } from "react";
import { ButtonList, Column, ListFilter } from "../../types/table";
import ListConstants from "../../composables/constants/table";
import {
  Alert,
  Autocomplete,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  SnackbarCloseReason,
  TextField,
} from "@mui/material";
import SmartButtonOutlinedIcon from "@mui/icons-material/SmartButtonOutlined";
import Popover from "@mui/material/Popover";
import PopupState from "material-ui-popup-state";
import { z } from "zod";
import {
  ShipmentVesselsModel,
  VesselModel,
  Vessels,
} from "../../types/request";
import {
  addShipmentVessels,
  getShipmentVessel,
  getShipmentVesselList,
  updateShipmentVessels,
} from "../../composables/shippings/ShipmentVessel";
import { AxiosResponse } from "axios";
import { validateForm } from "../../composables/product/FormValidation";

interface ShipmentVesselsProps {
  vesselOptions: Vessels[];
  shipmentId: number;
}

interface ShippingVesselsParams {
  shipment_vessel_id?: number;
  shipment_id?: number;
  vessel_id: number;
  vessel_name: string;
  type: string;
  liner_id: number;
  liner_name: string;
  voyage_no: string;
  vessel: VesselModel | null;
}

const ShipmentVessels: React.FC<ShipmentVesselsProps> = ({
  vesselOptions,
  shipmentId,
}) => {
  const [reloadData, setReloadData] = React.useState(false);
  const [popOverAnchorEl, setPopOverAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const openAnchor = Boolean(popOverAnchorEl);
  const buttonRefs = useRef<any>({});

  const [errors, setErrors] = useState<Record<string, string | null>>({
    vessel: "",
    voyage_no: "",
    type: "",
  });
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const [vesselTypeOptions, setVesselTypeOptions] = useState<
    { id: string; label: string }[]
  >([
    { id: "mother", label: "Mother Vessel" },
    { id: "feeder", label: "Feeder vessel" },
    { id: "extra", label: "Extra caller" },
  ]);

  const formSchema = z.object({
    vessel: z
      .object({
        vessel_id: z.number().min(1, "Vessel ID is required"),
        vessel_name: z.string().min(1, "Vessel name is required"), // Ensure that the vessel has a name
      })
      .nullable()
      .refine(
        (data) => {
          return !(
            !data ||
            !data.vessel_name ||
            data.vessel_name.trim().length === 0
          );
          // Return true otherwise
        },
        {
          message: "Vessel name is required",
          path: ["name"], // Validate name
        },
      ),
    voyage_no: z.string().min(1, "voyage_no 1 is required"), // Required field
  });

  const blankShipmentVessels: ShippingVesselsParams = {
    type: "",
    vessel_id: 0,
    vessel_name: "",
    liner_id: 0,
    liner_name: "",
    shipment_id: 0,
    vessel: null,
    voyage_no: "",
  };

  const [shipmentVessels, setShipmentVessels] =
    useState<ShippingVesselsParams>(blankShipmentVessels);

  const actions: ButtonList[] = [
    {
      key: "add-shipment-vessels",
      handleOnClick: (event: any) => {
        setPopOverAnchorEl(event.currentTarget);
      },
      label: "Add shipment vessels",
      style: { mt: 2 },
    },
  ];

  const handleChange = async (event: any) => {
    const { id, value } = event.target;
    setShipmentVessels((prevVessel) => ({
      ...prevVessel,
      [id]: value,
    }));
  };

  const handleSelectChange = async (event: any) => {
    const { name, value } = event.target;
    setShipmentVessels((prevVessel) => ({
      ...prevVessel,
      [name]: value,
    }));
  };

  const fetchShipmentVessel = async (shipment_vessel_id: number) => {
    const result = await getShipmentVessel(shipment_vessel_id);

    if (!result) return;

    const shipmentVesselRecord: ShippingVesselsParams =
      result.data.shipmentVessel;

    const vesselParam: VesselModel = {
      liner_name: shipmentVesselRecord.liner_name,
      type: shipmentVesselRecord.type,
      vessel_id: shipmentVesselRecord.vessel_id,
      vessel_name: shipmentVesselRecord.vessel_name,
      liner_id: shipmentVesselRecord.liner_id,
    };

    setShipmentVessels({
      shipment_vessel_id: shipmentVesselRecord.shipment_vessel_id,
      voyage_no: shipmentVesselRecord.voyage_no,
      liner_id: shipmentVesselRecord.liner_id,
      liner_name: shipmentVesselRecord.liner_name,
      type: shipmentVesselRecord.type,
      vessel_id: shipmentVesselRecord.vessel_id,
      vessel_name: shipmentVesselRecord.vessel_name,
      shipment_id: shipmentVesselRecord.shipment_id,
      vessel: vesselParam,
    });
  };

  const ActionDropdown: React.FC<{ row: any }> = ({ row }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleAction = async (selectedAction: string, event: any) => {
      handleMenuClose();
      if (selectedAction === "edit") {
        await fetchShipmentVessel(row.shipment_vessel_id);
        // setEditVesselId(row.vessel_id);
        setPopOverAnchorEl(buttonRefs.current[row.shipment_vessel_id]);
      }
    };

    return (
      <>
        <IconButton
          ref={(el) => {
            buttonRefs.current[row.shipment_vessel_id] = el;
          }}
          size="small"
          onClick={(event) => handleMenuOpen(event)}
        >
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
          <MenuItem onClick={(event) => handleAction("edit", event)}>
            Edit
          </MenuItem>
        </Menu>
      </>
    );
  };

  const handlePopOverClose = () => {
    setPopOverAnchorEl(null);
  };

  const columns: Column[] = [
    { field: "shipment_vessel_id", headerName: "", hidden: true },
    { field: "shipment_id", headerName: "", hidden: true },
    { field: "vessel_id", headerName: "", hidden: true },
    {
      field: "name",
      headerName: "Vessel name",
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
      field: "voyage_no",
      headerName: "Voyage No",
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
      field: "type",
      headerName: "Vessel type",
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

  const handleAddShippingVessel = async () => {
    let result: AxiosResponse<any, any> | undefined = undefined;

    const isValid = validateForm(formSchema, shipmentVessels, setErrors);

    if (!isValid) {
      return;
    }

    if (!shipmentVessels.vessel) {
      return;
    }

    const updatedRow: ShipmentVesselsModel = {
      vessel_id: shipmentVessels.vessel.vessel_id ?? 0,
      voyage_no: shipmentVessels.voyage_no,
      type: shipmentVessels.type,
      shipment_id: shipmentId,
      name: shipmentVessels.vessel?.vessel_name ?? "",
    };

    if (
      shipmentVessels.shipment_vessel_id &&
      shipmentVessels.shipment_vessel_id !== 0
    ) {
      updatedRow.shipment_vessel_id = shipmentVessels.shipment_vessel_id;
      result = await updateShipmentVessels(updatedRow);
    } else {
      updatedRow.shipment_vessel_id = shipmentVessels.shipment_vessel_id;

      result = await addShipmentVessels(updatedRow);
    }

    if (!result) return;

    if (result.status) {
      if (result.status === 200) {
        setSnackMessage({
          message: `Shipment vessel saved successfully`,
          severity: "success",
        });
      } else if (result.status === 204) {
        setSnackMessage({
          message: `Shipment vessel updated successfully`,
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

    setShipmentVessels(blankShipmentVessels);

    handlePopOverClose();
  };

  const hiddenColumns = {
    shipment_vessel_id: false,
    shipment_id: false,
    vessel_id: false,
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

  const handleFetchData = async (filter: ListFilter) => {
    filter.filter = [
      {
        field: "shipment_id",
        value: shipmentId,
        operator: ListConstants.EQUALS,
        logicOperator: "and",
      },
    ];

    return getShipmentVesselList(filter);
  };

  const handleAutoCompleteChange = async (
    event: React.SyntheticEvent,
    newValue: any,
  ) => {
    setShipmentVessels((prevShipmentVessel) => ({
      ...prevShipmentVessel,
      vessel: newValue,
    }));
  };

  return (
    <>
      <PopupState variant="popover" popupId="demo-popup-popover">
        {(popupState) => (
          <div>
            <Popover
              id="shipment-vessel"
              open={openAnchor}
              anchorEl={popOverAnchorEl}
              onClose={() => setPopOverAnchorEl(null)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <Card
                sx={{
                  "& .MuiTextField-root": { m: 1 },
                  paddingBottom: "4px",
                  backgroundColor: "hsl(0deg 0% 100%)",
                }}
              >
                <CardHeader title="Add new shipment vessel" />
                <CardContent sx={{ paddingTop: "16px", paddingLeft: "16px" }}>
                  <Grid container spacing={1} size={12}>
                    <Grid size={10}>
                      <FormLabel htmlFor="vessel">Vessel name</FormLabel>
                      <Autocomplete
                        id="vessel"
                        size="small"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            placeholder="Type the vessel name"
                          />
                        )}
                        options={vesselOptions}
                        getOptionLabel={(option) => option.vessel_name}
                        getOptionKey={(option) => option.vessel_id ?? 0}
                        value={shipmentVessels.vessel}
                        onChange={(event, newValue) =>
                          handleAutoCompleteChange(event, newValue)
                        }
                      />
                      {errors.vessel && <span>{errors.vessel}</span>}
                    </Grid>
                    <Grid size={2} />

                    <Grid size={10}>
                      <FormLabel htmlFor="voyage_no">Voyage no</FormLabel>
                      <TextField
                        id="voyage_no"
                        autoFocus
                        size="small"
                        fullWidth
                        placeholder="Doe"
                        color={errors.voyage_no ? "error" : "primary"}
                        error={!!errors.voyage_no}
                        helperText={errors.voyage_no || ""}
                        value={shipmentVessels.voyage_no}
                        onChange={handleChange}
                        InputProps={{
                          inputProps: {
                            maxLength: 20,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={2} />

                    <Grid size={10}>
                      <FormControl fullWidth error={!!errors.type}>
                        <FormLabel id="type">Type</FormLabel>
                        <Select
                          id="type"
                          labelId="type"
                          name="type"
                          value={shipmentVessels.type}
                          onChange={handleSelectChange}
                          label="Select an option"
                          variant="outlined"
                          color={errors.type ? "error" : "primary"}
                          error={!!errors.type}
                          size="small"
                          sx={{ pl: 1 }}
                        >
                          {vesselTypeOptions &&
                            vesselTypeOptions.map((option, index) => {
                              return (
                                <MenuItem key={index} value={option.id}>
                                  {option.label}
                                </MenuItem>
                              );
                            })}
                        </Select>
                        <FormHelperText>{errors.type}</FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid size={2} />
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
                    <Button type="submit" onClick={handleAddShippingVessel}>
                      Save Shipment Vessel
                    </Button>
                  </div>
                </CardActions>
              </Card>
            </Popover>
          </div>
        )}
      </PopupState>
      {shipmentId != 0 && (
        <DataTable
          columns={columns}
          handleFetchData={handleFetchData}
          primaryKey="shipment_vessel_id"
          buttonList={actions}
          hiddenColumns={hiddenColumns}
          reloadData={reloadData}
          setReloadData={setReloadData}
        />
      )}

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
    </>
  );
};

export default ShipmentVessels;
