import React, { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  addShipmentProcess,
  getShipmentProcessList,
  updateShipmentProcess,
} from "../../composables/processFlow/processFlow.tsx";
import { ListFilter } from "../../types/table.ts";
import {
  PipelineCell,
  StepStatus,
} from "../../components/processFlow/pipelineCell.tsx";
import DynamicFormOverlay, { ProcessStepType } from "./dynamicFormOverlay.tsx";
import { ShipmentProcessModel } from "../../types/request.ts";
import { Alert, Button, Snackbar } from "@mui/material";
import { getAllUsers } from "../../composables/users.tsx";

interface ProcessRow {
  shipment_process_id: number;
  client_identification: StepStatus;
  booking_ref: string;
  booking_instructions: StepStatus;
  document_entries: StepStatus;
  tracking: StepStatus;
  custom_clearance: StepStatus;
  delivery_haulage: StepStatus;
  billing_debtors: StepStatus;
  documents: string;
  client_id: number;
  client_name: string;
  booking_confirmation: boolean;
  booking_done: boolean;
  release_order: boolean;
  haulage_date: Date;
  remark: string;
  clearance_remarks: string;
  tas: string;
  noa: string;
  delivery_note: string;
  arrival_date: Date;
  eta: Date;
  de_user_id: number;
  t_user_id: number;
  cc_user_id: number;
  dh_user_id: number;
  bd_user_id: number;
}

const columnHelper = createColumnHelper<ProcessRow>();

const stepFields = [
  "client_identification",
  "booking_instructions",
  "document_entries",
  "tracking",
  "custom_clearance",
  "delivery_haulage",
  "billing_debtors",
];

const ProcessLayout: React.FC<any> = () => {
  const [data, setData] = useState<ProcessRow[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [userList, setUserList] = useState([]);

  const [processData, setProcessData] = useState<{
    rowId: number;
    columnId: keyof ProcessStepType;
    initialData: ProcessRow;
  } | null>(null);

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const [openSnackBar, setOpenSnackBar] = React.useState(false);

  const getColumnWidth = (columnId: string) => {
    const match = pipelineConfigs.find((c) => c.accessor === columnId);
    return match?.width;
  };

  const handleClose = (
    _event: React.SyntheticEvent<any> | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  const pipelineConfigs = [
    {
      accessor: "shipment_process_id" as const,
      header: "Id",
      hasWindow: false,
      width: "3%",
    },
    {
      accessor: "client_identification" as const,
      header: "Client Identification",
      hasWindow: false,
      hidden: false,
    },
    {
      accessor: "booking_instructions" as const,
      header: "Booking instruction",
      hasWindow: false,
      hidden: false,
    },
    {
      accessor: "document_entries" as const,
      header: "Document entries",
      hasWindow: true,
      hidden: false,
    },
    {
      accessor: "tracking" as const,
      header: "Tracking",
      hasWindow: false,
      hidden: false,
    },
    {
      accessor: "custom_clearance" as const,
      header: "Custom clearance",
      hasWindow: false,
      hidden: false,
    },
    {
      accessor: "delivery_haulage" as const,
      header: "Delivery & haulage",
      hasWindow: false,
      hidden: false,
    },
    {
      accessor: "billing_debtors" as const,
      header: "Billing",
      hasWindow: false,
      hidden: false,
    },
  ];

  const columns = useMemo(() => {
    return pipelineConfigs
      .filter((c) => !c.hidden)
      .map((config) =>
        columnHelper.accessor(config.accessor, {
          header: config.header,

          cell: ({ row, getValue }) => {
            if (!stepFields.includes(config.accessor)) {
              return (
                <span style={{ padding: "0 8px", display: "inline-block" }}>
                  {String(getValue())}
                </span>
              );
            }

            const status = getValue() as StepStatus;
            const rowId = row.original.shipment_process_id;

            return (
              <PipelineCell
                status={status}
                rowId={rowId}
                field={config.accessor}
                rowData={row.original}
                onSegmentClick={(id, field) => {
                  setProcessData({
                    rowId: id,
                    columnId: field as keyof ProcessStepType,
                    initialData: row.original,
                  });
                }}
              />
            );
          },
        }),
      );
  }, [data]);

  const fetchShippingFlows = async (filter: ListFilter) => {
    const response = await getShipmentProcessList(filter);
    if (response && response.data) {
      const freshRows = response.data.data.map((row: any) => ({
        ...row,
      }));

      setData(freshRows);
      setTotalRows(response.data.total);
    } else {
      console.error("Api failed");
    }
  };

  const handleSaveFormFields = async (
    rowId: number,
    _columnId: keyof ProcessStepType,
    formPayload: Partial<ShipmentProcessModel>,
  ) => {
    const databasePayload = {
      shipment_process_id: rowId,
      ...formPayload,
    };

    const result = await updateShipmentProcess(databasePayload);

    if (result && (result.status === 204 || result.status === 200)) {
      const standardizedParams: ListFilter = {
        offset: pageIndex,
        limit: pageSize,
        filter: [],
        sort: [],
      };
      await fetchShippingFlows(standardizedParams); // Reload table data to show the updates
      setProcessData(null); // Close the form modal
    }
  };

  const [sorting, setSorting] = useState<SortingState>([
    { id: "shipment_process_id", desc: false },
  ]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),

    manualPagination: true,
    manualFiltering: true,
    rowCount: totalRows,
  });

  const saveShipmentProcess = async () => {
    const ShipmentFlow: ShipmentProcessModel = {
      shipment_id: 0,
      client_identification: "pending",
      booking_instructions: "pending",
      document_entries: "pending",
      tracking: "pending",
      custom_clearance: "pending",
      delivery_haulage: "pending",
      billing_debtors: "pending",
    };

    const result = await addShipmentProcess(ShipmentFlow);
    if (!result) return;

    if (result.status && result.status !== 200) {
      setSnackMessage({
        message: "Problem saving shipment process",
        severity: "error",
      });
      setOpenSnackBar(true);
      return;
    } else {
      setSnackMessage({
        message: "Shipment process created",
        severity: "success",
      });
      await fetchAllRecords();
      setOpenSnackBar(true);
      return;
    }
  };

  const fetchAllRecords = async () => {
    const standardizedParams: ListFilter = {
      offset: pageIndex,
      limit: pageSize,
      filter: [],
      sort: [],
    };
    await fetchShippingFlows(standardizedParams);
  };

  const fetchUserList = async () => {
    let users: any = null;

    const standardizedParams: ListFilter = {
      offset: pageIndex,
      limit: pageSize,
      filter: [
        {
          value: "admin",
          field: "type",
          operator: "not_equals",
          logicOperator: "or",
        },
      ],
      sort: [],
    };

    try {
      users = await getAllUsers(standardizedParams);
    } catch (err) {
      setSnackMessage({
        message: `Error fetching data: ${err}`,
        severity: "error",
      });
      setOpenSnackBar(true);
    }

    if (users) {
      setUserList(users.data.data);
    } else {
      setSnackMessage({
        message: `Error userList`,
        severity: "error",
      });
      setOpenSnackBar(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset page count on fresh filter query
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    (async () => {
      try {
        await fetchAllRecords();
        await fetchUserList();
      } catch (error) {
        console.error(error);
      }
    })();
  }, [pageIndex, pageSize, debouncedSearch]);

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        color: "#0f172a",
      }}
    >
      {/* Upper Controls Toolbar */}
      <div style={{ marginBottom: "28px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            color: "#94a3b8",
            marginBottom: "8px",
          }}
        >
          Search Active Processes
        </label>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Filter by process ID..."
            style={{
              padding: "12px 16px",
              width: "300px",
              backgroundColor: "#ffffff",
              color: "#1e293b",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              outline: "none",
            }}
          />
          <Button
            type="submit"
            variant="outlined"
            onClick={() => saveShipmentProcess()}
          >
            Create new process
          </Button>
        </div>
      </div>

      {/* Main Grid Surface Wrapper */}
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "10px 10px 0 0",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            tableLayout: "fixed",
          }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{
                  backgroundColor: "#f1f5f9",
                  borderBottom: "2px solid #e2e8f0",
                }}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      padding: "16px",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#475569",
                      width: getColumnWidth(header.column.id),
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  No active items matched the server query.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} style={{ height: "42px" }}>
                  {row.getVisibleCells().map((cell, index, array) => {
                    const isFirstColumn = index === 1;
                    const isLastColumn = index === array.length - 1;

                    return (
                      <td
                        key={cell.id}
                        style={{
                          padding: 0,
                          height: "100%",
                          verticalAlign: "middle",
                          borderBottom: "1px solid #e2e8f0",
                          paddingLeft: isFirstColumn ? "8px" : "0px",
                          paddingRight: isLastColumn ? "8px" : "0px",
                        }}
                      >
                        <div
                          className="pipeline-cell-wrapper"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            height: "100%",
                            boxSizing: "border-box",
                            borderTopLeftRadius: isFirstColumn ? "99px" : "0px",
                            borderBottomLeftRadius: isFirstColumn
                              ? "99px"
                              : "0px",
                            borderTopRightRadius: isLastColumn ? "99px" : "0px",
                            borderBottomRightRadius: isLastColumn
                              ? "99px"
                              : "0px",
                            overflow: "hidden",
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DynamicFormOverlay
        activeForm={processData}
        onClose={() => setProcessData(null)}
        onSave={handleSaveFormFields}
        userList={userList}
        setProcessData={setProcessData}
      />

      {/* Server Pagination Toolbar Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 16px",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          fontSize: "13px",
          color: "#475569",
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            style={{
              backgroundColor: "#ffffff",
              color: "#1e293b",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              padding: "4px 8px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span>
            Page <strong>{pageIndex + 1}</strong> of{" "}
            <strong>{table.getPageCount() || 1}</strong>
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              style={{
                padding: "6px 12px",
                backgroundColor: table.getCanPreviousPage()
                  ? "#f8fafc"
                  : "#f1f5f9",
                color: table.getCanPreviousPage() ? "#0f172a" : "#94a3b8",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                cursor: table.getCanPreviousPage() ? "pointer" : "not-allowed",
                fontSize: "12px",
                boxShadow: table.getCanPreviousPage()
                  ? "0 1px 2px rgba(0,0,0,0.05)"
                  : "none",
                fontWeight: "500",
              }}
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              style={{
                padding: "6px 12px",
                backgroundColor: table.getCanNextPage() ? "#f8fafc" : "#f1f5f9",
                color: table.getCanNextPage() ? "#0f172a" : "#94a3b8",
                border: "1px solid #cbd5e1",
                borderRadius: "4px",
                cursor: table.getCanNextPage() ? "pointer" : "not-allowed",
                fontSize: "12px",
                boxShadow: table.getCanNextPage()
                  ? "0 1px 2px rgba(0,0,0,0.05)"
                  : "none",
                fontWeight: "500",
              }}
            >
              Next
            </button>

            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </div>
        </div>
      </div>
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
    </div>
  );
};

export default ProcessLayout;
