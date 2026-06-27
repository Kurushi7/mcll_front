import React from "react";
import { ButtonList, Column, ListFilter } from "../../types/table";
import DataTable from "../../components/DataTable";
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
import {
  deleteInvoice,
  getInvoice,
  getInvoiceList,
} from "../../composables/shippings/Invoices";
import Invoice from "./invoice";
import { useSelector } from "react-redux";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

interface Props {
  type: string;
  shipmentId?: number;
  hblId?: number;
}

const InvoiceList: React.FC<Props> = ({ type, shipmentId, hblId }) => {
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
  const [invoiceId, setInvoiceId] = React.useState();

  const columns: Column[] = [
    { field: "invoice_id", headerName: "", hidden: true },
    { field: "shipping_id", headerName: "", hidden: true },
    {
      field: "invoice_ref",
      headerName: "Invoice Ref",
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
      field: "invoice_date",
      headerName: "Invoice date",
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
      field: "due_date",
      headerName: "Due date",
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
      field: "total",
      headerName: "Total",
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
      field: "vat",
      headerName: "Vat",
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
      field: "total_with_vat",
      headerName: "Vat Total",
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
      field: "",
      headerName: "Actions",
      type: "action",
      flex: 1,
      renderCell: (params) => <ActionDropdown row={params.row} />,
    },
  ];

  const hiddenColumns = {
    invoice_id: false,
    shipping_id: false,
  };

  const handleFetchData = async (filter: ListFilter) => {
    filter.filter = [
      {
        field: "shipment_id",
        value: shipmentId,
        operator: "equals",
        logicOperator: "and",
      },
      {
        field: "type",
        value: type,
        operator: "equals",
        logicOperator: "and",
      },
      {
        field: "deleted",
        value: false,
        operator: "equals",
        logicOperator: "and",
      },
    ];
    return getInvoiceList(filter);
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    let result: AxiosResponse<any, any> | undefined = undefined;

    result = await deleteInvoice(invoiceId);

    if (!result) return;

    if (result.status) {
      if (result.status === 204) {
        setSnackMessage({
          message: `Invoice deleted`,
          severity: "success",
        });

        // reload the table after successful delete
        setReloadData(true);
      } else {
        setSnackMessage({
          message: `Problem deleting invoice`,
          severity: "error",
        });
      }
      setOpenSnackBar(true);
    } else {
      setSnackMessage({
        message: `Problem deleting invoice`,
        severity: "error",
      });
    }
    setOpenSnackBar(true);
  };

  const showInvoiceLineDeleteSwal = async (invoiceId: number) => {
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
          await handleDeleteInvoice(invoiceId);
        }
      });
  };

  const handleAfterSave = (result?: AxiosResponse | AxiosError) => {
    setOpen(false);

    if (!result) return;

    if (result.status) {
      if (result.status === 200) {
        setSnackMessage({
          message: `Invoice saved successfully`,
          severity: "success",
        });
      } else if (result.status === 204) {
        setSnackMessage({
          message: `Invoice updated successfully`,
          severity: "success",
        });
      }
      setReloadData(true);
      setOpenSnackBar(true);
    } else {
      setSnackMessage({
        message: `Error while saving invoice`,
        severity: "error",
      });
      setOpenSnackBar(true);
    }
  };

  const actions: ButtonList[] = [
    {
      key: "create-invoice",
      handleOnClick: (data?: any) => {
        setOpen(true);
      },
      label: "Create new invoice",
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

    const handleAction = async (selectedAction: string) => {
      handleMenuClose();
      if (selectedAction === "edit") {
        setInvoiceId(row.invoice_id);
        setOpen(true);
      } else if (selectedAction === "delete") {
        await showInvoiceLineDeleteSwal(row.invoice_id);
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
          <MenuItem onClick={(row) => handleAction("delete")}>Delete</MenuItem>
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
        redirectTo=""
        handleFetchData={handleFetchData}
        primaryKey="invoice_id"
        buttonList={actions}
        hiddenColumns={hiddenColumns}
        reloadData={reloadData}
        setReloadData={setReloadData}
      />
      <div>
        {open && (
          <Invoice
            open={open}
            onClose={(result) => handleAfterSave(result)}
            invoiceId={invoiceId}
            type={type}
            shipmentId={shipmentId}
            hblId={hblId}
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

export default InvoiceList;
