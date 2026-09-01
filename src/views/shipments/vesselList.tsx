import React, { useEffect, useRef, useState } from "react";
import { ButtonList, Column, ListFilter } from "../../types/table";
import ListConstants from "../../composables/constants/table";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
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
import SmartButtonOutlinedIcon from "@mui/icons-material/SmartButtonOutlined";
import Popover from "@mui/material/Popover";
import PopupState from "material-ui-popup-state";
import { z } from "zod";
import { LinersModel, VesselModel, Vessels } from "../../types/request";
import { AxiosResponse } from "axios";
import { validateForm } from "../../composables/product/FormValidation";
import {
  addVessel,
  getVessel,
  getVesselList,
  updateVessel,
} from "../../composables/shippings/Vessels";
import DataTable from "../../components/DataTable";
import { getLinerList } from "../../composables/shippings/Liners";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";

interface VesselsParams {
  vessel_id?: number;
  name: string;
  liner_id: number;
}

const VesselList = () => {
  const [reloadData, setReloadData] = React.useState(false);
  const [popOverAnchorEl, setPopOverAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const openAnchor = Boolean(popOverAnchorEl);
  const [linerOptions, setLinerOptions] = React.useState<LinersModel[] | null>(
    null,
  );
  const customTheme = createTheme(getTheme());
  const buttonRefs = useRef<any>({});

  const [errors, setErrors] = useState<Record<string, string | null>>({
    vessel_name: "",
    voyage_no: "",
  });
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });

  const formSchema = z.object({
    name: z.string().min(3, "Vessel name is required"),
  });

  const blankVesssel = {
    name: "",
    liner_id: 0,
  };

  const [vessels, setVessels] = useState<VesselsParams>(blankVesssel);

  const actions: ButtonList[] = [
    {
      key: "add-vessels",
      handleOnClick: (event: any) => {
        setPopOverAnchorEl(event.currentTarget);
      },
      label: "Add vessels",
      style: { mt: 2 },
    },
  ];

  const handleChange = async (event: any) => {
    const { id, value, name } = event.target;

    setVessels((prevVessel) => ({
      ...prevVessel,
      [id ?? name]: value,
    }));
  };

  const fetchVessel = async (vessel_id: number) => {
    const result = await getVessel(vessel_id);

    if (!result) return;

    const vesselRecord: any = result.data.vessel;

    setVessels({
      vessel_id: vesselRecord.vessel_id ?? 0,
      name: vesselRecord.name,
      liner_id: vesselRecord.liner_id,
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
        await fetchVessel(row.vessel_id);
        setPopOverAnchorEl(buttonRefs.current[row.liner_id]);
      }
    };

    return (
      <>
        <IconButton
          ref={(el) => {
            buttonRefs.current[row.liner_id] = el;
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
    { field: "vessel_id", headerName: "", hidden: true },
    { field: "liner_id", headerName: "", hidden: true },
    {
      field: "vessel_name",
      headerName: "Name",
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
      field: "type",
      headerName: "Type",
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

  const fetchLinerList = async () => {
    const filter: ListFilter = {
      limit: 0,
      offset: 0,
      filter: [],
      sort: [],
    };

    const result = await getLinerList(filter);

    if (!result.data) return;

    const data: LinersModel[] = result.data.data;

    setLinerOptions(data);
    if (data[0].liner_id) {
      vessels.liner_id = data[0].liner_id;
    }
  };

  const handleAddVessel = async () => {
    let result: AxiosResponse<any, any> | undefined = undefined;

    const isValid = validateForm(formSchema, vessels, setErrors);

    if (!isValid) {
      return;
    }

    const updatedRow: any = {
      vessel_id: vessels.vessel_id,
      name: vessels.name,
      liner_id: vessels.liner_id,
    };

    if (vessels.vessel_id && vessels.vessel_id !== 0) {
      result = await updateVessel(updatedRow);
    } else {
      result = await addVessel(updatedRow);
    }

    if (!result) return;

    if (result.status) {
      if (result.status === 200) {
        setSnackMessage({
          message: `Vessel saved successfully`,
          severity: "success",
        });
      } else if (result.status === 204) {
        setSnackMessage({
          message: `Vessel updated successfully`,
          severity: "success",
        });
      }
      setReloadData(true);
      setOpenSnackBar(true);
    } else {
      setSnackMessage({
        message: `Error while saving vessel`,
        severity: "error",
      });
      setOpenSnackBar(true);
    }

    setVessels(blankVesssel);
    handlePopOverClose();
  };

  const hiddenColumns = {
    vessel_id: false,
    liner_id: false,
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
    return getVesselList(filter);
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchLinerList();
      } catch (error) {
        setSnackMessage({
          message: "Error fetching data",
          severity: "error",
        });
        setOpenSnackBar(true);
      }
    })();
  }, []);

  return (
    <ThemeProvider theme={customTheme}>
      <PopupState variant="popover" popupId="demo-popup-popover">
        {(popupState) => (
          <div>
            <Popover
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
                <CardHeader title="Add new vessel" />
                <CardContent sx={{ paddingTop: "16px" }}>
                  <Grid container size={12}>
                    <Grid size={12}>
                      <FormLabel htmlFor="name">Vessel name</FormLabel>
                      <TextField
                        id="name"
                        autoFocus
                        size="small"
                        fullWidth
                        required
                        placeholder="Iphonia"
                        color={errors.name ? "error" : "primary"}
                        error={!!errors.name}
                        helperText={errors.name || ""}
                        value={vessels.name}
                        onChange={handleChange}
                        slotProps={{
                          htmlInput: {
                            maxLength: 20,
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={12}>
                      <InputLabel htmlFor="liner_id">Liner name</InputLabel>
                      <FormControl variant="outlined" style={{ width: "100%" }}>
                        <Select
                          labelId="liner_id"
                          id="liner_id"
                          value={vessels.liner_id}
                          name="liner_id"
                          label={vessels.name}
                          onChange={handleChange}
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
                    <Button type="submit" onClick={handleAddVessel}>
                      Save Vessel
                    </Button>
                    <Button onClick={() => handlePopOverClose()}>Close</Button>
                  </Grid>
                </CardActions>
              </Card>
            </Popover>
          </div>
        )}
      </PopupState>
      <DataTable
        columns={columns}
        handleFetchData={handleFetchData}
        primaryKey="vessel_id"
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

export default VesselList;
