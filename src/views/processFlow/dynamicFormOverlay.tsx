import React, { useEffect, useState } from "react";
import FileUploader from "../../components/processFlow/fileUploader.tsx";
import {
  Autocomplete,
  Box,
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import {
  HblFormModel,
  PersonCountry,
  ShipmentFormModel,
} from "../../types/ShipmentTypes.ts";
import { fetchPersonOptions } from "../../store/shipment/shipment.ts";
import { useAppDispatch } from "../../store/store.ts";
import { User } from "../../types/user.ts";
import { getShipmentList } from "../../composables/shippings/Shipments.ts";
import ListConstants from "../../composables/constants/table.ts";
import { FilterItem, ListFilter } from "../../types/table.ts";

export interface ProcessStepType {
  client_identification: string;
  booking_instructions: string;
  document_entries: string;
  tracking: string;
  custom_clearance: string;
  delivery_haulage: string;
  billing_debtors: string;
  departure_date: Date;
  arrival_date: Date;
  eta: Date;
}

interface ColumnOverlayProps {
  activeForm: {
    rowId: number;
    columnId: keyof ProcessStepType;
    initialData: any;
  } | null;
  onClose: () => void;
  onSave: (
    rowId: number,
    columnId: keyof ProcessStepType,
    payload: Record<string, any>,
  ) => void;
  userList: User[];
  setProcessData: (data: any) => void;
}

const blankItem: HblFormModel = {
  delivery_agent: null,
  movement_type: "fcl",
  shipper: null,
  transact_amount: 0,
  transact_note_ref: "",
  shipment_id: 0,
  hbl_no: "",
  consignee_id: 0,
  first_name: "",
  last_name: "",
  consignee: null,
  unstuffing_place: "",
  notify_party1: null,
  notify_party2: null,
};

const statusArr = ["completed", "pending", "other"];

export default function DynamicFormOverlay({
  activeForm,
  onClose,
  onSave,
  userList,
  setProcessData,
}: ColumnOverlayProps) {
  const dispatch = useAppDispatch();
  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const { columnId, initialData } = activeForm;
  const [consigneeList, setConsigneeList] = React.useState<PersonCountry[]>([]);
  const [shipmentHbl, setShipmentHbl] = useState<HblFormModel>(blankItem);
  const [selectedConsignee, setSelectedConsignee] = React.useState<PersonCountry| null>(null)
  const [noaUrlList, setNoaUrlList] = React.useState<
    { url: string; size: number }[]
  >([]);
  const [tasUrlList, setTasUrlList] = React.useState<
    { url: string; size: number }[]
  >([]);
  const [fileRefList, setFileRefList] = React.useState<
    { shipment_id: number; master_bl_ref: string }[]
  >([]);

  const [selectedFileRef, setSelectedFileRef] = useState<{
    shipment_id: number;
    master_bl_ref: string;
  } | null>(null);

  const [fileRefInput, setFileRefInput] = useState(initialData.file_ref ?? "");
  if (!activeForm) return null;

  const findConsignees = async (
    _event: React.SyntheticEvent,
    newValue: any,
  ) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(async () => {
      await getPersonsOptions(true, newValue);
    }, 500);

    setTimeoutId(newTimeoutId);
  };

    const getPersonsOptions = async (
        allPerson: boolean,
        term: string,
    ): Promise<PersonCountry[]> => {
        const result = await dispatch(fetchPersonOptions({allPerson, term}));

        if (!fetchPersonOptions.fulfilled.match(result)) {
            return [];
        }

        const personOptions = (result.payload ?? []) as PersonCountry[];

        setConsigneeList(personOptions);

        return personOptions;
    }

  const getShipmentOptions = async (term: string) => {
    const listFilter: ListFilter = {
      limit: 0,
      offset: 0,
      filter: [],
      sort: [],
    };

    let filterItem: FilterItem;

    if (term) {
      filterItem = {
        field: "master_bl_ref",
        value: `${term}`,
        operator: ListConstants.CONTAINS,
        logicOperator: "and",
      };
      listFilter.filter.push(filterItem);
    }

    const result = await getShipmentList(listFilter);

    if (!result.data) return null;

    const shipmentList: ShipmentFormModel[] = result.data.data;

    const fileRef: { shipment_id: number; master_bl_ref: string }[] = shipmentList
      .filter((shipment: ShipmentFormModel) => shipment.master_bl_ref)
      .map((shipment: ShipmentFormModel) => ({
        shipment_id: shipment.shipment_id ?? 0,
          master_bl_ref: shipment.master_bl_ref,
      }));

    setFileRefList(fileRef);
  };

  const getBookingList = async (
    _event: React.SyntheticEvent,
    newValue: any,
  ) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(async () => {
      await getShipmentOptions(newValue);
    }, 500);

    setTimeoutId(newTimeoutId);
  };

  const handleAutoCompleteChange = async (
    _event: React.SyntheticEvent,
    newValue: any,
    field: string,
  ) => {
    setSelectedConsignee(newValue);
  };

  const documentList = [
    {
      name: "debit_note_required",
      label: "Debit note",
      check_field: "debit_note_uploaded",
    },
    {
      name: "credit_note_required",
      label: "Credit note",
      check_field: "credit_note_uploaded",
    },
    {
      name: "master_bl_required",
      label: "Master bl",
      check_field: "master_bl_uploaded",
    },
    {
      name: "house_bl_required",
      label: "House bl",
      check_field: "house_bl_uploaded",
    },
    {
      name: "liner_invoice_required",
      label: "Liner invoice",
      check_field: "liner_invoice_uploaded",
    },
    {
      name: "cpw_invoice_required",
      label: "CPW invoice",
      check_field: "cpw_invoice_uploaded",
    },
  ];

    useEffect(() => {
        (async () => {
            await getPersonsOptions(true, "");
        })();
    }, []);

    useEffect(() => {

        if (!initialData?.client_id || !consigneeList.length) {
            return;
        }

        const consignee = consigneeList.find(
            (person) => person.person_id === initialData.client_id
        );

        setSelectedConsignee(consignee ?? null);
    }, [initialData?.client_id, consigneeList]);

  useEffect(() => {
    const saved = fileRefList.find(
      (option) => option.master_bl_ref === initialData.master_bl_ref,
    );

    setSelectedFileRef(saved ?? null);
  }, [fileRefList, initialData.master_bl_ref]);

  const renderFields = (columnId: keyof ProcessStepType) => {
    switch (columnId) {
      case "client_identification":
        const [firstName, lastName] = initialData.client_name.split(" ");
        shipmentHbl.consignee = {
          person_id: initialData.person_id,
          first_name: firstName,
          last_name: lastName,
        };
        return (
          <>
            <FormLabel htmlFor="consignee">Consignee</FormLabel>
            <Autocomplete
              id="consignee"
              size="small"
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  placeholder="Type a consignee name"
                />
              )}
              options={consigneeList}
              getOptionLabel={(option) =>
                `${option.first_name} ${option.last_name}`
              }
              getOptionKey={(option) => option.person_id}
              value={selectedConsignee ?? null}
              onChange={(event, newValue) =>
                handleAutoCompleteChange(event, newValue, "consignee")
              }
              onInputChange={(event, newInputValue) =>
                findConsignees(event, newInputValue)
              }
            />
          </>
        );

      case "booking_instructions":
        return (
          <>
            <label style={labelStyle}>Booking Verifications</label>
            <div style={checkboxGroupStyle}>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  name="booking_done"
                  defaultChecked={!!initialData.booking_done}
                  style={checkboxStyle}
                />
                Booking Done
              </label>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  name="booking_confirmation"
                  defaultChecked={!!initialData.booking_confirmation}
                  style={checkboxStyle}
                />
                Booking Confirmation
              </label>
              <label style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  name="release_order"
                  defaultChecked={!!initialData.release_order}
                  style={checkboxStyle}
                />
                Release Order Attached
              </label>
            </div>

            <div>
              <FormControl
                sx={{ paddingTop: "8px" }}
                size="small"
                fullWidth={true}
              >
                <FormLabel htmlFor="master_bl_ref">Booking reference</FormLabel>
                <Autocomplete
                  id="master_bl_ref"
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      name="master_bl_ref"
                      placeholder="Enter the booking ref"
                    />
                  )}
                  options={fileRefList}
                  getOptionLabel={(option) => option.master_bl_ref}
                  isOptionEqualToValue={(option, value) =>
                    option.shipment_id === value.shipment_id
                  }
                  value={selectedFileRef}
                  inputValue={fileRefInput}
                  onChange={async (event, newValue) => {
                    setSelectedFileRef(newValue);
                    setFileRefInput(newValue?.master_bl_ref ?? "");

                    await handleAutoCompleteChange(event, newValue, "file_ref");
                  }}
                  onInputChange={async (event, newInputValue, reason) => {
                    setFileRefInput(newInputValue);

                    if (reason === "input") {
                      await getBookingList(event, newInputValue);
                    }
                  }}
                />
              </FormControl>
            </div>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
                mt: 3,
              }}
            >
              <FormControl size="small" fullWidth={true}>
                <InputLabel sx={{ backgroundColor: "white", px: 0.5 }}>
                  Doc entries user
                </InputLabel>
                <Select
                  name="de_user_id"
                  label="user"
                  value={initialData.de_user_id || userList[0]?.user_id || ""}
                  onChange={(event) => {
                    setProcessData((prev: any) => ({
                      ...prev,
                      initialData: {
                        ...prev.initialData,
                        de_user_id: Number(event.target.value),
                      },
                    }));
                  }}
                >
                  {userList.map((user) => (
                    <MenuItem key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth={true}>
                <InputLabel sx={{ backgroundColor: "white", px: 0.5 }}>
                  Tracking user
                </InputLabel>
                <Select
                  name="t_user_id"
                  label="user"
                  value={initialData.t_user_id || userList[0]?.user_id || ""}
                  onChange={(event) => {
                    setProcessData((prev: any) => ({
                      ...prev,
                      initialData: {
                        ...prev.initialData,
                        t_user_id: Number(event.target.value),
                      },
                    }));
                  }}
                >
                  {userList.map((user) => (
                    <MenuItem key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth={true}>
                <InputLabel sx={{ backgroundColor: "white", px: 0.5 }}>
                  Clearance user
                </InputLabel>
                <Select
                  name="cc_user_id"
                  label="user"
                  value={initialData.cc_user_id || userList[0]?.user_id || ""}
                  onChange={(event) => {
                    setProcessData((prev: any) => ({
                      ...prev,
                      initialData: {
                        ...prev.initialData,
                        cc_user_id: Number(event.target.value),
                      },
                    }));
                  }}
                >
                  {userList.map((user) => (
                    <MenuItem key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth={true}>
                <InputLabel sx={{ backgroundColor: "white", px: 0.5 }}>
                  Delivery user
                </InputLabel>
                <Select
                  name="dh_user_id"
                  label="user"
                  value={initialData.dh_user_id || userList[0]?.user_id || ""}
                  onChange={(event) => {
                    setProcessData((prev: any) => ({
                      ...prev,
                      initialData: {
                        ...prev.initialData,
                        dh_user_id: Number(event.target.value),
                      },
                    }));
                  }}
                >
                  {userList.map((user) => (
                    <MenuItem key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth={true}>
                <InputLabel sx={{ backgroundColor: "white", px: 0.5 }}>
                  Billing user
                </InputLabel>
                <Select
                  name="bd_user_id"
                  label="user"
                  value={initialData.bd_user_id || userList[0]?.user_id || ""}
                  onChange={(event) => {
                    setProcessData((prev: any) => ({
                      ...prev,
                      initialData: {
                        ...prev.initialData,
                        bd_user_id: Number(event.target.value),
                      },
                    }));
                  }}
                >
                  {userList.map((user) => (
                    <MenuItem key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </>
        );

      case "document_entries":
        return (
          <>
            <label style={labelStyle}>Manifest Documents Cleared</label>
            <div style={checkboxGroupStyle}>
              {documentList.map(({ name, label, check_field }) => (
                <div
                  key={name}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <label style={checkboxLabelStyle}>
                    <input
                      type="checkbox"
                      name={name}
                      defaultChecked={!!initialData.documents[name]}
                      style={checkboxStyle}
                    />
                    {label}
                  </label>

                  <span
                    style={{
                      ...statusStyle,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 70,
                      minHeight: 24,
                      padding: "3px 8px",
                      boxSizing: "border-box",
                      borderRadius: 4,
                      backgroundColor: initialData.documents[check_field]
                        ? "#d1fae5"
                        : "#fef3c7",
                      color: initialData.documents[check_field]
                        ? "#065f46"
                        : "#92400e",
                    }}
                  >
                    {initialData.documents[check_field]
                      ? "Cleared"
                      : "Not Cleared"}
                  </span>
                </div>
              ))}
            </div>
          </>
        );

      case "tracking":
        const currentTrackingStatus = initialData[columnId] || "pending";

        return (
          <>
            <label style={labelStyle}>Tracking and follow up</label>

            <label style={labelStyle}>Departure date</label>
            <input
              type="date"
              name="departure_date"
              defaultValue={initialData.departure_date?.split("T")[0] ?? ""}
              style={inputStyle}
              required
            />

            <label style={labelStyle}>Arrival date</label>
            <input
              type="date"
              name="arrival_date"
              defaultValue={initialData.arrival_date?.split("T")[0] ?? ""}
              style={inputStyle}
            />

            <label style={labelStyle}>Eta</label>
            <input
              type="date"
              name="eta"
              defaultValue={initialData.eta?.split("T")[0] ?? ""}
              style={inputStyle}
            />

            <label style={labelStyle}>
              Update tracking Status{initialData["tracking"]}
            </label>
            <label style={checkboxLabelStyle}>
              <select
                name="tracking"
                defaultValue={currentTrackingStatus}
                onChange={(e) => (initialData.tracking = e.target.value)}
                style={inputStyle}
              >
                {statusArr.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </>
        );
      case "custom_clearance":
        const customClearanceStatus = initialData[columnId] || "pending";
        return (
          <>
            <label style={labelStyle}>Remarks</label>
            <input
              type="text"
              name="clearance_remarks"
              defaultValue={initialData.clearance_remarks || ""}
              placeholder="Enter remarks..."
              style={inputStyle}
              required
            />

            <label style={labelStyle}>Status</label>
            <select
              name="custom_clearance"
              defaultValue={customClearanceStatus}
              onChange={(e) => (initialData.custom_clearance = e.target.value)}
              style={inputStyle}
            >
              {statusArr.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </>
        );
      case "delivery_haulage":
        return (
          <>
            <label style={labelStyle}>TAS</label>
            <FileUploader
              fileValue={initialData.documents ? initialData.documents.tas : ""}
              setUrlList={setTasUrlList}
              urlList={tasUrlList}
            />
          </>
        );
      case "billing_debtors":
        const currentBillingStatus = initialData[columnId] || "pending";
        return (
          <>
            <label style={labelStyle}>Update billing and debtors</label>
            <label style={checkboxLabelStyle}>
              <select
                name="billing_debtors"
                defaultValue={currentBillingStatus}
                onChange={(e) => (initialData.billing_debtors = e.target.value)}
                style={inputStyle}
              >
                {statusArr.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>NOA</label>
            <FileUploader
              fileValue={initialData.documents ? initialData.documents.noa : ""}
              setUrlList={setNoaUrlList}
              urlList={noaUrlList}
            />
          </>
        );

      default:
        return (
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            Unknown process step pipeline context.
          </p>
        );
    }
  };

  type Payload = {
    documents: {
      noa?: { url: string; size: number }[];
      tas?: { url: string; size: number }[];
      debit_note_required?: boolean;
      debit_note_uploaded?: boolean;
      credit_note_required?: boolean;
      credit_note_uploaded?: boolean;
      cpw_invoice_required?: boolean;
      cpw_invoice_uploaded?: boolean;
      liner_invoice_required?: boolean;
      liner_invoice_uploaded?: boolean;
      master_bl_required?: boolean;
      master_bl_uploaded?: boolean;
      house_bl_required?: boolean;
      house_bl_uploaded?: boolean;
    };
    [key: string]: any;
  };

  type DocumentField =
    | "debit_note_required"
    | "credit_note_required"
    | "house_bl_required"
    | "master_bl_required"
    | "liner_invoice_required"
    | "cpw_invoice_required";

  const documentFields: DocumentField[] = [
    "debit_note_required",
    "credit_note_required",
    "house_bl_required",
    "master_bl_required",
    "liner_invoice_required",
    "cpw_invoice_required",
  ] as const;

  return (
    <div style={backdropStyle}>
      <div style={modalCardStyle}>
        <h3 style={headerStyle}>Update: {`${columnId}`.replace(/_/g, " ")}</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);

            const payload: Payload = {
              documents: {},
            };

            documentFields.forEach((field) => {
              payload.documents[field] = formData.has(field);
            });

            formData.forEach((value, key) => {
              if (!(documentFields as readonly string[]).includes(key)) {
                payload[key] = value;
              }
            });

            if (columnId === "client_identification") {
              payload.client_id =
                selectedConsignee?.person_id;
              payload.client_name =
                selectedConsignee?.first_name +
                " " +
                  selectedConsignee?.last_name;
              payload.client_identification =
                initialData.client_identification === "pending"
                  ? "completed"
                  : "pending";
            }

            if (columnId === "booking_instructions") {
              payload.booking_done = formData.has("booking_done");
              payload.booking_confirmation = formData.has(
                "booking_confirmation",
              );
              payload.release_order = formData.has("release_order");
              payload.booking_ref = formData.get("booking_ref");

              payload.de_user_id = Number(payload.de_user_id);
              payload.t_user_id = Number(payload.t_user_id);
              payload.cc_user_id = Number(payload.cc_user_id);
              payload.dh_user_id = Number(payload.dh_user_id);
              payload.bd_user_id = Number(payload.bd_user_id);

              payload.booking_instructions =
                payload.booking_confirmation &&
                payload.booking_done &&
                payload.release_order
                  ? "completed"
                  : "pending";
            }

            if (columnId === "document_entries") {
              payload.documents.debit_note_required = formData.has(
                "debit_note_required",
              );
              payload.documents.credit_note_required = formData.has(
                "credit_note_required",
              );
              payload.documents.house_bl_required =
                formData.has("house_bl_required");

              payload.documents.master_bl_required =
                formData.has("master_bl_required");

              payload.documents.liner_invoice_required = formData.has(
                "liner_invoice_required",
              );

              payload.documents.cpw_invoice_required = formData.has(
                "cpw_invoice_required",
              );

              payload.document_entries =
                payload.documents.debit_note_uploaded &&
                payload.documents.cpw_invoice_uploaded &&
                payload.documents.liner_invoice_uploaded &&
                payload.documents.master_bl_uploaded &&
                payload.documents.house_bl_uploaded &&
                payload.documents.credit_note_uploaded
                  ? "completed"
                  : "pending";
            }

            if (columnId === "tracking") {
              payload.departure_date = formData.get("departure_date");
              payload.arrival_date = formData.get("arrival_date");
              payload.eta = formData.get("eta");
              payload.tracking = formData.get("tracking");
              // payload.tracking = (payload.departure_date && payload.arrival_date
              //     && payload.eta) ? 'completed' : 'pending';
            }

            if (columnId === "custom_clearance") {
              payload.remarks = formData.get("clearance_remarks");
              payload.custom_clearance = formData.get("custom_clearance");
            }

            if (columnId === "delivery_haulage") {
              payload.documents.tas = tasUrlList.map((file) => ({
                url: file.url,
                size: file.size,
              }));
              payload.delivery_haulage =
                payload.delivery_haulage === "pending"
                  ? "completed"
                  : "pending";
            }

            if (columnId === "billing_debtors") {
              payload.billing_debtors = formData.get("billing_debtors");
              payload.documents.noa = noaUrlList;
            }

            onSave(activeForm.rowId, columnId, payload);
          }}
        >
          <div
            style={{
              maxHeight: "420px",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {renderFields(columnId)}
          </div>

          {/* Action Button Row */}
          <div style={actionsContainerStyle}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>
              Cancel
            </button>
            <button type="submit" style={saveBtnStyle}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(15, 23, 42, 0.4)",
  backdropFilter: "blur(3px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const modalCardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "24px",
  borderRadius: "12px",
  width: "400px",
  boxShadow:
    "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
  boxSizing: "border-box",
};
const headerStyle: React.CSSProperties = {
  margin: "0 0 16px 0",
  fontSize: "14px",
  fontWeight: 700,
  color: "#1e293b",
  borderBottom: "1px solid #f1f5f9",
  paddingBottom: "12px",
  letterSpacing: "0.05em",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  color: "#475569",
  marginBottom: "6px",
  marginTop: "14px",
  letterSpacing: "0.02em",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  color: "#1e293b",
  boxSizing: "border-box",
  outline: "none",
};
const checkboxGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  padding: "12px",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  backgroundColor: "#f8fafc",
};
const checkboxLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "13px",
  color: "#334155",
  cursor: "pointer",
  fontWeight: 500,
};
const checkboxStyle: React.CSSProperties = {
  width: "16px",
  height: "16px",
  cursor: "pointer",
};
const actionsContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
  marginTop: "24px",
  borderTop: "1px solid #f1f5f9",
  paddingTop: "16px",
};
const cancelBtnStyle: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#475569",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};
const saveBtnStyle: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: "6px",
  background: "#f97316",
  color: "#ffffff",
  border: "none",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const statusStyle = {
  padding: "3px 10px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "600",
  minWidth: "60px",
};
