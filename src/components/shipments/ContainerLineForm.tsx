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
  FormControl,
  FormLabel,
  Grid2,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  ThemeProvider,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { ContainerLinesModel } from "../../types/request";
import { AxiosError, AxiosResponse } from "axios";
import { validateForm } from "../../composables/product/FormValidation";
import { z } from "zod";
import {
  addContainerLine,
  getContainerLine,
  updateContainerLine,
} from "../../composables/shippings/ContainerLines";

interface ContainerLineProps {
  open: boolean;
  onClose: (result?: AxiosResponse | AxiosError) => void;
  containerLinesId?: number;
  shipmentHblId?: string;
  shipmentId?: number;
  setReloadData: React.Dispatch<React.SetStateAction<boolean>>;
}

const ContainerLine: React.FC<ContainerLineProps> = ({
  open,
  onClose,
  containerLinesId,
  shipmentHblId,
  shipmentId,
  setReloadData,
}) => {
  const customTheme = createTheme(getTheme());
  const [errors, setErrors] = useState<Record<string, string | null>>({
    container_no: "",
    seal_no: "",
    no_of_packages: "",
    weight: "",
    measurement: "",
    size: "",
    description: "",
    marks_numbers: "",
  });

  const [newContainerLine, setNewContainerLine] = useState<ContainerLinesModel>(
    {
      shipment_hbl_id: shipmentHblId ? parseInt(shipmentHblId, 10) : 0,
      container_no: "",
      seal_no: "",
      no_of_packages: 0,
      weight: 0,
      measurement: 0,
      size: "",
      description: "",
      marks_numbers: "",
    },
  );
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });

  const [containerSizeOptions, setContainerSizeOptions] = useState<
    { id: string; label: string }[]
  >([
    { id: "20D", label: "20 Ft Dry" },
    { id: "20R", label: "20 Ft Reefer" },
    { id: "40D", label: "40 Ft Dry" },
    { id: "40R", label: "40 Ft Reefer" },
  ]);

  const fetchContainerLine = async () => {
    if (containerLinesId && containerLinesId !== 0) {
      const result = await getContainerLine(containerLinesId);
      const containerLine: ContainerLinesModel = result.data.containerLine;
      setNewContainerLine({
        container_no: containerLine.container_no,
        seal_no: containerLine.seal_no,
        no_of_packages: containerLine.no_of_packages,
        weight: containerLine.weight,
        measurement: containerLine.measurement,
        size: containerLine.size,
        description: containerLine.description,
        marks_numbers: containerLine.marks_numbers,
        shipment_hbl_id: shipmentHblId
          ? parseInt(shipmentHblId, 10)
          : undefined,
        shipment_id: shipmentId ?? undefined,
      });
    }
  };

  const formSchema = z.object({
    container_no: z.string().min(3, "The container name is required"),
    seal_no: z.string().min(3, "The port code is required"),
  });

  const handleAddContainerLine = async () => {
    let result: AxiosResponse<any, any> | undefined = undefined;

    const isValid = validateForm(formSchema, newContainerLine, setErrors);

    if (!isValid) {
      return;
    }

    if (containerLinesId && containerLinesId !== 0) {
      const updatedContainerLine = { ...newContainerLine };
      updatedContainerLine.container_line_id = containerLinesId;
      result = await updateContainerLine(updatedContainerLine);

      setSnackMessage({
        message: "Updated container line",
        severity: "success",
      });
      setOpenSnackBar(true);
    } else {
      if (shipmentHblId) {
        newContainerLine.shipment_hbl_id = parseInt(shipmentHblId, 10);
      } else if (shipmentId) {
        newContainerLine.shipment_id = shipmentId;
      }

      result = await addContainerLine(newContainerLine);

      setNewContainerLine((prev) => ({
        ...prev,
        container_no: "",
        seal_no: "",
      }));

      setSnackMessage({
        message: "Added container line",
        severity: "success",
      });
      setOpenSnackBar(true);
    }

    if (!result) {
      setSnackMessage({
        message: "Error saving container line details",
        severity: "error",
      });
      setOpenSnackBar(true);
    } else {
      setReloadData(true);
    }
  };

  const handleChange = async (event: any, type: string) => {
    const { id, value } = event.target;

    const finalValue =
      type === "number"
        ? parseInt(value, 10)
        : type === "float"
          ? parseFloat(value)
          : value;

    setNewContainerLine((prevContainerLine) => ({
      ...prevContainerLine,
      [id]: finalValue,
    }));
  };

  const handleSelectChange = async (event: any) => {
    const { name, value } = event.target;

    setNewContainerLine((prevContainerLine) => ({
      ...prevContainerLine,
      [name]: value,
    }));
  };

  const handleCloseSnackBar = (
    event: React.SyntheticEvent<any> | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  useEffect(() => {
    if (containerLinesId && containerLinesId !== 0) {
      (async () => {
        try {
          await fetchContainerLine();
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
        <DialogTitle></DialogTitle>
        <DialogContent>
          <Card
            sx={{
              "& .MuiTextField-root": { m: 1 },
              paddingBottom: "4px",
              backgroundColor: "hsl(0deg 0% 100%)",
            }}
          >
            <CardHeader
              title="Container lines"
              sx={{
                borderBottom: "1px solid",
                paddingBottom: "16px",
              }}
            />
            <CardContent sx={{ paddingTop: "16px" }}>
              <Grid2 container spacing={1} offset={1} size={12}>
                <Grid2 size={4}>
                  <FormLabel htmlFor="container_no">Container no</FormLabel>
                  <TextField
                    id="container_no"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="CMA495"
                    color={errors.container_no ? "error" : "primary"}
                    error={!!errors.container_no}
                    helperText={errors.container_no || ""}
                    value={newContainerLine.container_no}
                    onChange={(event) => handleChange(event, "string")}
                    InputProps={{
                      inputProps: {
                        maxLength: 15,
                      },
                    }}
                  />
                </Grid2>

                <Grid2 size={4}>
                  <FormLabel htmlFor="seal_no">Seal no</FormLabel>
                  <TextField
                    id="seal_no"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="A34864"
                    color={errors.seal_no ? "error" : "primary"}
                    error={!!errors.seal_no}
                    helperText={errors.seal_no || ""}
                    value={newContainerLine.seal_no || ""}
                    onChange={(event) => handleChange(event, "string")}
                    InputProps={{
                      inputProps: {
                        maxLength: 12,
                      },
                    }}
                  />
                </Grid2>

                <Grid2 size={4}>
                  <FormLabel htmlFor="no_of_packages">No of packages</FormLabel>
                  <TextField
                    id="no_of_packages"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    type="number"
                    color={errors.no_of_packages ? "error" : "primary"}
                    error={!!errors.no_of_packages}
                    helperText={errors.no_of_packages || ""}
                    value={newContainerLine.no_of_packages}
                    onChange={(event) => handleChange(event, "number")}
                  />
                </Grid2>

                <Grid2 size={4}>
                  <FormLabel htmlFor="weight">Weight</FormLabel>
                  <TextField
                    id="weight"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    type="number"
                    color={errors.weight ? "error" : "primary"}
                    error={!!errors.weight}
                    helperText={errors.weight || ""}
                    value={newContainerLine.weight}
                    onChange={(event) => handleChange(event, "float")}
                  />
                </Grid2>

                <Grid2 size={4}>
                  <FormLabel htmlFor="measurement">Measurement</FormLabel>
                  <TextField
                    id="measurement"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="9000"
                    type="number"
                    color={errors.measurement ? "error" : "primary"}
                    error={!!errors.measurement}
                    helperText={errors.measurement || ""}
                    value={newContainerLine.measurement}
                    onChange={(event) => handleChange(event, "float")}
                    InputProps={{
                      inputProps: {
                        maxLength: 10,
                      },
                    }}
                  />
                </Grid2>

                <Grid2 size={4}>
                  <FormControl fullWidth error={!!errors.type}>
                    <FormLabel id="size">size</FormLabel>
                    <Select
                      id="size"
                      labelId="size"
                      name="size"
                      value={newContainerLine.size}
                      onChange={handleSelectChange}
                      label="Select an option"
                      variant="outlined"
                      size="small"
                      sx={{ pl: 1 }}
                    >
                      {containerSizeOptions &&
                        containerSizeOptions.map((option, index) => {
                          return (
                            <MenuItem key={index} value={option.id}>
                              {option.label}
                            </MenuItem>
                          );
                        })}
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <TextField
                    id="description"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="half container filled"
                    color={errors.description ? "error" : "primary"}
                    error={!!errors.description}
                    helperText={errors.description || ""}
                    value={newContainerLine.description || ""}
                    onChange={(event) => handleChange(event, "string")}
                    InputProps={{
                      inputProps: {
                        maxLength: 120,
                      },
                    }}
                  />
                </Grid2>

                <Grid2 size={6}>
                  <FormLabel htmlFor="marks_numbers">Marks & numbers</FormLabel>
                  <TextField
                    id="marks_numbers"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="544"
                    color={errors.marks_numbers ? "error" : "primary"}
                    error={!!errors.marks_numbers}
                    helperText={errors.marks_numbers || ""}
                    value={newContainerLine.marks_numbers || ""}
                    onChange={(event) => handleChange(event, "string")}
                    InputProps={{
                      inputProps: {
                        maxLength: 20,
                      },
                    }}
                  />
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button type="submit" onClick={handleAddContainerLine}>
            Save Container line
          </Button>
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

export default ContainerLine;
