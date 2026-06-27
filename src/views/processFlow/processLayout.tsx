import React, { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable
} from "@tanstack/react-table";

export type StepStatus = 'complete' | 'correction' | 'pending';

export interface ProcessRow {
  id: string;
  processId: string;
  steps: StepStatus[];
}

export interface StandardizedBackendParams {
  page: number;
  limit: number;
  search: string;
}

export interface BackendResponse {
  items: ProcessRow[];
  totalCount: number;
}

const mockMyExistingBackendMethod = async (params: StandardizedBackendParams): Promise<BackendResponse> => {
  console.log('API Request Dispatched with Parameters:', params);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        items: [
          { id: '1', processId: 'Process X29', steps: ['complete', 'complete', 'correction', 'pending', 'pending'] },
          { id: '2', processId: 'Process A14', steps: ['complete', 'pending', 'pending', 'pending', 'pending'] },
          { id: '3', processId: 'Process Y88', steps: ['complete', 'complete', 'complete', 'complete', 'complete'] },
          { id: '4', processId: 'Process Z02', steps: ['correction', 'pending', 'pending', 'pending', 'pending'] },
        ],
        totalCount: 42,
      });
    }, 300);
  });
};


const ProcessLayout: React.FC<any>=() => {
  const THEME: Record<StepStatus, { base: string; gradient: string; glow: string }> = {
      complete: {
        base: '#10b981',
        gradient: 'linear-gradient(to bottom, #34d399 0%, #10b981 40%, #059669 100%)',
        glow: '0 0 8px rgba(16, 185, 129, 0.4)',
      },
      correction: {
        base: '#f97316',
        gradient: 'linear-gradient(to bottom, #fb923c 0%, #f97316 40%, #ea580c 100%)',
        glow: '0 0 8px rgba(249,115,22,0.4)',
      },
      pending: {
        base: '#2e3238',
        gradient: 'linear-gradient(to bottom, #2d3139 0%, #22252a 100%)',
        glow: 'none',
      }
    }
  ;

  const INITIAL_DATA = [
    { id: '1', processId: 'Process X29', steps: ['complete', 'complete', 'correction', 'pending', 'pending'] },
    { id: '2', processId: 'Process A14', steps: ['complete', 'pending', 'pending', 'pending', 'pending'] },
    { id: '3', processId: 'Process Y88', steps: ['complete', 'complete', 'complete', 'complete', 'complete'] },
    { id: '4', processId: 'Process Z02', steps: ['correction', 'pending', 'pending', 'pending', 'pending'] },
  ];

    const [data, setData] = useState<ProcessRow[]>([]);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [searchInput, setSearchInput] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

    const handleSegmentClick = (rowId: string, stepIndex: number) => {
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

    const barContainer = {
      display: 'flex',
      width: '100%',
      height: '22px',
      backgroundColor: '#1a1c20', // Dark carbon base
      borderRadius: '6px',
      padding: '3px',            // Inset frame border
      boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.1)',
      overflow: 'hidden',
      gap: '2px'                 // The structural capsule dividers
    }

    const columnHelper = createColumnHelper<ProcessRow>();

    const columns = useMemo(() => [
      columnHelper.accessor('processId', {
        header: 'Process ID',
      }),
      columnHelper.accessor('steps', {
        header: 'Workflow Pipeline Status',
        cell: ({ row, getValue }) => {
          const stepsArray = getValue();
          const rowId = row.original.id;

          return (
            <div style={{ display: 'flex', width: '100%', height: '40px', alignItems: 'center' }}>
              <div style={{
                display: 'flex', width: '100%', height: '22px', backgroundColor: '#1a1c20',
                borderRadius: '6px', padding: '3px', overflow: 'hidden', gap: '2px',
                boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.1)'
              }}>
                {stepsArray.map((status: StepStatus, index: number) => {
                  const styleConfig = THEME[status];

                  return (
                    <div
                      key={index}
                      onClick={() => handleSegmentClick(rowId, index)}
                      style={{
                        flex: 1,
                        background: styleConfig.gradient,
                        borderRadius: '3px',
                        cursor: 'pointer',
                        boxShadow: `${styleConfig.glow}, inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 3px rgba(0,0,0,0.4)`,
                        position: 'relative',
                        transition: 'all 0.15s ease',
                      }}
                      title="Step 1"
                    >
                      {status !== 'pending' && (
                        <div style={{
                          position: 'absolute',
                          top: '1px',
                          left: '2px',
                          right: '2px',
                          height: '35%',
                          background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 100%)',
                          borderRadius: '2px',
                          pointerEvents: 'none',
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
      })
    ], []);

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
      const standardizedParams: StandardizedBackendParams = {
        page: pageIndex + 1, // Map 0-index framework offset to 1-index corporate backend expectation
        limit: pageSize,
        search: debouncedSearch,
      };
      mockMyExistingBackendMethod(standardizedParams)
        .then((response: BackendResponse) => {
          setData(response.items);
          setTotalRows(response.totalCount);
        })
        .catch((err) => console.error('Data layer connection failure', err));
    }, [pageIndex, pageSize, debouncedSearch]);

    return (
      <div style={{
        padding: '40px',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#18191c',
        minHeight: '100vh',
        color: '#e2e8f0'
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
              backgroundColor: '#22252a',
              color: '#fff',
              borderRadius: '8px',
              border: '1px solid #2e3238',
              fontSize: '14px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
              outline: 'none',
            }}
          />
        </div>

        {/* Main Grid Surface Wrapper */}
        <div style={{
          border: '1px solid #2e3238',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: '#1d2025',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} style={{ backgroundColor: '#22252a', borderBottom: '2px solid #141517' }}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{
                    padding: '16px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
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
                <tr key={row.id} style={{ borderBottom: '1px solid #22252a', backgroundColor: '#1d2025' }}>
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

          {/* Server Pagination Toolbar Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 16px',
            backgroundColor: '#22252a',
            borderTop: '1px solid #2e3238',
            fontSize: '13px',
            color: '#94a3b8'
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                style={{
                  backgroundColor: '#1d2025',
                  color: '#fff',
                  border: '1px solid #2e3238',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  outline: 'none'
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
                    backgroundColor: table.getCanPreviousPage() ? '#2e3238' : '#1d2025',
                    color: table.getCanPreviousPage() ? '#fff' : '#475569',
                    border: '1px solid #2e3238',
                    borderRadius: '4px',
                    cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed',
                    fontSize: '12px'
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: table.getCanNextPage() ? '#2e3238' : '#1d2025',
                    color: table.getCanNextPage() ? '#fff' : '#475569',
                    border: '1px solid #2e3238',
                    borderRadius: '4px',
                    cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed',
                    fontSize: '12px'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
}

export default ProcessLayout;