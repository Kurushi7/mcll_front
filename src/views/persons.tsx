import { Alert, Box, Snackbar, Tab, Tabs, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import getTheme from "../theme/themeCustomizations";
import React, { useEffect, useState } from "react";
import Person from "../components/persons/person";
import OwnersList from "./persons/ownersList";
import { useLocation, useParams } from "react-router-dom";
import ProcurementList from "./persons/procurementList";
import PriceList from "./persons/priceList";
import {
  fetchAllRelatedPersons,
  fetchCompanyDetails,
} from "../composables/persons/Persons";
import { AxiosResponse } from "axios";
import Company from "./persons/company";
import { TabContext, TabPanel } from "@mui/lab";

interface PersonProps {
  personType: string;
}

const Persons: React.FC<PersonProps> = (personProps) => {
  const location = useLocation();
  const customTheme = createTheme(getTheme());
  const [selectedTab, setSelectedTab] = useState(0);
  const { id } = useParams<{ id?: string }>();
  const numericId = id ? parseInt(id, 10) : undefined;
  const [parentPersonId, setParentPersonId] = useState<number>(0);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [relatedPersons, setRelatedPersons] = React.useState<AxiosResponse>();
  const [companyDetails, setCompanyDetails] = React.useState<AxiosResponse>();
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });

  let tabConfig = [
    {
      label: "Supplier",
      component: (
        <Person
          personType="supplier"
          personId={numericId}
          setParentPersonId={setParentPersonId}
          personData={relatedPersons}
          parentId={parentPersonId}
        />
      ),
      keepMounted: true,
    },
    {
      label: "Owner",
      component: <OwnersList parentPersonId={parentPersonId} />,
    },
    {
      label: "Procurement",
      component: <ProcurementList parentPersonId={parentPersonId} />,
    },
    {
      label: "Company",
      component: (
        <Company
          setMessage={setSnackMessage}
          companyData={companyDetails}
          personId={parentPersonId}
        />
      ),
      keepMounted: true,
    },
    {
      label: "Prices",
      component: <PriceList parentPersonId={parentPersonId} />,
    },
  ];

  if (personProps.personType === "consignee") {
    tabConfig = [
      {
        label: "Consignee",
        component: (
          <Person
            personType="consignee"
            personId={numericId}
            setParentPersonId={setParentPersonId}
            parentId={parentPersonId}
            personData={relatedPersons}
          />
        ),
      },
      {
        label: "Owner",
        component: <OwnersList parentPersonId={parentPersonId} />,
      },
      {
        label: "Procurement",
        component: <ProcurementList parentPersonId={parentPersonId} />,
      },
      {
        label: "Prices",
        component: <PriceList parentPersonId={parentPersonId} />,
      },
    ];
  } else if (personProps.personType === "agent") {
    tabConfig = [
      {
        label: "Agent",
        component: (
          <Person
            personType="agent"
            personId={numericId}
            setParentPersonId={setParentPersonId}
            personData={relatedPersons}
            parentId={parentPersonId}
          />
        ),
      },
      {
        label: "Owner",
        component: <OwnersList parentPersonId={parentPersonId} />,
      },
      {
        label: "Procurement",
        component: <ProcurementList parentPersonId={parentPersonId} />,
      },
      {
        label: "Prices",
        component: <PriceList parentPersonId={parentPersonId} />,
      },
    ];
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleClose = (
    event: React.SyntheticEvent<any> | Event,
    reason?: string,
  ) => {
    console.log("closing", event, reason);
    if (reason === "clickaway") {
      return; // Prevent close on clickaway
    }
    setOpenSnackBar(false);
  };

  const fetchCompanyData = async () => {
    if (numericId && numericId !== 0) {
      const result = await fetchCompanyDetails(numericId);
      if (result && result.data) {
        setCompanyDetails(result);
      }
    }
  };

  const fetchAllRelatedPersonDetails = async () => {
    if (numericId && numericId !== 0) {
      const result = await fetchAllRelatedPersons(numericId);
      if (result && result.data) {
        setRelatedPersons(result.data);
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabIndex = params.get("tab");
    if (tabIndex) {
      setSelectedTab(parseInt(tabIndex, 10));
    }
  }, [location.search]);

  useEffect(() => {
    (async () => {
      try {
        await fetchCompanyData();
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackMessage({
          message: "Error fetching data",
          severity: "error",
        });
        setOpenSnackBar(true);
      }
    })();

    (async () => {
      try {
        await fetchAllRelatedPersonDetails();
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackMessage({
          message: "Error fetching data",
          severity: "error",
        });
        setOpenSnackBar(true);
      }
    })();
  }, []);

  return (
    <ThemeProvider theme={customTheme}>
      <TabContext value={selectedTab}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          {tabConfig.map((item, index) => (
            <Tab
              key={index}
              label={item.label}
              value={index}
              disabled={item.label !== "supplier" && !parentPersonId}
            ></Tab>
          ))}
        </Tabs>

        {tabConfig.map((item, index) => (
          <TabPanel
            key={index}
            value={index}
            keepMounted={item.keepMounted ?? false}
          >
            <Box>{tabConfig[index].component}</Box>
          </TabPanel>
        ))}
      </TabContext>

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

export default Persons;
