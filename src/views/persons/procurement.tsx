import React, { useEffect, useRef, useState } from "react";
import PersonForm from "../../components/persons/personForm";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  Snackbar,
  ThemeProvider,
} from "@mui/material";
import {
  fetchPersonById,
  savePerson,
  updatePerson,
} from "../../composables/persons/Persons";
import { PersonModel } from "../../types/request";
import { TransitionProps } from "@mui/material/transitions";
import { AxiosError, AxiosResponse } from "axios";

interface ProcurementProps {
  open: boolean;
  onClose: (tab: number, result?: AxiosResponse | AxiosError) => void;
  personId?: number;
  parentPersonId?: number;
}

interface PersonRef {
  executeSavePerson: (event: Event) => void;
}

const Procurement: React.FC<ProcurementProps> = ({
  open,
  onClose,
  personId,
  parentPersonId,
}) => {
  const customTheme = createTheme(getTheme());
  const [triggerSave, setTriggerSave] = useState(false);
  const componentRef = useRef<PersonRef>(null);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
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
    id_linked_to: 0,
  });

  const saveProcurement = async (newPerson: PersonModel) => {
    newPerson.type = "procurement";
    if (personId && personId != 0) {
      newPerson.person_id = personId;
      return await updatePerson(newPerson);
    }

    newPerson.id_linked_to = parentPersonId;
    return await savePerson(newPerson);
  };

  const executePostSave = (result: AxiosResponse | AxiosError) => {
    setTriggerSave(false);
    onClose(1, result);
  };

  const fetchPerson = async () => {
    if (personId && personId !== 0) {
      const result = await fetchPersonById(personId);
      const person: PersonModel = result.data.person;
      setNewPerson({
        person_id: person.person_id,
        first_name: person.first_name,
        last_name: person.last_name,
        city: person.city,
        country: person.country,
        address_line1: person.address_line1,
        address_line2: person.address_line2,
        phone1: person.phone1,
        phone2: person.phone2,
        watsapp_no: person.watsapp_no,
        fax: person.fax,
        email: person.email,
        type: person.type,
        id_linked_to: parentPersonId ?? 0,
      });
    }
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

  const handleSave = (event: any) => {
    if (componentRef.current) {
      componentRef.current.executeSavePerson(event);
    }
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
    if (personId && personId !== 0) {
      (async () => {
        try {
          await fetchPerson();
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
        onClose={() => onClose(2)}
        maxWidth="md"
        hideBackdrop={true}
        slotProps={{
          paper: {
            sx: {
              maxHeight: "90vh",
            },
          },
        }}
      >
        <DialogTitle>Create new Procurement</DialogTitle>
        <DialogContent>
          <PersonForm
            header=""
            subHeader=""
            savePerson={saveProcurement}
            cardHeaderStyle={{}}
            showActions={false}
            triggerSave={triggerSave}
            onSaveComplete={(result) => executePostSave(result)}
            ref={componentRef}
            person={newPerson}
            personType="procurement"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave}>Save Procurement</Button>
          <Button onClick={() => onClose(2)}>Close</Button>
        </DialogActions>
      </Dialog>
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
    </ThemeProvider>
  );
};

export default Procurement;
