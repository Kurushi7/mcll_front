import React, { useEffect } from "react";
import { createTheme } from "@mui/material/styles";
import getTheme from "../../theme/themeCustomizations";
import { ButtonList, Column, ListFilter } from "../../types/table";
import ListConstants from "../../composables/constants/table";
import { AxiosError, AxiosResponse } from "axios";
import {
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  SnackbarCloseReason,
  ThemeProvider,
} from "@mui/material";
import SmartButtonOutlinedIcon from "@mui/icons-material/SmartButtonOutlined";
import DataTable from "../DataTable";
import ContainerLineForm from "./ContainerLineForm";
import {
  deleteContainerLine,
  getContainerLinesList,
} from "../../composables/shippings/ContainerLines";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";

interface Props {
  shipmentHblId?: string;
  shipmentId?: number;
  reloadData: boolean;
  setReloadData: React.Dispatch<React.SetStateAction<boolean>>;
}

const ContainerLines: React.FC<Props> = ({
  shipmentHblId,
  shipmentId,
  reloadData,
  setReloadData,
}) => {
  const [open, setOpen] = React.useState(false);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const customTheme = createTheme(getTheme());
  const [containerLineId, setContainerLineId] = React.useState();

  const columns: Column[] = [
    { field: "container_line_id", headerName: "", hidden: true },
    {
      field: "seal_no",
      headerName: "Seal no",
      operators: [
        {
          name: ListConstants.CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.NOT_CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.STARTS_WITH,
          component: "text",
        },
        {
          name: ListConstants.ENDS_WITH,
          component: "text",
        },
      ],
      flex: 1,
    },
    {
      field: "no_of_packages",
      headerName: "Packages",
      operators: [
        {
          name: ListConstants.EQUALS,
          component: "number",
        },
        {
          name: ListConstants.NOT_EQUALS,
          component: "number",
        },
        {
          name: ListConstants.GREATER_THAN,
          component: "number",
        },
        {
          name: ListConstants.EQUAL_OR_GREATER_THAN,
          component: "number",
        },
        {
          name: ListConstants.LESS_THAN,
          component: "number",
        },
        {
          name: ListConstants.EQUAL_OR_LESS_THAN,
          component: "number",
        },
      ],
      flex: 1,
    },
    {
      field: "weight",
      headerName: "Weight",
      operators: [
        {
          name: ListConstants.EQUALS,
          component: "number",
        },
        {
          name: ListConstants.NOT_EQUALS,
          component: "number",
        },
        {
          name: ListConstants.GREATER_THAN,
          component: "number",
        },
        {
          name: ListConstants.EQUAL_OR_GREATER_THAN,
          component: "number",
        },
        {
          name: ListConstants.LESS_THAN,
          component: "number",
        },
        {
          name: ListConstants.EQUAL_OR_LESS_THAN,
          component: "number",
        },
      ],
      flex: 1,
    },
    {
      field: "measurement",
      headerName: "Measurement",
      operators: [
        {
          name: ListConstants.CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.NOT_CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.STARTS_WITH,
          component: "text",
        },
        {
          name: ListConstants.ENDS_WITH,
          component: "text",
        },
      ],
      flex: 1,
    },
    {
      field: "size",
      headerName: "Size",
      operators: [
        {
          name: ListConstants.EQUALS,
          component: "number",
        },
        {
          name: ListConstants.NOT_EQUALS,
          component: "number",
        },
        {
          name: ListConstants.GREATER_THAN,
          component: "number",
        },
        {
          name: ListConstants.EQUAL_OR_GREATER_THAN,
          component: "number",
        },
        {
          name: ListConstants.LESS_THAN,
          component: "number",
        },
        {
          name: ListConstants.EQUAL_OR_LESS_THAN,
          component: "number",
        },
      ],
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      operators: [
        {
          name: ListConstants.CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.NOT_CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.STARTS_WITH,
          component: "text",
        },
        {
          name: ListConstants.ENDS_WITH,
          component: "text",
        },
      ],
      flex: 1,
    },
    {
      field: "marks_numbers",
      headerName: "Marks no",
      operators: [
        {
          name: ListConstants.CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.NOT_CONTAINS,
          component: "text",
        },
        {
          name: ListConstants.STARTS_WITH,
          component: "text",
        },
        {
          name: ListConstants.ENDS_WITH,
          component: "text",
        },
      ],
      flex: 1,
    },
    {
      field: "",
      headerName: "Actions",
      type: "action",
      flex: 1,
      renderCell: (params) => <ActionDropdown row={params.row} />,
    },
  ];

  const hiddenColumns = {
    container_line_id: false,
  };

  const handleFetchData = async (filter: ListFilter) => {
    if (shipmentHblId) {
      filter.filter = [
        {
          field: "shipment_hbl_id",
          value: shipmentHblId,
          operator: ListConstants.EQUALS,
          logicOperator: "and",
        },
      ];
    } else if (shipmentId) {
      filter.filter = [
        {
          field: "shipment_id",
          value: shipmentId,
          operator: ListConstants.EQUALS,
          logicOperator: "and",
        },
      ];
    }

    filter.filter = [
      ...filter.filter,
      {
        field: "deleted",
        value: false,
        operator: "equals",
        logicOperator: "and",
      },
    ];

    return getContainerLinesList(filter);
  };

  const handleAfterSave = (result?: AxiosResponse | AxiosError) => {
    setOpen(false);

    if (!result) return;

    if (result.status) {
      if (result.status === 200) {
        setSnackMessage({
          message: `Container lines saved successfully`,
          severity: "success",
        });
      } else if (result.status === 204) {
        setSnackMessage({
          message: `Container lines updated successfully`,
          severity: "success",
        });
      }
      setReloadData(true);
      setOpenSnackBar(true);
      setReloadData(true);
    } else {
      setSnackMessage({
        message: `Error while saving container lines`,
        severity: "error",
      });
      setOpenSnackBar(true);
    }
  };

  const actions: ButtonList[] = [
    {
      key: "create-container-lines",
      handleOnClick: (_data?: any) => {
        setOpen(true);
      },
      label: "Create container line",
      style: { mt: 2 },
    },
  ];

  const ActionDropdown: React.FC<{ row: any }> = ({ row }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleAction = (selectedAction: string) => {
      handleMenuClose();
      if (selectedAction === "edit") {
        setContainerLineId(row.container_line_id);
        setOpen(true);
      } else if (selectedAction === "delete") {
        showContainerLineDeleteSwal(row.container_line_id);
      }
    };

    return (
      <>
        <IconButton size="small" onClick={(event) => handleMenuOpen(event)}>
          <SmartButtonOutlinedIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <MenuItem onClick={(_row) => handleAction("edit")}>Edit</MenuItem>
          <MenuItem onClick={(_row) => handleAction("delete")}>Delete</MenuItem>
        </Menu>
      </>
    );
  };

  const handleCloseSnackBar = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  useEffect(() => {
    setReloadData(true);
  }, [shipmentHblId]);

  const showContainerLineDeleteSwal = (containerLineId: number) => {
    withReactContent(Swal)
      .fire({
        icon: "warning",
        title: "Confirm deletion",
        confirmButtonText: "Yes",
        showCancelButton: true,
        denyButtonText: "No",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          await handleDeleteContainerLine(containerLineId);
        }
      });
  };

  const handleDeleteContainerLine = async (containerLineId: number) => {
    let result: AxiosResponse<any, any> | undefined = undefined;

    result = await deleteContainerLine(containerLineId);

    if (!result) return;

    if (result.status) {
      if (result.status === 204) {
        setSnackMessage({
          message: `Container line deleted`,
          severity: "success",
        });

        // reload the table after successful delete
        setReloadData(true);
      } else {
        setSnackMessage({
          message: `Problem deleting container line`,
          severity: "error",
        });
      }
      setOpenSnackBar(true);
    } else {
      setSnackMessage({
        message: `Problem deleting container line`,
        severity: "error",
      });
    }
    setOpenSnackBar(true);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <DataTable
        columns={columns}
        handleFetchData={handleFetchData}
        primaryKey="container_line_id"
        buttonList={actions}
        hiddenColumns={hiddenColumns}
        reloadData={reloadData}
        setReloadData={setReloadData}
      />
      <div>
        {open && (
          <ContainerLineForm
            open={open}
            onClose={(result) => handleAfterSave(result)}
            containerLinesId={containerLineId}
            shipmentId={shipmentId}
            shipmentHblId={shipmentHblId}
            setReloadData={setReloadData}
          />
        )}
      </div>
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

export default ContainerLines;
