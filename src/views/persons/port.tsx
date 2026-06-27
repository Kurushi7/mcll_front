import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormLabel,
  Grid2,
  MenuItem,
  Select,
  SelectChangeEvent,
  Snackbar,
  TextField,
  ThemeProvider,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { PortModel } from "../../types/request";
import {
  addPort,
  getPortById,
  updatePort,
} from "../../composables/persons/Ports";
import { AxiosError, AxiosResponse } from "axios";
import { validateForm } from "../../composables/product/FormValidation";
import { z } from "zod";
import { Check } from "@mui/icons-material";

interface PortProps {
  open: boolean;
  onClose: (result?: AxiosResponse | AxiosError) => void;
  portId?: number;
}

const Port: React.FC<PortProps> = ({ open, onClose, portId }) => {
  const customTheme = createTheme(getTheme());
  const [errors, setErrors] = useState<Record<string, string | null>>({
    name: "",
    code: "",
  });

  const [newPort, setNewPort] = useState<PortModel>({
    name: "",
    code: "",
    type: "loading",
    default: false,
  });
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });

  const typeOptions = [
    {
      id: "loading",
      label: "loading",
    },
    {
      id: "unloading",
      label: "unloading",
    },
  ];

  const fetchPort = async () => {
    if (portId && portId !== 0) {
      const result = await getPortById(portId);
      const port: PortModel = result.data.port;
      setNewPort({
        name: port.name,
        code: port.code,
        type: port.type,
        default: port.default,
      });
    }
  };

  const formSchema = z.object({
    name: z.string().min(3, "The port name is required"),
    code: z.string().min(3, "The port code is required"),
  });

  const handleAddPort = async () => {
    let result: AxiosResponse<any, any> | undefined = undefined;

    const isValid = validateForm(formSchema, newPort, setErrors);

    if (!isValid) {
      return;
    }

    if (portId && portId !== 0) {
      const updatedPort = { ...newPort };
      updatedPort.port_id = portId;
      result = await updatePort(updatedPort);
    } else {
      result = await addPort(newPort);
    }

    onClose(result);
  };

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    if (event) {
      const newType = event.target?.value as PortModel["type"];

      setNewPort((prevPort) => ({
        ...prevPort,
        type: newType,
      }));
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

  const handleCheckboxChange = (event: any) => {
    setNewPort((prevPort) => ({ ...prevPort, default: event.target.checked }));
  };

  useEffect(() => {
    if (portId && portId !== 0) {
      (async () => {
        try {
          await fetchPort();
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
        <DialogTitle>Create new ports</DialogTitle>
        <DialogContent>
          <Card
            sx={{
              "& .MuiTextField-root": { m: 1 },
              paddingBottom: "4px",
              backgroundColor: "hsl(0deg 0% 100%)",
            }}
          >
            <CardHeader
              title="Port"
              sx={{
                borderBottom: "1px solid",
                paddingBottom: "16px",
              }}
            />
            <CardContent sx={{ paddingTop: "16px" }}>
              <Grid2 container spacing={1} offset={1} size={8}>
                <Grid2 size={8}>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <TextField
                    id="name"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="Port louis"
                    color={errors.name ? "error" : "primary"}
                    error={!!errors.name}
                    helperText={errors.name || ""}
                    value={newPort.name}
                    onChange={(event) =>
                      setNewPort({ ...newPort, name: event.target.value })
                    }
                    InputProps={{
                      inputProps: {
                        maxLength: 20,
                      },
                    }}
                  />
                </Grid2>
                <Grid2 size={4} />

                <Grid2 size={8}>
                  <FormLabel htmlFor="code">Code</FormLabel>
                  <TextField
                    id="code"
                    autoFocus
                    size="small"
                    fullWidth
                    required
                    placeholder="A34864"
                    color={errors.code ? "error" : "primary"}
                    error={!!errors.code}
                    helperText={errors.code || ""}
                    value={newPort.code}
                    onChange={(event) =>
                      setNewPort({ ...newPort, code: event.target.value })
                    }
                    InputProps={{
                      inputProps: {
                        maxLength: 10,
                      },
                    }}
                  />
                </Grid2>
                <Grid2 size={4} />

                <Grid2 size={6}>
                  <FormLabel htmlFor="Type">Type</FormLabel>
                  <Select
                    labelId="Type"
                    value={newPort.type || ""}
                    onChange={handleTypeChange}
                    label="Select an option"
                    variant="outlined"
                    color={errors.type ? "error" : "primary"}
                    error={!!errors.type}
                    size="small"
                  >
                    {typeOptions &&
                      typeOptions.map((option, index) => {
                        return (
                          <MenuItem key={index} value={option.id}>
                            {option.label}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </Grid2>

                <Grid2 size={6}>
                  <FormControlLabel
                    label="Default"
                    control={
                      <Checkbox
                        checked={newPort.default}
                        onChange={handleCheckboxChange}
                      />
                    }
                    labelPlacement="start"
                  />
                </Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button type="submit" variant="contained" onClick={handleAddPort}>
            Save Port
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

export default Port;
