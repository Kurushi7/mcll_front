import React, { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable
} from "@tanstack/react-table";
import {getShipmentProcessList} from "../../composables/processFlow/processFlow.tsx";
import {ListFilter} from "../../types/table.ts";
import {PipelineCell} from "../../components/processFlow/pipelineCell.tsx";

export type StepStatus = 'complete' | 'correction' | 'pending';

interface ProcessRow {
    shipment_process_id: number;
    shipment_id: number;

    client_identification: StepStatus;
    booking_instructions: StepStatus;
    document_entries: StepStatus;
    tracking: StepStatus;
    custom_clearance: StepStatus;
    delivery_haulage: StepStatus;
    billing_debtors: StepStatus;

    documents: string;
}

const ProcessLayout: React.FC<any>=() => {

  const [data, setData] = useState<ProcessRow[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

    const [activePopover, setActivePopover] = useState<{
        rowId: number;
        field: string;
        status: string;
        date: string;
        rect: DOMRect;
    } | null>(null);

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

    const stepFields = [
        "client_identification",
        "booking_instructions",
        "document_entries",
        "tracking",
        "custom_clearance",
        "delivery_haulage",
        "billing_debtors",
    ] as const;

    type StepField = typeof stepFields[number];

    const nextStatus = (status: StepStatus): StepStatus =>
        status === "pending"
            ? "complete"
            : status === "complete"
                ? "correction"
                : "pending";

    const handleSegmentClick = (
        rowId: number,
        field: (typeof stepFields)[number]
    ) => {
        setData((prev: ProcessRow[]) =>
            prev.map((row) => {
                if (row.shipment_process_id !== rowId) return row;

                return {
                    ...row,
                    [field]: nextStatus(row[field]),
                };
            })
        );
    };

    const pipelineConfigs = [
        { accessor: 'shipment_process_id' as const, header: 'Id', hasWindow: false, hidden: true },
        { accessor: 'shipment_id' as const, header: 'Shipment Id', hasWindow: false, hidden: false },
        { accessor: 'client_identification' as const, header: 'Client Identification', hasWindow: false, hidden: false },
        { accessor: 'booking_instructions' as const, header: 'Booking instruction', hasWindow: false, hidden: false },
        { accessor: 'document_entries' as const, header: 'Document entries', hasWindow: true, hidden: false },
        { accessor: 'tracking' as const, header: 'Tracking', hasWindow: false, hidden: false },
        { accessor: 'custom_clearance' as const, header: 'Custom clearance', hasWindow: false, hidden: false },
        { accessor: 'delivery_haulage' as const, header: 'Delivery & haulage', hasWindow: false, hidden: false },
    ];

  const handleOpenEntryWindow = (rId: string | number, idx: number, field: string ) => {
    return {};
  }


  const columnHelper = createColumnHelper<ProcessRow>();

    const columns = useMemo(() => {
        return pipelineConfigs
            .filter((c) => !c.hidden)
            .map((config, index) =>
            columnHelper.accessor(config.accessor, {
                header: config.header,

                cell: ({ row, getValue }) => {

                    if (!stepFields.includes(config.accessor as StepField)) {
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
                            field={config.accessor as StepField}
                            stepFields={stepFields}
                            onSegmentClick={(id: number, field: string) => {
                                if (config.hasWindow) {
                                    handleOpenEntryWindow(id, index, field);
                                } else {
                                    handleSegmentClick(id, field as StepField);
                                }
                            }}
                        />
                    );
                },
            })
        );
    }, [data]);


  const fetchShippingFlows = async (filter: ListFilter) => {
      return await getShipmentProcessList(filter);
  }


  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),

    manualPagination: true,
    manualFiltering: true,
    rowCount: totalRows,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPagination((prev) => ({ ...prev, pageIndex: 0 })); // Reset page count on fresh filter query
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const standardizedParams: ListFilter = {
      offset: pageIndex, // Map 0-index framework offset to 1-index corporate backend expectation
      limit: pageSize,
      filter: [],
      sort: [],
    };
      fetchShippingFlows(standardizedParams)
      .then((response: any) => {
          setData(response.data.data);
          setTotalRows(response.total);
      })
      .catch((err) => console.error('Data layer connection failure', err));
  }, [pageIndex, pageSize, debouncedSearch]);

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      color: '#0f172a'
    }}>
      {/* Upper Controls Toolbar */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          color: '#94a3b8',
          marginBottom: '8px'
        }}>
          Search Active Processes
        </label>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Filter by process ID..."
          style={{
            padding: '12px 16px',
            width: '300px',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            outline: 'none',
          }}
        />
      </div>

      {/* Main Grid Surface Wrapper */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px 10px 0 0',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.05)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{
                    padding: '16px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    color: '#475569',
                    width: header.id === 'shipment_process_id' ? '200px' : 'auto'
                  }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No active items matched the server query.
                </td>
              </tr>
            ) : (
                table.getRowModel().rows.map((row) => (
                    <tr key={row.id} style = {{ height: "42px" }}>
                        {row.getVisibleCells().map((cell, index, array) => {

                            const isFirstColumn = index === 1;
                            const isLastColumn = index === array.length - 1;

                            return (
                                <td key={cell.id} style={{
                                    padding: 0,
                                    height: '100%',
                                    verticalAlign: 'middle',
                                    borderBottom: '1px solid #e2e8f0',
                                    paddingLeft: isFirstColumn ? '8px' : '0px',
                                    paddingRight: isLastColumn ? '8px' : '0px'
                                }}>
                                    <div className="pipeline-cell-wrapper"
                                         style={{
                                             display: 'flex',
                                             alignItems: 'center',
                                             width: '100%',
                                             height: '100%',
                                             boxSizing: 'border-box',
                                             borderTopLeftRadius: isFirstColumn ? '99px' : '0px',
                                             borderBottomLeftRadius: isFirstColumn ? '99px' : '0px',
                                             borderTopRightRadius: isLastColumn ? '99px' : '0px',
                                             borderBottomRightRadius: isLastColumn ? '99px' : '0px',
                                             overflow: 'hidden'
                                    }}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </div>
                                </td>
                            )
                        })}
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Server Pagination Toolbar Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        fontSize: '13px',
        color: '#475569',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            style={{
              backgroundColor: '#ffffff',
              color: '#1e293b',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              padding: '4px 8px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span>
          Page <strong>{pageIndex + 1}</strong> of <strong>{table.getPageCount() || 1}</strong>
        </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              style={{
                padding: '6px 12px',
                backgroundColor: table.getCanPreviousPage() ? '#f8fafc' : '#f1f5f9',
                color: table.getCanPreviousPage() ? '#0f172a' : '#94a3b8',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                boxShadow: table.getCanPreviousPage() ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                fontWeight: '500'
              }}
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              style={{
                padding: '6px 12px',
                backgroundColor: table.getCanNextPage() ? '#f8fafc' : '#f1f5f9',
                color: table.getCanNextPage() ? '#0f172a' : '#94a3b8',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                boxShadow: table.getCanNextPage() ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                fontWeight: '500'
              }}
            >
              Next
            </button>

            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcessLayout;