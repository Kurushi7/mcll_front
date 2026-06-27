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
  FormLabel,
  Grid2,
  IconButton,
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
import { RateModel } from "../../types/request";
import { AxiosResponse } from "axios";
import { validateForm } from "../../composables/product/FormValidation";
import DataTable from "../../components/DataTable";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import {
  addRate,
  getRate,
  getRateList,
  updateRate,
} from "../../composables/shippings/Rates";

const RateList = () => {
  const [reloadData, setReloadData] = React.useState(false);
  const [popOverAnchorEl, setPopOverAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const openAnchor = Boolean(popOverAnchorEl);
  const customTheme = createTheme(getTheme());
  const buttonRefs = useRef<any>({});
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

  const [errors, setErrors] = useState<Record<string, string | null>>({
    rate: "",
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
    rate: z.number().gt(0, "The rate is required and must not be zero"),
  });

  const [rates, setRates] = useState<RateModel>({
    currency: "USD",
    rate: 1,
    date: new Date().toISOString().split("T")[0],
  });

  const actions: ButtonList[] = [
    {
      key: "add-rates",
      handleOnClick: (event: any) => {
        rates.date = new Date().toISOString().split("T")[0];
        setPopOverAnchorEl(event.currentTarget);
      },
      label: "Add rate",
      style: { mt: 2 },
    },
  ];

  const fetchRate = async (rate_id: number) => {
    const result = await getRate(rate_id);

    if (!result) return;

    const rateRecord: RateModel = result.data.rate;

    setRates({
      rate_id: rateRecord.rate_id ?? 0,
      currency: rateRecord.currency,
      rate: rateRecord.rate,
      date: rateRecord.date ? rateRecord.date.split("T")[0] : "",
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
        await fetchRate(row.rate_id);
        setPopOverAnchorEl(buttonRefs.current[row.rate_id]);
      }
    };

    return (
      <>
        <IconButton
          ref={(el) => {
            buttonRefs.current[row.rate_id] = el;
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
    { field: "rate_id", headerName: "", hidden: true },
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
      field: "rate",
      headerName: "Rate",
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
      field: "date",
      headerName: "Rate as at",
      type: "date",
      valueFormatter: (params) => {
        return params ? new Date(params).toISOString().split("T")[0] : "";
      },
      flex: 1,
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
      field: "",
      headerName: "Actions",
      type: "action",
      flex: 1,
      renderCell: (params) => <ActionDropdown row={params.row} />,
    },
  ];

  const resetState = () => {
    setRates({
      rate_id: undefined,
      currency: "USD",
      rate: 1,
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleAddRate = async () => {
    let result: AxiosResponse<any, any> | undefined = undefined;

    const isValid = validateForm(formSchema, rates, setErrors);

    if (!isValid) {
      return;
    }

    rates.date = new Date(rates.date).toISOString();
    if (rates.rate_id && rates.rate_id !== 0) {
      result = await updateRate(rates);
    } else {
      result = await addRate(rates);
    }

    if (!result) return;

    if (result.status) {
      if (result.status === 200) {
        setSnackMessage({
          message: `Rate saved successfully`,
          severity: "success",
        });
      } else if (result.status === 204) {
        setSnackMessage({
          message: `Rate updated successfully`,
          severity: "success",
        });
      }
      setReloadData(true);
      setOpenSnackBar(true);
    } else {
      setSnackMessage({
        message: `Error while saving rate`,
        severity: "error",
      });
      setOpenSnackBar(true);
    }
    resetState();
    handlePopOverClose();
  };

  const hiddenColumns = {
    rate_id: false,
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
    return getRateList(filter);
  };

  const handleSelectChange = async (event: any) => {
    const { name, value } = event.target;
    setRates((prevRate) => ({
      ...prevRate,
      [name]: value,
    }));
  };

  const handleChange = async (event: any, type: string) => {
    const { id, value } = event.target;

    const finalValue = type === "float" ? parseFloat(value) : value;
    setRates((prevRate) => ({
      ...prevRate,
      [id]: finalValue,
    }));
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
                <CardHeader title="Add new rate" />
                <CardContent sx={{ paddingTop: "16px", paddingLeft: "16px" }}>
                  <Grid2 container size={12} spacing={1}>
                    <Grid2 size={6}>
                      <FormLabel id="currency">Currency</FormLabel>
                      <Select
                        id="currency"
                        labelId="currency"
                        name="currency"
                        value={rates.currency}
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
                      <FormLabel htmlFor="rate">Rate</FormLabel>
                      <TextField
                        id="rate"
                        autoFocus
                        size="small"
                        fullWidth
                        required
                        placeholder="0.55"
                        type="number"
                        color={errors.rate ? "error" : "primary"}
                        error={!!errors.rate}
                        helperText={errors.rate || ""}
                        value={rates.rate}
                        onChange={(event) => handleChange(event, "float")}
                      />
                    </Grid2>

                    <Grid2 size={6}>
                      <FormLabel htmlFor="date">Date</FormLabel>
                      {rates.date}
                      <TextField
                        id="date"
                        autoFocus
                        size="small"
                        fullWidth
                        required
                        type="date"
                        color={errors.date ? "error" : "primary"}
                        error={!!errors.date}
                        helperText={errors.date || ""}
                        value={rates.date}
                        onChange={(event) => handleChange(event, "string")}
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
                    <Button type="submit" onClick={handleAddRate}>
                      Save Vessel
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
        redirectTo=""
        handleFetchData={handleFetchData}
        primaryKey="rate_id"
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

export default RateList;
