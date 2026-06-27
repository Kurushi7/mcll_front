import React, { useCallback, useState } from "react";
import { ButtonList, Column, FilterItem, ListFilter } from "../../types/table";
import DataTable from "../../components/DataTable";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  ThemeProvider,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import ListConstants from "../../composables/constants/table";
import { countryList } from "../../composables/constants/countries";
import SmartButtonOutlinedIcon from "@mui/icons-material/SmartButtonOutlined";
import { getPersonsList } from "../../composables/persons/Persons";

interface PersonsProps {
  personType: string;
}

const PersonsList: React.FC<PersonsProps> = ({ personType }) => {
  const customTheme = createTheme(getTheme());
  const navigate = useNavigate();
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const [reloadData, setReloadData] = useState(false);

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
        navigate(`/${personType}/${row.person_id}`);
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

  const hiddenColumns = {
    person_id: false,
  };

  const handleClose = (
    event: React.SyntheticEvent<any> | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return; // Prevent close on clickaway
    }
    setOpenSnackBar(false);
  };

  const handleFetchData = useCallback(async (filter: ListFilter) => {
    const filterItem: FilterItem = {
      field: "type",
      value: personType,
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

    return getPersonsList(filter);
  }, []);

  const actions: ButtonList[] = [
    {
      key: `create-${personType}`,
      handleOnClick: (data?: any) => {
        navigate(`/${personType}`);
      },
      label: `Create new ${personType}`,
      style: { mt: 2 },
    },
  ];

  return (
    <ThemeProvider theme={customTheme}>
      <DataTable
        key={personType}
        columns={columns}
        redirectTo={`/${personType}`}
        handleFetchData={handleFetchData}
        primaryKey="person_id"
        buttonList={actions}
        hiddenColumns={hiddenColumns}
        reloadData={reloadData}
        setReloadData={setReloadData}
      />
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

export default PersonsList;
