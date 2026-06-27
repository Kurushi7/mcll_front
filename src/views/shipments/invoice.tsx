import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import {
  Alert,
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
  Snackbar,
  TextField,
  ThemeProvider,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { InvoiceModel } from "../../types/request";
import { AxiosError, AxiosResponse } from "axios";
import { z } from "zod";
import { validateForm } from "../../composables/product/FormValidation";
import {
  addInvoice,
  getInvoice,
  updateInvoice,
} from "../../composables/shippings/Invoices";
import { TransformedInvoiceModel } from "../../types/invoiceTypes";
import { getRateAtDate } from "../../composables/shippings/Rates";

interface Props {
  open: boolean;
  onClose: (result?: AxiosResponse | AxiosError) => void;
  type: string;
  invoiceId?: number;
  shipmentId?: number;
  hblId?: number;
}

const Invoice: React.FC<Props> = ({
  open,
  onClose,
  type,
  invoiceId,
  shipmentId,
  hblId,
}) => {
  const customTheme = createTheme(getTheme());
  const [errors, setErrors] = useState<Record<string, string | null>>({
    invoice_ref: "",
    currency: "",
    invoice_date: "",
    due_date: "",
    total: "",
    vat: "",
    total_with_vat: "",
  });
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });

  const [newInvoice, setNewInvoice] = useState<TransformedInvoiceModel>({
    date_created: new Date().toISOString().split("T")[0],
    invoice_id: 0,
    vat: 0,
    shipment_id: 0,
    invoice_ref: "",
    currency: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: new Date().toISOString().split("T")[0],
    total: 0,
    total_with_vat: 0,
    type: type,
    rate: 1,
    shipment_hbl_id: hblId ?? 0,
  });

  const formSchema = z.object({
    invoice_ref: z.string().min(3, "Invoice ref is required"),
    currency: z.string().min(2, "The currency is required"),
    invoice_date: z
      .string()
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: "Invalid date format",
      })
      .transform((val) => new Date(val)),
    due_date: z
      .string()
      .refine((val) => !isNaN(new Date(val).getTime()), {
        message: "Invalid date format",
      })
      .transform((val) => new Date(val)),
    total: z.number().gt(0, "Total cannot be zero"),
    total_with_vat: z.number().gt(0, "Vat total cannot be zero"),
    rate: z.number().gt(0, "Rate cannot be zero and is required"),
  });

  const executeSave = async (finalInvoiceObj: TransformedInvoiceModel) => {
    const result = await addInvoice(finalInvoiceObj);
    onClose(result);
  };

  const executeModify = async (finalInvoiceObj: TransformedInvoiceModel) => {
    const result = await updateInvoice(finalInvoiceObj);
    onClose(result);
  };

  const executeSaveInvoice = async (event: any) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();

      const isValid = validateForm(formSchema, newInvoice, setErrors);

      if (!isValid) {
        return;
      }

      const finalObj: TransformedInvoiceModel = {
        invoice_ref: newInvoice.invoice_ref,
        currency: newInvoice.currency,
        invoice_date: new Date(newInvoice.invoice_date).toISOString(),
        due_date: new Date(newInvoice.due_date).toISOString(),
        total: newInvoice.total,
        vat: newInvoice.vat,
        total_with_vat: newInvoice.total_with_vat,
        type: newInvoice.type,
        invoice_id: invoiceId,
        rate: newInvoice.rate,
      };

      if (shipmentId) {
        finalObj.shipment_id = shipmentId;
      }

      if (hblId) {
        finalObj.shipment_id = hblId;
      }

      if (invoiceId) {
        await executeModify(finalObj);
      } else {
        finalObj.date_created = new Date().toISOString().split("T")[0];
        await executeSave(finalObj);
      }
    }
  };

  const formatToDateOnly = (dateString: string) => {
    if (!dateString) return "";

    return new Date(dateString).toISOString().split("T")[0];
  };

  const fetchInvoice = async () => {
    if (invoiceId && invoiceId !== 0) {
      const result = await getInvoice(invoiceId);
      const invoice: TransformedInvoiceModel = result.data.invoice;
      setNewInvoice({
        shipment_id: shipmentId ?? 0,
        invoice_id: invoiceId,
        invoice_ref: invoice.invoice_ref,
        currency: invoice.currency,
        invoice_date: formatToDateOnly(invoice.invoice_date),
        due_date: formatToDateOnly(invoice.due_date),
        total: invoice.total,
        vat: invoice.vat,
        total_with_vat: invoice.total_with_vat,
        type: invoice.type,
        rate: invoice.rate,
        shipment_hbl_id: hblId ?? 0,
      });
    }
  };

  const getExchangeRate = async (currency: string) => {
    const invDate = new Date(newInvoice.invoice_date).toISOString();
    const result = await getRateAtDate(
      currency,
      newInvoice.invoice_date ? invDate : new Date().toISOString(),
    );

    if (!result.data.rate || result.data.rate.rate_id === 0) {
      setSnackMessage({
        message: `No exchange rate found for ${currency}`,
        severity: "warning",
      });
      setOpenSnackBar(true);
      return;
    }

    setNewInvoice({
      ...newInvoice,
      rate: result.data.rate.rate,
    });
  };

  const handleSelectChange = async (event: any) => {
    const { name, value } = event.target;
    await getExchangeRate(value);
    setNewInvoice((prevInvoice) => ({
      ...prevInvoice,
      [name]: value,
    }));
  };

  const handleChange = async (event: any, type: string) => {
    const { id, value } = event.target;
    const finalValue = type === "float" ? parseFloat(value) : value;

    if (
      (type === "vat" || type === "total") &&
      newInvoice.vat != 0 &&
      value != 0
    ) {
      setNewInvoice((prevInvoice) => ({
        ...prevInvoice,
        total_with_vat: newInvoice.total * (newInvoice.vat / 100),
      }));
    }

    setNewInvoice((prevInvoice) => ({
      ...prevInvoice,
      [id]: finalValue,
    }));
  };

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

  const handleCloseSnackBar = (
    event: React.SyntheticEvent<any> | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return; // Prevent close on clickaway
    }
    setOpenSnackBar(false);
  };

  useEffect(() => {
    if (invoiceId && invoiceId !== 0) {
      (async () => {
        try {
          await fetchInvoice();
        } catch (error) {
          setSnackMessage({
            message: "Error fetching data",
            severity: "error",
          });
          setOpenSnackBar(true);
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
        PaperProps={{
          style: {
            width: "100%",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle>Create new invoice</DialogTitle>
        <DialogContent>
          <Card
            sx={{
              "& .MuiTextField-root": { m: 1 },
              paddingBottom: "4px",
              backgroundColor: "hsl(0deg 0% 100%)",
            }}
          >
            <CardHeader
              sx={{
                paddingBottom: "4px",
              }}
            />
            <CardContent sx={{ paddingTop: "16px" }}>
              <Grid2 container spacing={1} offset={1} size={8}>
                <Grid2 size={12}>
                  <FormLabel htmlFor="invoice_ref">Invoice Ref</FormLabel>
                  <TextField
                    id="invoice_ref"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="Pr23"
                    color={errors.invoice_ref ? "error" : "primary"}
                    error={!!errors.invoice_ref}
                    helperText={errors.invoice_ref || ""}
                    value={newInvoice.invoice_ref}
                    onChange={(event) => handleChange(event, "string")}
                    InputProps={{
                      inputProps: {
                        maxLength: 20,
                      },
                    }}
                  />
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel id="currency">Currency</FormLabel>
                  <Select
                    id="currency"
                    labelId="currency"
                    name="currency"
                    value={newInvoice.currency}
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
                  <FormLabel htmlFor="rate">Exchange rate</FormLabel>
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
                    value={newInvoice.rate}
                    onChange={(event) => handleChange(event, "float")}
                  />
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel htmlFor="invoice_date">Invoice date</FormLabel>
                  <TextField
                    id="invoice_date"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    type="date"
                    color={errors.invoice_date ? "error" : "primary"}
                    error={!!errors.invoice_date}
                    helperText={errors.invoice_date || ""}
                    value={newInvoice.invoice_date}
                    onChange={(event) => handleChange(event, "string")}
                  />
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel htmlFor="due_date">Due date</FormLabel>
                  <TextField
                    id="due_date"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    type="date"
                    color={errors.due_date ? "error" : "primary"}
                    error={!!errors.due_date}
                    helperText={errors.due_date || ""}
                    value={newInvoice.due_date}
                    onChange={(event) => handleChange(event, "string")}
                  />
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel htmlFor="total">Total</FormLabel>
                  <TextField
                    id="total"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    type="number"
                    color={errors.total ? "error" : "primary"}
                    error={!!errors.total}
                    helperText={errors.total || ""}
                    value={newInvoice.total || ""}
                    onChange={(event) => handleChange(event, "float")}
                    InputProps={{
                      inputProps: {
                        maxLength: 7,
                      },
                    }}
                  />
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel htmlFor="vat">VAT</FormLabel>
                  <TextField
                    id="vat"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    type="number"
                    value={newInvoice.vat || ""}
                    onChange={(event) => handleChange(event, "float")}
                    InputProps={{
                      inputProps: {
                        maxLength: 7,
                      },
                    }}
                  />
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel htmlFor="total_with_vat">VAT total</FormLabel>
                  <TextField
                    id="total_with_vat"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    type="number"
                    color={errors.total_with_vat ? "error" : "primary"}
                    error={!!errors.total_with_vat}
                    helperText={errors.total_with_vat || ""}
                    value={newInvoice.total_with_vat || ""}
                    onChange={(event) => handleChange(event, "float")}
                    InputProps={{
                      inputProps: {
                        maxLength: 7,
                      },
                    }}
                  />
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={executeSaveInvoice}>Save invoice</Button>
          <Button onClick={() => onClose()}>Close</Button>
        </DialogActions>
      </Dialog>
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

export default Invoice;
