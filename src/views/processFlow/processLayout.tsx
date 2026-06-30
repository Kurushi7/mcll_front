import React, { useEffect, useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable
} from "@tanstack/react-table";
import {getProcessFlowList} from "../../composables/processFlow/processFlow.tsx";
import {ListFilter} from "../../types/table.ts";
import {PipelineCell} from "../../components/processFlow/pipelineCell.tsx";

export type StepStatus = 'complete' | 'correction' | 'pending';

export interface ProcessRow {
  id: string;
  processId: string;
  steps: StepStatus[];
}

const ProcessLayout: React.FC<any>=() => {

  const [data, setData] = useState<ProcessRow[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleSegmentClick = (rowId: string | number, stepIndex: number) => {
    setData((prev) => prev.map(row => {
      if (row.id === rowId) {
        const updatedSteps = [...row.steps];
        const current = updatedSteps[stepIndex];
        updatedSteps[stepIndex] = current === 'pending' ? 'complete'
          : current === 'complete' ? 'correction' : 'pending';
        return { ...row, steps: updatedSteps };
      }
      return row;
    }));
  }

    const pipelineConfigs = [
        { accessor: 'shipment_id' as const, header: 'Shipment Id', hasWindow: false },
        { accessor: 'client_identification' as const, header: 'Client Identification', hasWindow: false },
        { accessor: 'booking_instructions' as const, header: 'Booking instruction', hasWindow: false },
        { accessor: 'document_entries' as const, header: 'Document entries', hasWindow: true },
        { accessor: 'tracking' as const, header: 'Tracking', hasWindow: false },
        { accessor: 'custom_clearance' as const, header: 'Custom clearance', hasWindow: false },
        { accessor: 'delivery_haulage' as const, header: 'Delivery & haulage', hasWindow: false },
    ];

  const handleOpenEntryWindow = (rId: string | number, idx: number, field: string ) => {
    return {};
  }


  const columnHelper = createColumnHelper<any>();

  const columns = useMemo(() => {
    const generatedColumns = pipelineConfigs.map(config =>
        columnHelper.accessor(config.accessor, {
            header: config.header,
            cell: ({row, getValue}) => {
                const stepsArray = getValue() as StepStatus[];
                const rowId = row.original.id;

                // Custom action selector based on configuration flags
                const clickHandler = (rId: string | number, idx: number) => {
                    if (config.hasWindow) {
                        handleOpenEntryWindow(rId, idx, config.accessor); // Open input window
                    } else {
                        handleSegmentClick(rId, idx); // Default click action
                    }
                };

                return (
                    <PipelineCell
                        stepsArray={stepsArray}
                        rowId={rowId}
                        onSegmentClick={clickHandler}
                    />
                )
            }
        })
         )

            return [... generatedColumns];
        }, [handleSegmentClick, handleOpenEntryWindow]);


  const fetchShippingFlows = async (filter: ListFilter) => {
      return await getProcessFlowList(filter);
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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                    width: header.id === 'processId' ? '200px' : 'auto'
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
                <td colSpan={2} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No active items matched the server query.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={{
                      padding: '14px 16px',
                      fontSize: '14px',
                      fontWeight: cell.column.id === 'processId' ? '600' : 'normal',
                      color: cell.column.id === 'processId' ? '#f8fafc' : 'inherit'
                    }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
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
          <div style={{ display: 'flex', gap: '4px' }}>
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