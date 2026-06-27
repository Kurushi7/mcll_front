import { Alert, Box, Snackbar } from "@mui/material";
import React, { useEffect, useState } from "react";
import PersonForm from "./personForm";
import {
  fetchPersonById,
  savePerson,
  updatePerson,
} from "../../composables/persons/Persons";
import { PersonModel, PortModel } from "../../types/request";
import { AxiosError, AxiosResponse } from "axios";
import { getPortList } from "../../composables/persons/Ports";

interface PersonProps {
  personType: string;
  personId?: number;
  supplierId?: number;
  setParentPersonId?: React.Dispatch<React.SetStateAction<number>>;
  parentId?: number;
  personData: AxiosResponse | undefined;
}

const Person: React.FC<PersonProps> = ({
  personType,
  personId,
  supplierId,
  setParentPersonId,
  parentId,
}) => {
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const [portOptions, setPortOptions] = useState<
    { id: number; name: string }[]
  >([]);

  const [newPerson, setNewPerson] = useState<PersonModel>({
    first_name: "",
    last_name: "",
    city: "",
    country: "",
    address_line1: "",
    address_line2: "",
    phone1: "",
    phone2: "",
    fax: "",
    watsapp_no: "",
    email: "",
    type: "",
    id_linked_to: 0,
  });

  const setParentId = (
    result: AxiosResponse<any, any> | AxiosError | undefined,
  ) => {
    if (
      ["supplier", "consignee", "agent"].includes(personType) &&
      result &&
      result.status === 200
    ) {
      if (setParentPersonId && "data" in result) {
        if ("person" in result.data) {
          setParentPersonId(result.data.person.person_id);
        } else {
          setParentPersonId(result.data.person_id);
        }
      }
    }
  };

  const getAllPorts = async () => {
    const result = await getPortList({
      limit: 0,
      offset: 0,
      filter: [],
      sort: [
        {
          field: "port_id",
          sort: "desc",
        },
      ],
    });

    const ports: PortModel[] = result.data.data;
    const transformedPorts = ports
      .filter((port) => port.port_id)
      .map((port) => {
        return {
          id: port.port_id!,
          name: port.name,
        };
      });

    setPortOptions(transformedPorts);
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
        fax: person.fax,
        watsapp_no: person.watsapp_no,
        email: person.email,
        type: person.type,
        id_linked_to: supplierId ?? 0,
        ...(person.port_ids ? { port_ids: person.port_ids } : {}),
      });

      setParentId(result);
    }
  };

  const handleSavePerson = async (newPerson: PersonModel) => {
    newPerson.type = personType;
    let result: AxiosResponse<any, any> | AxiosError | undefined = undefined;
    if (personId || parentId) {
      newPerson.person_id = parentId ?? personId;
      result = await updatePerson(newPerson);
    } else {
      result = await savePerson(newPerson);
    }

    setParentId(result);

    return result;
  };

  const postSaveOperations = (result: AxiosResponse | AxiosError) => {
    if (!result) return;

    if (result.status) {
      if (result.status === 200) {
        setSnackMessage({
          message: `${personType} saved successfully`,
          severity: "success",
        });
      } else if (result.status === 204) {
        setSnackMessage({
          message: `${personType} updated successfully`,
          severity: "success",
        });
      }
      setOpenSnackBar(true);
    } else {
      setSnackMessage({
        message: `Error while saving ${personType}`,
        severity: "error",
      });
      setOpenSnackBar(true);
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

  let header = "Supplier";
  let subHeader = "Create new supplier";

  if (personType === "consignee") {
    header = "Consignee";
    subHeader = "Create new consignee";
  } else if (personType === "agent") {
    header = "Agent";
    subHeader = "Create new agent";
  }

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

    if (personType === "supplier") {
      (async () => {
        try {
          await getAllPorts();
        } catch (error) {
          setSnackMessage({
            message: "Error fetching ports",
            severity: "error",
          });
          setOpenSnackBar(true);
        }
      })();
    }
  }, []);

  return (
    <Box>
      <PersonForm
        header={header}
        subHeader={subHeader}
        savePerson={handleSavePerson}
        cardHeaderStyle={{}}
        showActions={true}
        triggerSave={false}
        person={newPerson}
        onSaveComplete={(result) => postSaveOperations(result)}
        portOptions={portOptions}
        personType={personType}
      />
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
    </Box>
  );
};

export default Person;
