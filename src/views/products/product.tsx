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
  Grid,
  Slide,
  Snackbar,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { ProductModel } from "../../types/request";
import { TransitionProps } from "@mui/material/transitions";
import { AxiosError, AxiosResponse } from "axios";
import {
  fetchProductById,
  saveProduct,
  updateProduct,
} from "../../composables/product/Product";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import { z } from "zod";
import { validateForm } from "../../composables/product/FormValidation";

interface ProductProps {
  open: boolean;
  onClose: (result?: AxiosResponse | AxiosError) => void;
  productId?: number;
}

const Product: React.FC<ProductProps> = ({ open, onClose, productId }) => {
  const [errors, setErrors] = useState<Record<string, string | null>>({
    name: "",
    tags: "",
  });

  const [newProduct, setNewProduct] = useState<ProductModel>({
    name: "",
    tags: "",
    date_created: new Date(),
  });
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const customTheme = createTheme(getTheme());

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

  const handleChange = async (event: any) => {
    const { id, value } = event.target;
    setNewProduct((prevProduct) => ({
      ...prevProduct,
      [id]: value,
    }));
  };

  const formSchema = z.object({
    name: z.string().min(3, "The product name is required"),
  });

  const executeSave = async () => {
    let result: AxiosResponse<any, any> | AxiosError | undefined = undefined;

    if (productId && productId != 0) {
      newProduct.product_id = productId;
      result = await updateProduct(newProduct);
    } else {
      result = await saveProduct(newProduct);
    }

    onClose(result);
  };

  const executeSaveProduct = async (event: any) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();

      const isValid = validateForm(formSchema, newProduct, setErrors);

      if (!isValid) {
        return;
      }

      await executeSave();
    }
  };

  const fetchProduct = async () => {
    if (productId && productId !== 0) {
      const result = await fetchProductById(productId);
      const product: ProductModel = result.data.product;
      setNewProduct({
        product_id: product.product_id,
        name: product.name,
        tags: product.tags,
        date_modified: new Date(),
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

  useEffect(() => {
    if (productId && productId !== 0) {
      (async () => {
        try {
          await fetchProduct();
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
        <DialogTitle>Create new product</DialogTitle>
        <DialogContent>
          <Card
            sx={{
              "& .MuiTextField-root": { m: 1 },
              paddingBottom: "4px",
              backgroundColor: "hsl(0deg 0% 100%)",
            }}
          >
            <CardHeader
              title="Product"
              subheader={
                <Typography sx={{ marginTop: 1 }}>New product</Typography>
              }
            />
            <CardContent sx={{ paddingTop: "16px", paddingLeft: "16px" }}>
              <Grid container spacing={1} size={10}>
                <Grid size={12}>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <TextField
                    id="name"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="Pastry"
                    color={errors.name ? "error" : "primary"}
                    error={!!errors.name}
                    helperText={errors.name || ""}
                    value={newProduct.name}
                    onChange={handleChange}
                    InputProps={{
                      inputProps: {
                        maxLength: 100,
                      },
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <FormLabel htmlFor="tags">Tags</FormLabel>
                  <TextField
                    id="tags"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="Sugar"
                    color={errors.tags ? "error" : "primary"}
                    error={!!errors.tags}
                    helperText={errors.tags || ""}
                    value={newProduct.tags}
                    onChange={handleChange}
                    InputProps={{
                      inputProps: {
                        maxLength: 120,
                      },
                    }}
                  />
                </Grid>

                <Grid size={6}></Grid>
              </Grid>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={executeSaveProduct}>Save Products</Button>
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

export default Product;
