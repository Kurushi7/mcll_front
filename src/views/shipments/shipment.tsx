import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Paper,
  Snackbar,
  ThemeProvider,
} from "@mui/material";

import Grid2 from "@mui/material/Grid2";
import React, { useEffect, useState } from "react";
import TransactionNoteList from "./transactionNoteList";
import CpInvoice from "./cpInvoice";
import { useNavigate, useParams } from "react-router-dom";
import Popover from "@mui/material/Popover";
import { FilterItem, ListFilter } from "../../types/table";
import ListConstants from "../../composables/constants/table";
import {
  DeleteShipmentHbl,
  getShipmentHblList,
} from "../../composables/shippings/Hbls";
import { Link } from "react-router-dom";
import PopupState from "material-ui-popup-state";
import HblForm from "./hblForm";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import { UpdateShipmentModel } from "../../types/updateRequest";
import { AxiosResponse } from "axios";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

interface hblOptions {
  hbl_no: string;
  shipment_hbl_id: number;
}

const Shipment = () => {
  const { shipmentId, hblId } = useParams<{
    shipmentId?: string;
    hblId?: string;
  }>();
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });

  const [hblList, setHblList] = useState<hblOptions[]>([]);
  const [hblTotal, setHblTotal] = useState<number>(0);
  const [intShipmentId, setIntShipmentId] = React.useState<number>();
  const [shipmentHblId, setShipmentHblId] = React.useState<number>();
  const [popOverAnchorEl, setPopOverAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const [newHblId, setNewHblId] = useState<number>(0);
  const openAnchor = Boolean(popOverAnchorEl);
  const navigate = useNavigate();
  const [clone, setClone] = React.useState<boolean>(false);
  const customTheme = createTheme(getTheme());
  const [reload, setReload] = React.useState(false);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPopOverAnchorEl(event.currentTarget);
  };

  const handleCloseAnchor = () => {
    setPopOverAnchorEl(null);
  };

  const handleReturn = async () => {
    navigate("/shipment-list");
  };

  const handleClose = (
    event: React.SyntheticEvent<any> | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  const navigateToHbl = () => {
    // setIntShipmentId(undefined);
    setShipmentHblId(undefined);
    setNewHblId(newHblId + 1);
    navigate(`/hbl/${shipmentId}`);
  };

  const fetchHblList = async () => {
    const filter: ListFilter = {
      limit: 0,
      offset: 0,
      filter: [],
      sort: [],
    };

    if (shipmentId) {
      const filterItems: FilterItem[] = [
        {
          field: "shipment_id",
          value: shipmentId,
          operator: ListConstants.EQUALS,
          logicOperator: "and",
        },
        {
          field: "deleted",
          value: false,
          operator: ListConstants.EQUALS,
          logicOperator: "and",
        },
      ];
      filter.filter = [...filter.filter, ...filterItems];
    }
    const result = await getShipmentHblList(filter);

    const hblListData = result.data.data;
    if (!result.data.data) {
      return;
    }
    setHblList(hblListData);
    setHblTotal(result.data.total);
  };

  const handleClone = (shipmentHblId: number) => {
    setClone(true);
    setShipmentHblId(shipmentHblId);
  };

  const showDeleteSwal = (shipmentHblId: number) => {
    setPopOverAnchorEl(null);
    withReactContent(Swal)
      .fire({
        icon: "warning",
        title: "Confirm deletion",
        confirmButtonText: "Yes",
        showCancelButton: true,
        denyButtonText: "No",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          await handleDelete(shipmentHblId);
          setReload(true);
        }
      });
  };

  const handleDelete = async (shipmentHblId: number) => {
    let result: AxiosResponse<any, any> | undefined = undefined;

    if (shipmentHblId) {
      result = await DeleteShipmentHbl(shipmentHblId);
    }

    if (!result) return;

    if (result.status) {
      if (result.status === 204) {
        setSnackMessage({
          message: `Hbl deleted`,
          severity: "success",
        });

        const hblIdToRedirectTo = hblList
          .filter((hbl) => hbl.shipment_hbl_id !== shipmentHblId)
          .at(0)?.shipment_hbl_id;

        if (hblIdToRedirectTo !== null) {
          navigate(`/hbl/${shipmentId}/${hblIdToRedirectTo}`);
        } else {
          navigate(`/hbl/${shipmentId}`);
        }
      } else {
        setSnackMessage({
          message: `Problem deleting Hbl`,
          severity: "error",
        });
      }
      setOpenSnackBar(true);
    } else {
      setSnackMessage({
        message: `Error while deleting Hbl`,
        severity: "error",
      });
    }
    setOpenSnackBar(true);
  };

  useEffect(() => {
    if (shipmentId && shipmentId !== "") {
      (async () => {
        try {
          const iShipmentId = parseInt(shipmentId, 10);
          setIntShipmentId(iShipmentId);
        } catch (error) {
          setSnackMessage({
            message: "Error fetching data",
            severity: "error",
          });
          setOpenSnackBar(true);
        }
      })();
    }
  }, [shipmentId]);

  useEffect(() => {
    (async () => {
      try {
        await fetchHblList();
      } catch (error) {
        console.error("Conversion error:", error);
        setSnackMessage({
          message: "Error fetching data",
          severity: "error",
        });
        setOpenSnackBar(true);
      }
    })();
  }, [reload]);

  useEffect(() => {
    if (hblId && hblId !== "") {
      (async () => {
        try {
          const intHblId = parseInt(hblId, 10);
          setShipmentHblId(intHblId);
        } catch (error) {
          console.error("Conversion error:", error);
          setSnackMessage({
            message: "Error fetching data",
            severity: "error",
          });
          setOpenSnackBar(true);
        }
      })();
    }
  }, [hblId]);

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ width: "auto" }}>
        <Grid2 display="flex">
          <div style={{ margin: "8px" }}>
            <Badge badgeContent={hblTotal} color="primary">
              <Button size="small" variant="outlined" onClick={handleOpen}>
                Show hbls
              </Button>
            </Badge>
          </div>
          <div style={{ margin: "8px" }}>
            <Button size="small" variant="contained" onClick={navigateToHbl}>
              Add hbl
            </Button>
          </div>
          {hblId && (
            <div style={{ margin: "8px" }}>
              <Button
                size="small"
                variant="contained"
                onClick={async () => {
                  if (shipmentHblId && shipmentHblId > 0) {
                    showDeleteSwal(shipmentHblId);
                  }
                }}
              >
                Delete hbl
              </Button>
            </div>
          )}
        </Grid2>
        <PopupState variant="popover" popupId="demo-popup-popover">
          {(popupState) => (
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
              slotProps={{
                paper: {
                  sx: {
                    minWidth: "400px",
                    padding: 2,
                    width: "auto",
                    boxSizing: "border-box",
                  },
                },
              }}
            >
              <Paper
                sx={{
                  width: "auto",
                  padding: 2,
                  boxSizing: "border-box",
                  maxWidth: "none",
                  backgroundColor: "white",
                }}
              >
                {hblList.length > 0 &&
                  hblList.map((record, index) => (
                    <Grid2 container={true} key={index} spacing={2} mb={2}>
                      <Grid2 size={6}>
                        <Link
                          to={`/hbl/${shipmentId}/${record.shipment_hbl_id}`}
                        >
                          {record.hbl_no}
                        </Link>
                      </Grid2>

                      <Grid2 size={3} mb={2}>
                        <span
                          onClick={() => handleClone(record.shipment_hbl_id)}
                          style={{
                            cursor: "pointer",
                            color: "blue",
                            textDecoration: "underline",
                          }}
                        >
                          Clone hbl
                        </span>
                      </Grid2>

                      <Grid2 size={3}>
                        <span
                          onClick={() => showDeleteSwal(record.shipment_hbl_id)}
                          style={{
                            cursor: "pointer",
                            color: "red",
                            textDecoration: "underline",
                          }}
                        >
                          Delete hbl
                        </span>
                      </Grid2>
                    </Grid2>
                  ))}

                <Grid2 container spacing={2}>
                  <Grid2
                    size={12}
                    style={{
                      display: "flex",
                      padding: "8px",
                      justifyContent: "flex-end",
                      marginTop: "auto",
                    }}
                  >
                    <Button variant="text" onClick={handleCloseAnchor}>
                      Close
                    </Button>
                  </Grid2>
                </Grid2>
              </Paper>
            </Popover>
          )}
        </PopupState>
        <Card
          sx={{
            "& .MuiTextField-root": { m: 1 },
            paddingBottom: "4px",
            backgroundColor: "hsl(0deg 0% 100%)",
          }}
        >
          <CardContent>
            <HblForm
              key={newHblId}
              onSave={fetchHblList}
              pShipmentId={intShipmentId}
              shipmentHblId={hblId}
              clone={clone}
              setClone={setClone}
            />

            <Grid2 container spacing={2}>
              <Grid2 size={10}>
                {shipmentHblId && (
                  <TransactionNoteList
                    key={newHblId}
                    hblId={shipmentHblId}
                    shipmentId={intShipmentId}
                  />
                )}
              </Grid2>
              <Grid2 size={2} />

              <Grid2 size={10}>
                {shipmentHblId && (
                  <CpInvoice key={newHblId} shipmentId={intShipmentId} />
                )}
              </Grid2>
              <Grid2 size={2} />
            </Grid2>
          </CardContent>
          <CardActions
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingTop: "8px",
            }}
          >
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReturn}>Return to shipments</Button>
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
      </Box>
    </ThemeProvider>
  );
};

export default Shipment;
