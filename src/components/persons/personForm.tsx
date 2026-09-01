import {
  Autocomplete,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { PersonModel } from "../../types/request";
import { AxiosError, AxiosResponse } from "axios";
import { z } from "zod";
import { validateForm } from "../../composables/product/FormValidation";
import countries, { CountryType } from "../../lists/countries";

interface PersonProps {
  header: string;
  subHeader: string;
  cardHeaderStyle: NonNullable<unknown>;
  showActions: boolean;
  savePerson?: (person: PersonModel) => Promise<AxiosResponse | AxiosError>;
  updatePerson?: (person: PersonModel) => Promise<AxiosResponse | AxiosError>;
  triggerSave: boolean;
  onSaveComplete: (result: any) => void;
  person?: PersonModel; // only applicable for editing
  portOptions?: { id: number; name: string }[];
  personType: string;
}

interface PersonRef {
  executeSavePerson: (event: Event) => void;
}

const PersonForm = forwardRef<PersonRef, PersonProps>(
  (
    {
      header,
      subHeader,
      savePerson,
      cardHeaderStyle,
      showActions,
      triggerSave,
      onSaveComplete,
      person,
      updatePerson,
      portOptions,
      personType,
    },
    ref,
  ) => {
    const [errors, setErrors] = useState<Record<string, string | null>>({
      first_name: "",
      last_name: "",
      address_line1: "",
      address_line2: "",
      city: "",
      country: "",
      phone1: "",
      phone2: "",
      watsapp_no: "",
      fax: "",
      email: "",
      type: "",
      date_created: null,
      date_modified: null,
    });

    const formSchema = z.object({
      first_name: z.string().min(3, "First Name is required"), // Required field
      address_line1: z.string().min(1, "Address Line 1 is required"), // Required field
      address_line2: z.string().optional(), // Optional field
      city: z.string().min(1, "City is required"),
      country: z.string().min(1, "Country is required"),
      phone1: z
        .string()
        .min(1, "Phone1 is required")
        .regex(/^[+]?[0-9() -]{1,15}$/, "Please enter a valid phone number"),
      phone2: z
        .string()
        .optional()
        .refine(
          (val) =>
            val === "" ||
            (typeof val === "string" && /^[+]?[0-9() -]{1,15}$/.test(val)),
          {
            message: "Please enter a valid phone number",
          },
        ),
      watsapp_no: z
        .string()
        .min(1, "Watsapp number is required")
        .regex(/^[+]?[0-9() -]{1,15}$/, "Please enter a valid phone number"),
      email: z.string().email("Invalid email address"),
    });

    const [newPerson, setNewPerson] = useState<PersonModel>({
      first_name: "",
      last_name: "",
      city: "",
      country: "",
      address_line1: "",
      address_line2: "",
      phone1: "",
      phone2: "",
      watsapp_no: "",
      fax: "",
      email: "",
      type: "",
    });
    const [selectedPorts, setSelectedPorts] = useState<
      { id: number; name: string }[]
    >([]);

    const [selectedCountry, setSelectedCountry] = useState<CountryType | null>(
      null,
    );

    const executeSave = async () => {
      if (savePerson) {
        const portIds = selectedPorts.map((port) => port.id).join(",");
        setNewPerson({
          ...newPerson,
          port_ids: portIds,
        });

        const updatedPerson: PersonModel = {
          ...newPerson,
          port_ids: portIds,
        };

        const result = await savePerson(updatedPerson);
        onSaveComplete(result);
      }
    };

    const executeSavePerson = async (event: any) => {
      if (event) {
        event.stopPropagation();
        event.preventDefault();

        const isValid = validateForm(formSchema, newPerson, setErrors);

        if (!isValid) {
          return;
        }

        await executeSave();
      }
    };

    const handleChange = async (event: any) => {
      const { id, value } = event.target;
      setNewPerson((prevPerson) => ({
        ...prevPerson,
        [id]: value,
      }));
    };

    function capitalizeFirstLetter(str: string) {
      if (str && str.length > 0) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
      return str;
    }

    const handleCompanyChange = async (
      event: any,
      newValue: CountryType | null,
    ) => {
      setSelectedCountry(newValue);

      if (!newValue) {
        return;
      }

      let phoneNumber1 = newValue?.dial_code;
      if (
        newPerson.phone1 &&
        !newPerson.phone1.startsWith(newValue?.dial_code)
      ) {
        phoneNumber1 = newValue?.dial_code + newPerson.phone1;
      }

      let phoneNumber2 = newValue?.dial_code;
      if (
        newPerson.phone2 &&
        !newPerson.phone2.startsWith(newValue?.dial_code)
      ) {
        phoneNumber2 = newValue?.dial_code + newPerson.phone2;
      }

      setNewPerson({
        ...newPerson,
        country: newValue.name,
        phone1: phoneNumber1,
        phone2: phoneNumber2,
      });
    };

    useEffect(() => {
      if (triggerSave) {
        (async () => {
          try {
            await executeSave();
          } catch (error) {
            console.log("Error fetching person data");
          }
        })();
      }
    }, [triggerSave]);

    useEffect(() => {
      if (person) {
        const transformedPorts: { id: number; name: string }[] = [];

        if (person.port_ids && portOptions) {
          const ids = person.port_ids.split(",").map(Number); // Convert to array of numbers

          ids.forEach((id) => {
            const port = portOptions.find((p) => p.id === id); // Find matching port
            if (port) {
              transformedPorts.push(port); // Only push valid matches
            }
          });
        }

        setSelectedPorts(transformedPorts);
        setNewPerson(person);

        const country = countries.find(
          (country) => country.name === person.country,
        );
        setSelectedCountry(country || null);
      }
    }, [person]);

    useImperativeHandle(ref, () => ({
      executeSavePerson,
    }));

    return (
      <>
        <Card
          sx={{
            "& .MuiTextField-root": { m: 1 },
            paddingBottom: "4px",
            backgroundColor: "hsl(0deg 0% 100%)",
          }}
        >
          <CardHeader
            title={header}
            subheader={
              <Typography sx={{ marginTop: 1 }}>{subHeader ?? ""}</Typography>
            }
            sx={cardHeaderStyle}
          />
          <CardContent sx={{ paddingTop: "16px", paddingLeft: "16px" }}>
            {/*Persons form*/}

            <Grid container spacing={1} size={10}>
              <Grid size={6}>
                <FormLabel htmlFor="first_name">First name</FormLabel>
                <TextField
                  id="first_name"
                  autoFocus
                  size="small"
                  fullWidth
                  required
                  placeholder="John"
                  color={errors.first_name ? "error" : "primary"}
                  error={!!errors.first_name}
                  helperText={errors.first_name || ""}
                  value={newPerson.first_name}
                  onChange={handleChange}
                  slotProps={{
                    htmlInput: {
                      maxLength: 120,
                    },
                  }}
                />
              </Grid>

              <Grid size={6}>
                <FormLabel htmlFor="Last name">Last name</FormLabel>
                <TextField
                  id="last_name"
                  autoFocus
                  size="small"
                  fullWidth
                  placeholder="Doe"
                  color={errors.last_name ? "error" : "primary"}
                  error={!!errors.last_name}
                  helperText={errors.last_name || ""}
                  value={newPerson.last_name}
                  onChange={handleChange}
                  slotProps={{
                    htmlInput: {
                      maxLength: 20,
                    },
                  }}
                />
              </Grid>

              <Grid size={12}>
                <FormLabel htmlFor="addressLine1">Address line 1</FormLabel>
                <TextField
                  id="address_line1"
                  autoFocus
                  size="small"
                  required
                  fullWidth={true}
                  variant="outlined"
                  placeholder="Street name and number"
                  color={errors.address_line1 ? "error" : "primary"}
                  error={!!errors.address_line1}
                  helperText={errors.address_line1 || ""}
                  sx={{
                    width: "100%",
                  }}
                  value={newPerson.address_line1}
                  onChange={handleChange}
                  slotProps={{
                    htmlInput: {
                      maxLength: 100,
                    },
                  }}
                />
              </Grid>

              <Grid size={12}>
                <FormLabel htmlFor="addressLine2">Address line 2</FormLabel>
                <TextField
                  id="address_line2"
                  autoFocus
                  fullWidth
                  size="small"
                  required
                  variant="outlined"
                  placeholder="Apartment, suite, unit, etc. (optional)"
                  color={errors.address_line2 ? "error" : "primary"}
                  error={!!errors.address_line2}
                  helperText={errors.address_line2 || ""}
                  value={newPerson.address_line2}
                  onChange={handleChange}
                  slotProps={{
                    htmlInput: {
                      maxLength: 100,
                    },
                  }}
                />
              </Grid>

              <Grid size={6}>
                <FormLabel htmlFor="city">City</FormLabel>
                <TextField
                  id="city"
                  autoFocus
                  fullWidth
                  size="small"
                  required
                  variant="outlined"
                  placeholder="London"
                  color={errors.city ? "error" : "primary"}
                  error={!!errors.city}
                  helperText={errors.city || ""}
                  value={newPerson.city}
                  onChange={handleChange}
                  slotProps={{
                    htmlInput: {
                      maxLength: 30,
                    },
                  }}
                />
              </Grid>

              <Grid size={6}>
                <FormLabel htmlFor="country">Country</FormLabel>
                <Autocomplete
                  options={countries}
                  getOptionLabel={(option) => option.name}
                  value={selectedCountry}
                  onChange={(event, newValue) =>
                    handleCompanyChange(event, newValue)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      placeholder="Type a country name"
                    />
                  )}
                />
              </Grid>

              <Grid size={6}>
                <FormLabel htmlFor="phone1">Phone 1</FormLabel>
                <TextField
                  id="phone1"
                  type="tel"
                  autoFocus
                  fullWidth
                  size="small"
                  required
                  placeholder="98999999"
                  variant="outlined"
                  color={errors.phone1 ? "error" : "primary"}
                  error={!!errors.phone1}
                  helperText={errors.phone1 || ""}
                  value={newPerson.phone1}
                  onChange={handleChange}
                  slotProps={{
                    htmlInput: {
                      maxLength: 15,
                    },
                  }}
                />
              </Grid>

              <Grid size={6}>
                <FormLabel htmlFor="phone2">Phone 2</FormLabel>
                <TextField
                  id="phone2"
                  autoFocus
                  fullWidth
                  size="small"
                  placeholder="98999999"
                  variant="outlined"
                  color={errors.phone2 ? "error" : "primary"}
                  error={!!errors.phone2}
                  helperText={errors.phone2 || ""}
                  value={newPerson.phone2}
                  onChange={handleChange}
                  slotProps={{
                    htmlInput: {
                      maxLength: 15,
                    },
                  }}
                />
              </Grid>

              <Grid size={6}>
                <FormLabel htmlFor="watsapp_no">Watsapp no</FormLabel>
                <TextField
                  id="watsapp_no"
                  autoFocus
                  fullWidth
                  size="small"
                  placeholder="98999999"
                  variant="outlined"
                  color={errors.watsapp_no ? "error" : "primary"}
                  error={!!errors.watsapp_no}
                  helperText={errors.watsapp_no || ""}
                  value={newPerson.watsapp_no}
                  onChange={handleChange}
                  slotProps={{
                    htmlInput: {
                      maxLength: 15,
                    },
                  }}
                />
              </Grid>

              <Grid size={6}>
                <FormLabel htmlFor="fax">Fax</FormLabel>
                <TextField
                  id="fax"
                  autoFocus
                  fullWidth
                  size="small"
                  placeholder="(123) 67235623"
                  variant="outlined"
                  color={errors.fax ? "error" : "primary"}
                  error={!!errors.fax}
                  helperText={errors.fax || ""}
                  value={newPerson.fax}
                  onChange={handleChange}
                  slotProps={{
                    htmlInput: {
                      maxLength: 15,
                    },
                  }}
                />
              </Grid>

              <Grid size={6}>
                <FormLabel htmlFor="email">Email</FormLabel>
                <TextField
                  id="email"
                  autoFocus
                  fullWidth
                  size="small"
                  required
                  placeholder="jhon.doe@example.com"
                  variant="outlined"
                  color={errors.email ? "error" : "primary"}
                  error={!!errors.email}
                  helperText={errors.email || ""}
                  value={newPerson.email}
                  onChange={handleChange}
                  slotProps={{
                    htmlInput: {
                      maxLength: 120,
                    },
                  }}
                />
                <Grid />
              </Grid>

              {personType === "supplier" && <Grid size={6}></Grid>}

              {portOptions && portOptions.length !== 0 && (
                <Grid size={12}>
                  <Autocomplete
                    multiple
                    options={portOptions}
                    getOptionLabel={(option) => option.name}
                    value={selectedPorts}
                    onChange={(event, newValue) => setSelectedPorts(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        label="Port"
                        placeholder="Type a port name"
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid size={6}></Grid>

              {showActions && (
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
                    onClick={executeSavePerson}
                  >
                    {`Save ${capitalizeFirstLetter(personType)}`}
                  </Button>
                </CardActions>
              )}
            </Grid>
          </CardContent>
        </Card>
      </>
    );
  },
);

PersonForm.displayName = "PersonGenericForm";

export default PersonForm;
