import React, { useEffect, useRef, useState } from "react";
import { ButtonList, Column, FilterItem, ListFilter } from "../../types/table";
import DataTable from "../../components/DataTable";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
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
import { AxiosError, AxiosResponse } from "axios";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import SmartButtonOutlinedIcon from "@mui/icons-material/SmartButtonOutlined";
import ListConstants from "../../composables/constants/table";
import {
  addLiner,
  getLiner,
  getLinerList,
  updateLiner,
} from "../../composables/shippings/Liners";
import Popover from "@mui/material/Popover";
import PopupState from "material-ui-popup-state";
import { LinersModel } from "../../types/request";
import { validateForm } from "../../composables/product/FormValidation";
import { z } from "zod";

const LinerList = () => {
  const [errors, setErrors] = useState<Record<string, string | null>>({
    name: "",
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

  const [newLiner, setNewLiner] = useState<LinersModel>({
    name: "",
    type: "",
  });
  const [reloadData, setReloadData] = React.useState(false);
  const customTheme = createTheme(getTheme());
  const [popOverAnchorEl, setPopOverAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const openAnchor = Boolean(popOverAnchorEl);

  const columns: Column[] = [
    { field: "liner_id", headerName: "", hidden: true },
    {
      field: "name",
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

  const hiddenColumns = {
    liner_id: false,
  };

  const handleFetchData = async (filter: ListFilter) => {
    return getLinerList(filter);
  };

  const actions: ButtonList[] = [
    {
      key: "create-liner",
      handleOnClick: (event: any) => {
        setPopOverAnchorEl(event.currentTarget);
      },
      label: "Create new liner",
      style: { mt: 2 },
    },
  ];

  const handleChange = async (event: any) => {
    const { id, value } = event.target;
    setNewLiner((prevLiner) => ({
      ...prevLiner,
      [id]: value,
    }));
  };

  const handlePopOverClose = () => {
    setPopOverAnchorEl(null);
  };

  const buttonRefs = useRef<any>({});

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
        setNewLiner({
          ...newLiner,
          liner_id: row.liner_id,
        });
        await fetchLiner(row.liner_id);
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

  const formSchema = z.object({
    name: z.string().min(3, "Liner name is required"),
    type: z.string().min(3, "Liner type is required"),
  });

  const handleCloseSnackBar = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  const executeSaveLiner = async (event: any) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();

      const isValid = validateForm(formSchema, newLiner, setErrors);

      if (!isValid) {
        return;
      }

      let result: AxiosResponse<any, any> | undefined = undefined;

      if (newLiner.liner_id) {
        result = await updateLiner(newLiner);
      } else {
        result = await addLiner(newLiner);
      }

      if (!result) return;

      if (result.status) {
        if (result.status === 200) {
          setSnackMessage({
            message: `Liner saved successfully`,
            severity: "success",
          });
        } else if (result.status === 204) {
          setSnackMessage({
            message: `Liner updated successfully`,
            severity: "success",
          });
        }
        setReloadData(true);
        setOpenSnackBar(true);
      } else {
        setSnackMessage({
          message: `Error while saving liner`,
          severity: "error",
        });
        setOpenSnackBar(true);
      }

      handlePopOverClose();
    }
  };

  const fetchLiner = async (linerId: number) => {
    if (linerId && linerId !== 0) {
      const result = await getLiner(linerId);
      const liner: LinersModel = result.data.liner;
      setNewLiner({
        liner_id: linerId,
        name: liner.name,
        type: liner.type,
      });
    }
  };

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
                <CardHeader title="Add new liner" />
                <CardContent sx={{ paddingTop: "16px", paddingLeft: "16px" }}>
                  <Grid2 container size={12}>
                    <Grid2 size={12}>
                      <FormLabel htmlFor="name">Name</FormLabel>
                      <TextField
                        id="name"
                        autoFocus
                        size="small"
                        fullWidth
                        required
                        placeholder="Psc"
                        color={errors.name ? "error" : "primary"}
                        error={!!errors.name}
                        helperText={errors.name || ""}
                        value={newLiner.name}
                        onChange={handleChange}
                        InputProps={{
                          inputProps: {
                            maxLength: 15,
                          },
                        }}
                      />
                    </Grid2>

                    <Grid2 size={12}>
                      <FormLabel htmlFor="type">Type</FormLabel>
                      <TextField
                        id="type"
                        autoFocus
                        size="small"
                        fullWidth
                        required
                        placeholder="Loader"
                        color={errors.type ? "error" : "primary"}
                        error={!!errors.type}
                        helperText={errors.type || ""}
                        value={newLiner.type}
                        onChange={handleChange}
                        InputProps={{
                          inputProps: {
                            maxLength: 11,
                          },
                        }}
                      />
                    </Grid2>
                  </Grid2>
                </CardContent>
                <CardActions
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingTop: "8px",
                  }}
                >
                  <Grid2>
                    <Button type="submit" onClick={executeSaveLiner}>
                      Save Port
                    </Button>
                    <Button onClick={() => handlePopOverClose()}>Close</Button>
                  </Grid2>
                </CardActions>
              </Card>
            </Popover>
          </div>
        )}
      </PopupState>
      <DataTable
        columns={columns}
        redirectTo="/port"
        handleFetchData={handleFetchData}
        primaryKey="liner_id"
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

export default LinerList;
