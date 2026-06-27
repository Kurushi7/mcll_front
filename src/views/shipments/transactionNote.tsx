import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  Grid2,
  MenuItem,
  Select,
  TextField,
  ThemeProvider,
} from "@mui/material";
import { z } from "zod";
import { AxiosError, AxiosResponse } from "axios";
import { validateForm } from "../../composables/product/FormValidation";
import { TransactionNoteModel } from "../../types/request";
import {
  addTransactionNote,
  getTransactionNote,
  updateTransactionNote,
} from "../../composables/shippings/TransactionNotes";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import { currencyList } from "../../composables/constants/currencies";
import { getRateAtDate } from "../../composables/shippings/Rates";

interface Props {
  shipmentId?: number;
  open: boolean;
  onClose: (result?: AxiosResponse | AxiosError) => void;
  transactionId?: number;
  shipmentHblId?: number;
  setOpenSnackBar: (open: boolean) => void;
  setSnackMessage: React.Dispatch<
    React.SetStateAction<{
      message: string;
      severity: "success" | "info" | "warning" | "error" | undefined;
    }>
  >;
}

const TransactionNote: React.FC<Props> = ({
  shipmentId,
  open,
  onClose,
  transactionId,
  shipmentHblId,
  setOpenSnackBar,
  setSnackMessage,
}) => {
  const customTheme = createTheme(getTheme());

  const [newTransactionNotes, setNewTransactionNotes] =
    useState<TransactionNoteModel>({
      transaction_id: 0,
      ref_no: "",
      amount: 0,
      shipment_id: shipmentId ?? 0,
      type: "debit",
      currency: "USD",
      rate: 1,
      shipment_hbl_id: shipmentHblId ?? 0,
    });

  const typeOptions: { id: string; label: string }[] = [
    {
      id: "debit",
      label: "Debit",
    },
    {
      id: "credit",
      label: "Credit",
    },
  ];

  const [errors, setErrors] = useState<Record<string, string | null>>({
    ref_no: "",
    amount: "",
    rate: "",
  });

  const formSchema = z.object({
    ref_no: z
      .string()
      .min(3, `The ${newTransactionNotes.type} note ref is required`),
    amount: z.number().gt(0, "The amount is required"),
    rate: z.number().gt(0, "The exchange rate is required"),
  });

  const saveTransactionNote = async (event: any) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const isValid = validateForm(formSchema, newTransactionNotes, setErrors);

    if (!isValid) {
      return;
    }

    let result: AxiosResponse<any, any> | undefined = undefined;

    newTransactionNotes.shipment_id = shipmentId ?? 0;
    newTransactionNotes.shipment_hbl_id = shipmentHblId ?? 0;
    if (newTransactionNotes.transaction_id) {
      result = await updateTransactionNote(newTransactionNotes);
    } else {
      newTransactionNotes.date_created = new Date().toISOString();
      result = await addTransactionNote(newTransactionNotes);
    }

    onClose(result);
  };

  const handleChange = async (event: any, type: string) => {
    const { id, value } = event.target;

    const finalValue = type === "float" ? parseFloat(value) : value;
    setNewTransactionNotes((prevTransactionNote) => ({
      ...prevTransactionNote,
      [id]: finalValue,
    }));
  };

  const handleSelectChange = async (event: any, field: string) => {
    const { name, value } = event.target;

    if (field == "currency") {
      await getExchangeRate(value);
    }
    setNewTransactionNotes((prevTransactionNote) => ({
      ...prevTransactionNote,
      [name]: value,
    }));
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
    });
  };

  const getExchangeRate = async (currency: string) => {
    const result = await getRateAtDate(
      currency,
      newTransactionNotes.date_created ?? new Date().toISOString(),
    );

    if (!result.data.rate || result.data.rate.rate_id === 0) {
      setSnackMessage({
        message: `No exchange rate found for ${currency}`,
        severity: "warning",
      });
      setOpenSnackBar(true);
      return;
    }

    setNewTransactionNotes({
      ...newTransactionNotes,
      rate: result.data.rate.rate,
    });
  };

  useEffect(() => {
    if (transactionId && transactionId !== 0) {
      (async () => {
        try {
          await fetchTransactionNote(transactionId);
        } catch (error) {
          console.log("Error fetching data");
        }
      })();
    }
  }, []);

  return (
    <ThemeProvider theme={customTheme}>
      <Dialog
        open={open}
        onClose={() => onClose()}
        maxWidth="md"
        hideBackdrop={true}
        fullWidth={true}
        PaperProps={{
          style: {
            width: "fit-content",
            maxWidth: "100vw",
            maxHeight: "100vh",
          },
        }}
      >
        <DialogTitle>Info from debit/credit note</DialogTitle>
        <DialogContent>
          <Card
            sx={{
              "& .MuiTextField-root": { m: 1 },
              width: 700,
              backgroundColor: "hsl(0deg 0% 100%)",
            }}
          >
            <CardContent>
              <Grid2 container size={12} spacing={1}>
                <Grid2 size={6}>
                  <FormLabel htmlFor="ref_no">Debit/Credit note ref</FormLabel>
                  <TextField
                    id="ref_no"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="db98323"
                    color={errors.ref_no ? "error" : "primary"}
                    error={!!errors.ref_no}
                    helperText={errors.ref_no || ""}
                    value={newTransactionNotes.ref_no}
                    onChange={(event) => handleChange(event, "string")}
                    InputProps={{
                      inputProps: {
                        maxLength: 20,
                      },
                    }}
                  />
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel htmlFor="amount">Debit/Credit amount</FormLabel>
                  <TextField
                    id="amount"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    type="number"
                    color={errors.amount ? "error" : "primary"}
                    error={!!errors.amount}
                    helperText={errors.amount || ""}
                    value={newTransactionNotes.amount || ""}
                    onChange={(event) => handleChange(event, "float")}
                  />
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel id="type">Type</FormLabel>
                  <Select
                    id="type"
                    labelId="type"
                    name="type"
                    value={newTransactionNotes.type}
                    onChange={(event) => handleSelectChange(event, "type")}
                    label="Select an option"
                    variant="outlined"
                    fullWidth
                    sx={{ ml: 1 }}
                  >
                    {typeOptions &&
                      typeOptions.map((option, index: number) => {
                        return (
                          <MenuItem key={index} value={option.id}>
                            {option.label}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </Grid2>

                <Grid2 size={3}>
                  <FormLabel id="currency">Currency</FormLabel>
                  <Select
                    id="currency"
                    labelId="currency"
                    name="currency"
                    value={newTransactionNotes.currency}
                    onChange={(event) => handleSelectChange(event, "currency")}
                    label="Select an option"
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ ml: 1 }}
                  >
                    {currencyList &&
                      currencyList.map((option, index: number) => {
                        return (
                          <MenuItem key={index} value={option.id}>
                            {option.label}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </Grid2>

                <Grid2 size={3}>
                  <FormLabel htmlFor="rate"> Exchange Rate</FormLabel>
                  <TextField
                    id="rate"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    type="number"
                    color={errors.rate ? "error" : "primary"}
                    error={!!errors.rate}
                    helperText={errors.rate || ""}
                    value={newTransactionNotes.rate || ""}
                    onChange={(event) => handleChange(event, "float")}
                  />
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            my: 2,
          }}
        >
          <Button type="submit" onClick={saveTransactionNote}>
            Save Note
          </Button>
          <Button onClick={() => onClose()}>Close</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default TransactionNote;
