import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  FormLabel,
  Grid2,
  Snackbar,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { CompanyModel, PersonModel } from "../../types/request";
import { saveCompany, updateCompany } from "../../composables/persons/Persons";
import { AxiosError, AxiosResponse } from "axios";
import { z } from "zod";
import { validateForm } from "../../composables/product/FormValidation";

interface CompanyProps {
  companyData: AxiosResponse | undefined;
  setMessage: React.Dispatch<
    React.SetStateAction<{
      message: string;
      severity: "success" | "info" | "warning" | "error" | undefined;
    }>
  >;
  personId: number;
}

const Company: React.FC<CompanyProps> = ({
  companyData,
  setMessage,
  personId,
}) => {
  const [insertedCompanyId, setInsertedCompanyId] = useState(0);
  const [companyErrors, setCompanyErrors] = useState<
    Record<string, string | null>
  >({
    name: "",
    email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    country: "",
  });

  const [company, setCompany] = useState<CompanyModel>({
    name: "",
    email: "",
    address_line1: "",
    address_line2: "",
    country: "",
    city: "",
    person_id: 0,
  });

  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });

  const handleSaveCompany = async () => {
    let result: AxiosResponse<any, any> | AxiosError | undefined = undefined;

    const isValid = validateForm(formSchema, company, setCompanyErrors);

    if (!isValid) {
      return;
    }

    if (insertedCompanyId) {
      setCompany({
        ...company,
        company_id: insertedCompanyId,
      });

      result = await updateCompany(company);

      if (!result) return;

      if (result.status && result.status === 204) {
        setSnackMessage({
          message: `Company updated successfully`,
          severity: "success",
        });
        if ("data" in result) {
          setInsertedCompanyId(result.data.companyId);
        }
      } else {
        setSnackMessage({
          message: `Error while updating company`,
          severity: "error",
        });
      }
    } else {
      result = await saveCompany(company);

      if (!result) return;

      if (result.status && result.status === 201) {
        setSnackMessage({
          message: `Company saved successfully`,
          severity: "success",
        });
        if ("data" in result) {
          setInsertedCompanyId(result.data.companyId);
        }
      } else {
        setSnackMessage({
          message: `Error while saving company`,
          severity: "error",
        });
      }
    }
    setOpenSnackBar(true);
  };

  const formSchema = z.object({
    name: z.string().min(3, "The product name is required"),
    email: z.string().email("Invalid email address"),
    address_line1: z.string().min(3, "The address line is required"),
    city: z.string().min(3, "The product name is required"),
    country: z.string().min(3, "The country is required"),
  });

  const handleChange = async (event: any) => {
    const { id, value } = event.target;
    setCompany((prevCompany) => ({
      ...prevCompany,
      [id]: value,
    }));
  };

  const handleClose = (
    event: React.SyntheticEvent<any> | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return; // Prevent close on clickaway
    }
    setOpenSnackBar(false);
  };

  useEffect(() => {
    setCompany((prevCompany) => ({
      ...prevCompany,
      person_id: personId,
    }));
  }, [personId]);

  useEffect(() => {
    if (companyData) {
      const result: CompanyModel = companyData.data.company;
      setCompany({
        company_id: result.company_id,
        name: result.name,
        email: result.email,
        address_line1: result.address_line1,
        address_line2: result.address_line2,
        country: result.country,
        city: result.city,
        person_id: personId,
      });

      if (result.company_id) {
        setInsertedCompanyId(result.company_id);
      }
    }
  }, [companyData]);

  return (
    <Card
      sx={{
        "& .MuiTextField-root": { m: 1 },
        paddingBottom: "4px",
        backgroundColor: "hsl(0deg 0% 100%)",
      }}
    >
      <CardContent sx={{ paddingTop: "16px" }}>
        <Grid2 container spacing={1} offset={1} size={8} sx={{ my: 2 }}>
          <Grid2 size={12}>
            <Divider variant="middle">Company info</Divider>
          </Grid2>
        </Grid2>

        <Grid2 container spacing={1} size={10} sx={{ paddingLeft: "16px" }}>
          {/* Company form*/}
          <Grid2 size={6}>
            <FormLabel htmlFor="name">Name</FormLabel>
            <TextField
              id="name"
              autoFocus
              size="small"
              fullWidth
              required
              placeholder="Company A"
              color={companyErrors.name ? "error" : "primary"}
              error={!!companyErrors.name}
              value={company.name}
              helperText={companyErrors.name || ""}
              onChange={handleChange}
              InputProps={{
                inputProps: {
                  maxLength: 70,
                },
              }}
            />
          </Grid2>
          <Grid2 size={6}>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              id="email"
              autoFocus
              fullWidth
              size="small"
              required
              placeholder="jhon.doe@example.com"
              variant="outlined"
              color={companyErrors.email ? "error" : "primary"}
              error={!!companyErrors.email}
              helperText={companyErrors.email || ""}
              value={company.email}
              onChange={handleChange}
              InputProps={{
                inputProps: {
                  maxLength: 120,
                },
              }}
            />
            <Grid2 />
          </Grid2>
          <Grid2 size={12}>
            <FormLabel htmlFor="address_line1">Address line 1</FormLabel>
            <TextField
              id="address_line1"
              autoFocus
              size="small"
              required
              fullWidth={true}
              variant="outlined"
              placeholder="Street name and number"
              color={companyErrors.address_line1 ? "error" : "primary"}
              error={!!companyErrors.address_line1}
              helperText={companyErrors.address_line1 || ""}
              value={company.address_line1}
              sx={{
                width: "100%",
              }}
              onChange={handleChange}
              InputProps={{
                inputProps: {
                  maxLength: 100,
                },
              }}
            />
          </Grid2>

          <Grid2 size={12}>
            <FormLabel htmlFor="address_line2">Address line 2</FormLabel>
            <TextField
              id="address_line2"
              autoFocus
              fullWidth
              size="small"
              required
              variant="outlined"
              placeholder="Apartment, suite, unit, etc. (optional)"
              color={companyErrors.address_line2 ? "error" : "primary"}
              error={!!companyErrors.address_line2}
              value={company.address_line2}
              helperText={companyErrors.address_line2 || ""}
              onChange={handleChange}
              InputProps={{
                inputProps: {
                  maxLength: 100,
                },
              }}
            />
          </Grid2>
          <Grid2 size={6}>
            <FormLabel htmlFor="city">City</FormLabel>
            <TextField
              id="city"
              autoFocus
              fullWidth
              size="small"
              required
              variant="outlined"
              placeholder="London"
              color={companyErrors.city ? "error" : "primary"}
              error={!!companyErrors.city}
              helperText={companyErrors.city || ""}
              value={company.city}
              onChange={handleChange}
              InputProps={{
                inputProps: {
                  maxLength: 16,
                },
              }}
            />
          </Grid2>

          <Grid2 size={6}>
            <FormLabel htmlFor="country">Country</FormLabel>
            <TextField
              id="country"
              autoFocus
              fullWidth
              size="small"
              required
              variant="outlined"
              placeholder="England"
              color={companyErrors.country ? "error" : "primary"}
              error={!!companyErrors.country}
              helperText={companyErrors.country || ""}
              value={company.country}
              onChange={handleChange}
              InputProps={{
                inputProps: {
                  maxLength: 20,
                },
              }}
            />
          </Grid2>

          <CardActions
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              my: 2,
            }}
          >
            <Button
              type="submit"
              variant="contained"
              onClick={() => handleSaveCompany()}
            >
              Save Company
            </Button>
          </CardActions>
        </Grid2>
      </CardContent>
      {openSnackBar && (
        <Snackbar
          open={openSnackBar}
          autoHideDuration={5000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity={snackMessage.severity}
            variant="filled"
          >
            {snackMessage.message}
          </Alert>
        </Snackbar>
      )}
    </Card>
  );
};

export default Company;
