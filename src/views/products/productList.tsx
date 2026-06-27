import DataTable from "../../components/DataTable";
import React, { useEffect } from "react";
import {
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  SnackbarCloseReason,
  ThemeProvider,
} from "@mui/material";
import { ButtonList, Column, FilterItem, ListFilter } from "../../types/table";
import ListConstants from "../../composables/constants/table";
import SmartButtonOutlinedIcon from "@mui/icons-material/SmartButtonOutlined";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import { useNavigate } from "react-router-dom";
import Product from "./product";
import { AxiosError, AxiosResponse } from "axios";
import { getProductList } from "../../composables/product/Product";

const ProductList = () => {
  const customTheme = createTheme(getTheme());
  const [reloadData, setReloadData] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [productId, setProductId] = React.useState();
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });

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
        setProductId(row.product_id);
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

  const handleFetchData = async (filter: ListFilter) => {
    return getProductList(filter);
  };

  const columns: Column[] = [
    { field: "product_id", headerName: "", hidden: true },
    {
      field: "price_id",
      headerName: "",
      hidden: true,
    },
    {
      field: "name",
      headerName: "Product name",
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
      field: "tags",
      headerName: "Tags",
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

  const handleAfterSave = (result?: AxiosResponse | AxiosError) => {
    setOpen(false);

    if (!result) return;

    if (result.status) {
      if (result.status === 200) {
        setSnackMessage({
          message: `Product saved successfully`,
          severity: "success",
        });
      } else if (result.status === 204) {
        setSnackMessage({
          message: `Product updated successfully`,
          severity: "success",
        });
      }
    } else {
      setSnackMessage({
        message: `Error while saving product`,
        severity: "error",
      });
    }

    setOpenSnackBar(true);
    setReloadData(true);
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

  const actions: ButtonList[] = [
    {
      key: "create-product",
      handleOnClick: (data?: any) => {
        setOpen(true);
      },
      label: "Create new product",
      style: { mt: 2 },
    },
  ];

  const hiddenColumns = {
    product_id: false,
  };

  return (
    <ThemeProvider theme={customTheme}>
      <DataTable
        columns={columns}
        handleFetchData={handleFetchData}
        primaryKey="product_id"
        buttonList={actions}
        hiddenColumns={hiddenColumns}
        reloadData={reloadData}
        setReloadData={setReloadData}
      />
      <div>
        {open && (
          <Product
            open={open}
            onClose={(result) => handleAfterSave(result)}
            productId={productId}
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

export default ProductList;
