import { useNavigate } from "react-router-dom";
import { ButtonList, Column, FilterItem, ListFilter } from "../../types/table";
import DataTable from "../../components/DataTable";
import { getPricesList } from "../../composables/persons/Prices";
import React from "react";
import Price from "./price";
import { AxiosError, AxiosResponse } from "axios";
import {
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  SnackbarCloseReason,
} from "@mui/material";
import SmartButtonOutlinedIcon from "@mui/icons-material/SmartButtonOutlined";
import ListConstants from "../../composables/constants/table";

interface PriceProps {
  parentPersonId: number;
}

const PriceList: React.FC<PriceProps> = ({ parentPersonId }) => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const [reloadData, setReloadData] = React.useState(false);
  const [priceId, setPriceId] = React.useState();

  const ActionDropdown: React.FC<{ row: any }> = ({ row }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleAction = (selectedAction: string) => {
      handleMenuClose();
      if (selectedAction === "edit") {
        setPriceId(row.price_id);
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
          open={openMenu}
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
          <MenuItem onClick={() => handleAction("edit")}>Edit</MenuItem>
        </Menu>
      </>
    );
  };

  const columns: Column[] = [
    { field: "price_id", headerName: "" },
    { field: "product_id", headerName: "" },
    {
      field: "name",
      headerName: "Name",
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
      field: "from",
      headerName: "From",
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
      field: "to",
      headerName: "To",
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
      field: "price",
      headerName: "Price",
      flex: 1,
      operators: [
        {
          name: ListConstants.EQUALS,
          component: "text",
        },
        {
          name: ListConstants.NOT_EQUALS,
          component: "text",
        },
        {
          name: ListConstants.LESS_THAN,
          component: "text",
        },
        {
          name: ListConstants.EQUAL_OR_LESS_THAN,
          component: "text",
        },
        {
          name: ListConstants.GREATER_THAN,
          component: "text",
        },
        {
          name: ListConstants.EQUAL_OR_GREATER_THAN,
          component: "text",
        },
      ],
    },
    {
      field: "date_created",
      headerName: "Date created",
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
      field: "date_modified",
      headerName: "Date modified",
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

  const handleFetchData = async (filter: ListFilter) => {
    const filterItem: FilterItem = {
      field: "person_id",
      value: parentPersonId,
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
    return getPricesList(filter);
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
          message: `Price saved successfully`,
          severity: "success",
        });
      } else if (result.status === 204) {
        setSnackMessage({
          message: `Price updated successfully`,
          severity: "success",
        });
      }

      setOpenSnackBar(true);
      setReloadData(true);
    } else {
      setSnackMessage({
        message: `Error while saving price`,
        severity: "error",
      });
      setOpenSnackBar(true);
    }

    navigate(`/supplier?tab=${tab}`);
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

  const actions: ButtonList[] = [
    {
      key: "add-price",
      handleOnClick: () => {
        setOpen(true);
      },
      label: "Add a new price",
      style: { mt: 2 },
    },
  ];

  const hiddenColumns = {
    price_id: false,
  };

  return (
    <>
      <DataTable
        columns={columns}
        handleFetchData={handleFetchData}
        primaryKey="price_id"
        buttonList={actions}
        hiddenColumns={hiddenColumns}
        reloadData={reloadData}
        setReloadData={setReloadData}
      />
      <div>
        {open && (
          <Price
            open={open}
            onClose={(tab, result) => handleAfterSave(tab, result)}
            priceId={priceId}
            personId={parentPersonId}
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

export default PriceList;
