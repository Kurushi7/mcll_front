import React, { CSSProperties, useEffect, useState } from "react";
import { getPersonsList } from "../../composables/persons/Persons";
import { ButtonList, Column, FilterItem, ListFilter } from "../../types/table";
import DataTable from "../../components/DataTable";
import { useNavigate } from "react-router-dom";
import Owners from "./owners";
import ListConstants from "../../composables/constants/table";
import {
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  SnackbarCloseReason,
} from "@mui/material";
import { AxiosError, AxiosResponse } from "axios";
import SmartButtonOutlinedIcon from "@mui/icons-material/SmartButtonOutlined";
import { countryList } from "../../composables/constants/countries";

interface OwnerProps {
  parentPersonId: number;
}

const OwnersList: React.FC<OwnerProps> = ({ parentPersonId }) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const [ownerId, setOwnerId] = React.useState<number>(0);

  const ActionDropdown: React.FC<{ row: any }> = ({ row }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
      if (row && row.person_id) {
        setOwnerId(row.person_id);
      }
    }, [row]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleAction = (selectedAction: string) => {
      handleMenuClose();
      if (selectedAction === "edit") {
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

  const columns: Column[] = [
    { field: "person_id", headerName: "", hidden: true },
    {
      field: "first_name",
      headerName: "First name",
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
      field: "last_name",
      headerName: "Last name",
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
      field: "email",
      headerName: "Email",
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
      field: "city",
      headerName: "City",
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
      field: "phone1",
      headerName: "Phone",
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
          name: ListConstants.ANY_OF,
          component: "multi-select",
          options: countryList,
        },
      ],
    },
    {
      field: "date_created",
      headerName: "Date Created",
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

  const [reloadData, setReloadData] = React.useState(false);

  const handleFetchData = async (filter: ListFilter) => {
    const filterItem: FilterItem[] = [
      {
        field: "type",
        value: "owner",
        operator: ListConstants.EQUALS,
        logicOperator: "and",
      },
      {
        field: "id_linked_to",
        value: parentPersonId,
        operator: ListConstants.EQUALS,
        logicOperator: "and",
      },
    ];

    filter.filter = [...filter.filter, ...filterItem];

    return getPersonsList(filter);
  };

  const handleAfterSave = (
    tab: number,
    result?: AxiosResponse | AxiosError,
  ) => {
    setOpen(false);

    if (!result) return;
    if (result.status) {
      if (result.status === 200) {
        setSnackMessage({
          message: `Owner saved successfully`,
          severity: "success",
        });
      } else if (result.status === 204) {
        setSnackMessage({
          message: `Owner updated successfully`,
          severity: "success",
        });
      }
      setOpenSnackBar(true);
      setReloadData(true);
    } else {
      setSnackMessage({
        message: `Error while saving owner`,
        severity: "error",
      });
      setOpenSnackBar(true);
    }
    navigate(`/supplier?tab=${tab}`);
  };

  const actions: ButtonList[] = [
    {
      key: "create-owners",
      handleOnClick: (data?: any) => {
        setOpen(true);
      },
      label: "Create new owner",
      style: { mt: 2 },
    },
  ];

  const styles: CSSProperties = {
    position: "relative",
    // Avoid overflow hidden if you want the dialog to drag outside this area
    overflow: "visible", // Ensure overflow is visible
  };

  const hiddenColumns = {
    person_id: false,
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
    <>
      <DataTable
        columns={columns}
        handleFetchData={handleFetchData}
        primaryKey="person_id"
        buttonList={actions}
        hiddenColumns={hiddenColumns}
        reloadData={reloadData}
        setReloadData={setReloadData}
      />
      <div style={styles}>
        {open && (
          <Owners
            open={open}
            onClose={(tab, result) => handleAfterSave(tab, result)}
            parentPersonId={parentPersonId}
            personId={ownerId}
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
    </>
  );
};

export default OwnersList;
