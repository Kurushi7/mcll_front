import React, { useState } from "react";
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
import { TransactionNoteModel } from "../../types/request";
import {
  getTransactionNote,
  getTransactionNoteList,
} from "../../composables/shippings/TransactionNotes";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import DataTable from "../../components/DataTable";
import { ButtonList, Column, ListFilter } from "../../types/table";
import ListConstants from "../../composables/constants/table";
import SmartButtonOutlinedIcon from "@mui/icons-material/SmartButtonOutlined";
import TransactionNote from "./transactionNote";
import CardTitle from "../../components/global/Card/CardTitle";

interface Props {
  shipmentId?: number;
  hblId?: number;
}

const TransactionNoteList: React.FC<Props> = ({ shipmentId, hblId }) => {
  const customTheme = createTheme(getTheme());
  const [open, setOpen] = React.useState(false);

  const [_newTransactionNotes, setNewTransactionNotes] =
    useState<TransactionNoteModel>({
      transaction_id: 0,
      ref_no: "",
      amount: 0,
      shipment_id: shipmentId ?? 0,
      type: "debit",
      currency: "USD",
      rate: 1,
      shipment_hbl_id: hblId ?? 0,
      file_urls: "",
    });

  const [reloadData, setReloadData] = React.useState(false);
  const [transactionId, setTransactionId] = useState();

  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });

  const handleCloseSnackBar = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  const fetchTransactionNote = async (transactionNoteId: number) => {
    if (!transactionNoteId) return;
    const result = await getTransactionNote(transactionNoteId);

    if (!result) return;

    const transactionRecord: TransactionNoteModel = result.data.transactionNote;

    setNewTransactionNotes({
      transaction_id: transactionId,
      ref_no: transactionRecord.ref_no,
      amount: transactionRecord.amount,
      type: transactionRecord.type,
      shipment_id: transactionRecord.shipment_id,
      currency: transactionRecord.currency,
      rate: transactionRecord.rate,
      shipment_hbl_id: transactionRecord.shipment_hbl_id,
      file_urls: transactionRecord.file_urls,
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

    const handleAction = async (selectedAction: string, _event: any) => {
      handleMenuClose();
      if (selectedAction === "edit") {
        await fetchTransactionNote(row.transaction_id);
        setOpen(true);
        setTransactionId(row.transaction_id);
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
          <MenuItem onClick={(event) => handleAction("edit", event)}>
            Edit
          </MenuItem>
        </Menu>
      </>
    );
  };

  const columns: Column[] = [
    { field: "transaction_id", headerName: "", hidden: true },
    { field: "shipment_id", headerName: "", hidden: true },
    {
      field: "ref_no",
      headerName: "Reference no",
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
      field: "type",
      headerName: "Type",
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
      field: "amount",
      headerName: "Amount",
      flex: 1,
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
    transaction_id: false,
    shipment_id: false,
  };

  const handleFetchData = async (filter: ListFilter) => {
    filter.filter = [
      {
        field: "shipment_hbl_id",
        value: hblId,
        operator: ListConstants.EQUALS,
        logicOperator: "and",
      },
    ];
    return getTransactionNoteList(filter);
  };

  const actions: ButtonList[] = [
    {
      key: "create-transaction-note",
      handleOnClick: (_data?: any) => {
        setOpen(true);
      },
      label: "Create transaction note",
      style: { mt: 2 },
    },
  ];

  const handleAfterSave = (result?: AxiosResponse | AxiosError) => {
    setOpen(false);

    if (!result) return;

    if (result.status) {
      if (result.status === 200) {
        setSnackMessage({
          message: `Transaction note saved successfully`,
          severity: "success",
        });
      } else if (result.status === 204) {
        setSnackMessage({
          message: `Transaction note updated successfully`,
          severity: "success",
        });
      }
      setReloadData(true);
      setOpenSnackBar(true);
    } else {
      setSnackMessage({
        message: `Error while saving transaction note`,
        severity: "error",
      });
      setOpenSnackBar(true);
    }
  };

  return (
    <div>
      <div style={{ backgroundColor: "hsl(0deg 0% 100%)", padding: "16px" }}>
        <CardTitle>Transaction note</CardTitle>

        <ThemeProvider theme={customTheme}>
          <DataTable
            columns={columns}
            handleFetchData={handleFetchData}
            primaryKey="transaction_id"
            buttonList={actions}
            hiddenColumns={hiddenColumns}
            reloadData={reloadData}
            setReloadData={setReloadData}
          />
        </ThemeProvider>
      </div>

      {open && (
        <TransactionNote
          open={open}
          onClose={(result) => handleAfterSave(result)}
          transactionId={transactionId}
          shipmentId={shipmentId}
          shipmentHblId={hblId}
          setOpenSnackBar={setOpenSnackBar}
          setSnackMessage={setSnackMessage}
        />
      )}

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
    </div>
  );
};

export default TransactionNoteList;
