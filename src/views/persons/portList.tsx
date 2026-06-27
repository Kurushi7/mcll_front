import React, { useEffect } from "react";
import { ButtonList, Column, FilterItem, ListFilter } from "../../types/table";
import DataTable from "../../components/DataTable";
import { getPortList } from "../../composables/persons/Ports";
import Port from "./port";
import {
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  SnackbarCloseReason,
  ThemeProvider,
} from "@mui/material";
import { AxiosError, AxiosResponse } from "axios";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import SmartButtonOutlinedIcon from "@mui/icons-material/SmartButtonOutlined";
import ListConstants from "../../composables/constants/table";

const PortList = () => {
  const [open, setOpen] = React.useState(false);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const [reloadData, setReloadData] = React.useState(false);
  const customTheme = createTheme(getTheme());
  const [portId, setPortId] = React.useState();

  const columns: Column[] = [
    { field: "port_id", headerName: "", hidden: true },
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
      field: "code",
      headerName: "Code",
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
    port_id: false,
  };

  const handleFetchData = async (filter: ListFilter) => {
    return getPortList(filter);
  };

  const handleAfterSave = (result?: AxiosResponse | AxiosError) => {
    setOpen(false);

    if (!result) return;

    if (result.status) {
      if (result.status === 200) {
        setSnackMessage({
          message: `Port saved successfully`,
          severity: "success",
        });
      } else if (result.status === 204) {
        setSnackMessage({
          message: `Port updated successfully`,
          severity: "success",
        });
      }
      setReloadData(true);
      setOpenSnackBar(true);
    } else {
      setSnackMessage({
        message: `Error while saving port`,
        severity: "error",
      });
      setOpenSnackBar(true);
    }
  };

  const actions: ButtonList[] = [
    {
      key: "create-port",
      handleOnClick: (data?: any) => {
        setOpen(true);
      },
      label: "Create new port",
      style: { mt: 2 },
    },
  ];

  const ActionDropdown: React.FC<{ row: any }> = ({ row }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleAction = (selectedAction: string) => {
      handleMenuClose();
      if (selectedAction === "edit") {
        setPortId(row.port_id);

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

  const handleCloseSnackBar = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <DataTable
        columns={columns}
        redirectTo="/port"
        handleFetchData={handleFetchData}
        primaryKey="port_id"
        buttonList={actions}
        hiddenColumns={hiddenColumns}
        reloadData={reloadData}
        setReloadData={setReloadData}
      />
      <div>
        {open && (
          <Port
            open={open}
            onClose={(result) => handleAfterSave(result)}
            portId={portId}
          />
        )}
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

export default PortList;
