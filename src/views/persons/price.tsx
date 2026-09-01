import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slide,
  Snackbar,
  TextField,
  ThemeProvider,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { PriceModel, ProductModel } from "../../types/request";
import {
  editPrice,
  getPriceById,
  savePrice,
} from "../../composables/persons/Prices";
import { TransitionProps } from "@mui/material/transitions";
import { AxiosError, AxiosResponse } from "axios";
import { getProductList } from "../../composables/product/Product";
import { z } from "zod";
import { validateForm } from "../../composables/product/FormValidation";

interface PriceProps {
  open: boolean;
  onClose: (tab: number, result?: AxiosResponse | AxiosError) => void;
  priceId?: number;
  personId: number;
}
const Prices: React.FC<PriceProps> = ({ open, onClose, priceId, personId }) => {
  const customTheme = createTheme(getTheme());
  const [errors, setErrors] = useState<Record<string, string | null>>({
    from: "",
    to: "",
    price: "",
    product_id: "",
  });
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });

  const [newPrice, setNewPrice] = useState<PriceModel>({
    from: "",
    to: "",
    price: 0,
    person_id: personId,
    date_created: new Date(),
    date_modified: new Date(),
  });

  const [productOptions, setProductOptions] = useState<
    { id: number; label: string }[]
  >([]);

  const typeOptions = [
    {
      id: "trucking",
      label: "trucking",
    },
    {
      id: "trucking&labour",
      label: "trucking + labour",
    },
    {
      id: "trucking&labour&arrangements",
      label: "trucking + labour + arrangements",
    },
  ];

  const formSchema = z.object({
    from: z.string().min(3, "From port is required"),
    to: z.string().min(3, "To port is required"),
    price: z.number().gt(0, "The price is required"),
    product_id: z.number().min(1, { message: "Please select a product" }),
  });

  const executeSave = async () => {
    const result = await savePrice(newPrice);
    onClose(4, result);
  };

  const executeModify = async () => {
    const result = await editPrice(newPrice);
    onClose(4, result);
  };

  const executeSavePrice = async (event: any) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();

      const isValid = validateForm(formSchema, newPrice, setErrors);

      if (!isValid) {
        return;
      }

      if (priceId) {
        await executeModify();
      } else {
        await executeSave();
      }
    }
  };

  const fetchPrice = async () => {
    if (priceId && priceId !== 0) {
      const result = await getPriceById(priceId);
      const price: PriceModel = result.data.price;
      setNewPrice({
        from: price.from,
        to: price.to,
        price: price.price,
        price_id: price.price_id,
        person_id: price.person_id,
        product_id: price.product_id,
      });
    }
  };

  const fetchProducts = async () => {
    const result = await getProductList({
      limit: 0,
      offset: 0,
      filter: [],
      sort: [{ field: "product_id", sort: "asc" }],
    });
    const productList: ProductModel[] = result.data.data;

    const options: { id: number; label: string }[] = [];

    productList.forEach((product: ProductModel) => {
      if (product.product_id) {
        options.push({
          id: product.product_id,
          label: product.name,
        });
      }
    });
    setProductOptions(options);
  };

  const handleProductChange = (event: SelectChangeEvent<string>) => {
    if (event.target.value) {
      const value = parseFloat(event.target.value as string);
      setNewPrice({
        ...newPrice,
        product_id: isNaN(value) ? 0 : value,
      });
    }
  };

  const handleCloseSnackBar = (
    event: React.SyntheticEvent<any> | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return; // Prevent close on clickaway
    }
    setOpenSnackBar(false);
  };

  const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
  ) {
    return (
      <Slide direction="up" ref={ref} {...props}>
        {props.children}
      </Slide>
    );
  });

  useEffect(() => {
    if (priceId && priceId !== 0) {
      (async () => {
        try {
          await fetchPrice();
        } catch (error) {
          setSnackMessage({
            message: "Error fetching data",
            severity: "error",
          });
          setOpenSnackBar(true);
        }
      })();
    }

    (async () => {
      try {
        await fetchProducts();
      } catch (error) {
        setSnackMessage({
          message: "Error fetching data",
          severity: "error",
        });
        setOpenSnackBar(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (productOptions && productOptions.length !== 0) {
      setNewPrice({
        ...newPrice,
        product_id: productOptions[0].id,
      });
    }
  }, [productOptions]);

  return (
    <ThemeProvider theme={customTheme}>
      <Dialog
        open={open}
        onClose={() => onClose(4)}
        maxWidth="md"
        hideBackdrop={true}
        slotProps={{
          paper: {
            sx: {
              width: "100%",
              maxHeight: "90vh",
            },
          },
        }}
      >
        <DialogTitle>Price</DialogTitle>
        <DialogContent>
          <Card
            sx={{
              "& .MuiTextField-root": { m: 1 },
              paddingBottom: "4px",
              backgroundColor: "hsl(0deg 0% 100%)",
            }}
          >
            <CardHeader
              title=""
              subheader="Add new price"
              sx={{
                borderBottom: "1px solid",
                paddingBottom: "16px",
              }}
            />
            <CardContent sx={{ paddingTop: "16px" }}>
              <Grid container spacing={1} offset={1} size={8}>
                <Grid size={12}>
                  <FormLabel htmlFor="From">From</FormLabel>
                  <TextField
                    id="from"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="Port louis"
                    color={errors.from ? "error" : "primary"}
                    error={!!errors.from}
                    helperText={errors.from || ""}
                    value={newPrice.from}
                    onChange={(event) => {
                      setNewPrice({ ...newPrice, from: event.target.value });
                    }}
                    slotProps={{
                      htmlInput: {
                        maxLength: 20,
                      },
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <FormLabel htmlFor="To">To</FormLabel>
                  <TextField
                    id="to"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="Grand baie"
                    color={errors.to ? "error" : "primary"}
                    error={!!errors.to}
                    helperText={errors.to || ""}
                    value={newPrice.to}
                    onChange={(event) => {
                      setNewPrice({ ...newPrice, to: event.target.value });
                    }}
                    slotProps={{
                      htmlInput: {
                        maxLength: 20,
                      },
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <FormControl fullWidth error={!!errors.product_id}>
                    <FormLabel id="product_id">Name</FormLabel>
                    <Select
                      id="product_id"
                      labelId="product_id"
                      value={
                        newPrice.product_id
                          ? newPrice.product_id?.toString(10)
                          : ""
                      }
                      onChange={handleProductChange}
                      label="Select an option"
                      variant="outlined"
                      color={errors.product_id ? "error" : "primary"}
                      error={!!errors.product_id}
                      size="small"
                    >
                      {productOptions &&
                        productOptions.map((option, index) => {
                          return (
                            <MenuItem key={index} value={option.id}>
                              {option.label}
                            </MenuItem>
                          );
                        })}
                    </Select>
                    <FormHelperText>{errors.product_id}</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid size={12}>
                  <FormLabel htmlFor="Price">Price</FormLabel>
                  <TextField
                    id="price"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="100"
                    color={errors.price ? "error" : "primary"}
                    error={!!errors.price}
                    helperText={errors.price || ""}
                    value={newPrice.price}
                    onChange={(event) => {
                      const value = parseFloat(event.target.value);
                      setNewPrice({
                        ...newPrice,
                        price: isNaN(value) ? 0 : value,
                      });
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={executeSavePrice}>Save Price</Button>
          <Button onClick={() => onClose(4)}>Close</Button>
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

export default Prices;
