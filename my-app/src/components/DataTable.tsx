import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  FilterFn,
} from "@tanstack/react-table";
import { useState } from "react";
import "./DataTable.css";

// Extend table module for custom filter functions
declare module '@tanstack/react-table' {
  interface FilterFns {
    dateRange: FilterFn<unknown>;
    numberCompare: FilterFn<unknown>;
  }
}

// Extend column meta to support different filter types
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    filterVariant?: 'date' | 'text' | 'number' | 'select';
    selectOptions?: Array<{ value: string; label: string }>;
  }
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  loading?: boolean;
  emptyMessage?: string;
}

// Custom filter function for date ranges
const dateRangeFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const dateValue = row.getValue(columnId);
  if (!dateValue) return false;
  
  const date = new Date(String(dateValue));
  const [startDate, endDate] = filterValue as [Date | null, Date | null];
  
  if (startDate && date < startDate) return false;
  if (endDate) {
    // Set end date to end of day for inclusive filtering
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    if (date > endOfDay) return false;
  }
  
  return true;
};

// Custom filter function for number comparisons
const numberFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  if (value === null || value === undefined) return false;
  
  const numValue = Number(value);
  const { operator, compareValue } = filterValue as { operator: string; compareValue: number };
  
  if (!compareValue && compareValue !== 0) return true;
  
  switch (operator) {
    case '>': return numValue > compareValue;
    case '<': return numValue < compareValue;
    case '=': return numValue === compareValue;
    case '>=': return numValue >= compareValue;
    case '<=': return numValue <= compareValue;
    default: return true;
  }
};

function DataTable<T>({ data, columns, loading = false, emptyMessage = "No hay datos disponibles" }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dateFilters, setDateFilters] = useState<Record<string, { start: string; end: string }>>({});
  const [numberFilters, setNumberFilters] = useState<Record<string, { operator: string; value: string }>>({});
  const [textFilters, setTextFilters] = useState<Record<string, string>>({});
  const [selectFilters, setSelectFilters] = useState<Record<string, string>>({});

  // Handler for date filter changes
  const handleDateFilterChange = (columnId: string, type: 'start' | 'end', value: string) => {
    setDateFilters(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        [type]: value
      }
    }));

    // Update the column filter
    const currentFilter = dateFilters[columnId] || { start: '', end: '' };
    const newFilter = { ...currentFilter, [type]: value };
    
    const startDate = type === 'start' ? value : newFilter.start;
    const endDate = type === 'end' ? value : newFilter.end;
    
    if (startDate || endDate) {
      setColumnFilters(prev => {
        const others = prev.filter(f => f.id !== columnId);
        return [...others, { 
          id: columnId, 
          value: [
            startDate ? new Date(startDate) : null,
            endDate ? new Date(endDate) : null
          ] 
        }];
      });
    } else {
      setColumnFilters(prev => prev.filter(f => f.id !== columnId));
    }
  };

  // Handler for number filter changes
  const handleNumberFilterChange = (columnId: string, type: 'operator' | 'value', value: string) => {
    setNumberFilters(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        operator: type === 'operator' ? value : prev[columnId]?.operator || '=',
        value: type === 'value' ? value : prev[columnId]?.value || ''
      }
    }));

    const currentFilter = numberFilters[columnId] || { operator: '=', value: '' };
    const operator = type === 'operator' ? value : currentFilter.operator;
    const compareValue = type === 'value' ? value : currentFilter.value;

    if (compareValue) {
      setColumnFilters(prev => {
        const others = prev.filter(f => f.id !== columnId);
        return [...others, { 
          id: columnId, 
          value: { operator, compareValue: Number(compareValue) }
        }];
      });
    } else {
      setColumnFilters(prev => prev.filter(f => f.id !== columnId));
    }
  };

  // Handler for text filter changes
  const handleTextFilterChange = (columnId: string, value: string) => {
    setTextFilters(prev => ({
      ...prev,
      [columnId]: value
    }));

    if (value) {
      setColumnFilters(prev => {
        const others = prev.filter(f => f.id !== columnId);
        return [...others, { id: columnId, value }];
      });
    } else {
      setColumnFilters(prev => prev.filter(f => f.id !== columnId));
    }
  };

  // Handler for select filter changes
  const handleSelectFilterChange = (columnId: string, value: string) => {
    setSelectFilters(prev => ({
      ...prev,
      [columnId]: value
    }));

    if (value) {
      setColumnFilters(prev => {
        const others = prev.filter(f => f.id !== columnId);
        return [...others, { id: columnId, value }];
      });
    } else {
      setColumnFilters(prev => prev.filter(f => f.id !== columnId));
    }
  };

  // Clear date filter for a column
  const clearDateFilter = (columnId: string) => {
    setDateFilters(prev => {
      const updated = { ...prev };
      delete updated[columnId];
      return updated;
    });
    setColumnFilters(prev => prev.filter(f => f.id !== columnId));
  };

  // Clear number filter for a column
  const clearNumberFilter = (columnId: string) => {
    setNumberFilters(prev => {
      const updated = { ...prev };
      delete updated[columnId];
      return updated;
    });
    setColumnFilters(prev => prev.filter(f => f.id !== columnId));
  };

  // Clear text filter for a column
  const clearTextFilter = (columnId: string) => {
    setTextFilters(prev => {
      const updated = { ...prev };
      delete updated[columnId];
      return updated;
    });
    setColumnFilters(prev => prev.filter(f => f.id !== columnId));
  };

  // Clear select filter for a column
  const clearSelectFilter = (columnId: string) => {
    setSelectFilters(prev => {
      const updated = { ...prev };
      delete updated[columnId];
      return updated;
    });
    setColumnFilters(prev => prev.filter(f => f.id !== columnId));
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    filterFns: {
      dateRange: dateRangeFilter,
      numberCompare: numberFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return <p className="table-loading">Cargando datos...</p>;
  }

  // Get columns by filter type
  const dateColumns = columns.filter(col => col.meta?.filterVariant === 'date');
  const numberColumns = columns.filter(col => col.meta?.filterVariant === 'number');
  const textColumns = columns.filter(col => col.meta?.filterVariant === 'text');
  const selectColumns = columns.filter(col => col.meta?.filterVariant === 'select');

  const hasFilters = dateColumns.length > 0 || numberColumns.length > 0 || textColumns.length > 0 || selectColumns.length > 0;

  return (
    <div className="data-table-container">
      {/* Búsqueda global y filtros */}
      <div className="table-controls">
        {/* Filtros por columna */}
        {(hasFilters || true) && (
          <div className="column-filters-container">
            {/* Búsqueda global */}
            <div className="filter-group">
              <label className="filter-label">Buscar:</label>
              <div className="text-filter-inputs">
                <input
                  type="text"
                  placeholder="Buscar en toda la tabla..."
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="filter-input text-input search-global"
                />
                {globalFilter && (
                  <button
                    onClick={() => setGlobalFilter("")}
                    className="clear-filter-btn"
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            {/* Filtros de fecha */}
            {dateColumns.map((column) => {
              const columnId = ('accessorKey' in column && typeof column.accessorKey === 'string') 
                ? column.accessorKey 
                : column.id || '';
              const columnHeader = typeof column.header === 'string' ? column.header : columnId;
              
              return (
                <div key={columnId} className="filter-group">
                  <label className="filter-label">{columnHeader}:</label>
                  <div className="date-filter-inputs-horizontal">
                    <input
                      type="date"
                      placeholder="Desde"
                      value={dateFilters[columnId]?.start || ''}
                      onChange={(e) => handleDateFilterChange(columnId, 'start', e.target.value)}
                      className="filter-input date-input"
                      title={`Filtrar ${columnHeader} desde`}
                    />
                    <span className="date-separator">-</span>
                    <input
                      type="date"
                      placeholder="Hasta"
                      value={dateFilters[columnId]?.end || ''}
                      onChange={(e) => handleDateFilterChange(columnId, 'end', e.target.value)}
                      className="filter-input date-input"
                      title={`Filtrar ${columnHeader} hasta`}
                    />
                    {(dateFilters[columnId]?.start || dateFilters[columnId]?.end) && (
                      <button
                        onClick={() => clearDateFilter(columnId)}
                        className="clear-filter-btn"
                        title="Limpiar filtro"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Filtros de número */}
            {numberColumns.map((column) => {
              const columnId = ('accessorKey' in column && typeof column.accessorKey === 'string') 
                ? column.accessorKey 
                : column.id || '';
              const columnHeader = typeof column.header === 'string' ? column.header : columnId;
              
              return (
                <div key={columnId} className="filter-group">
                  <label className="filter-label">{columnHeader}:</label>
                  <div className="number-filter-inputs">
                    <select
                      value={numberFilters[columnId]?.operator || '='}
                      onChange={(e) => handleNumberFilterChange(columnId, 'operator', e.target.value)}
                      className="filter-input operator-select"
                      title="Operador de comparación"
                    >
                      <option value="=">=</option>
                      <option value=">">{'>'}</option>
                      <option value="<">{'<'}</option>
                      <option value=">=">{'>='}</option>
                      <option value="<=">{'<='}</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Valor"
                      value={numberFilters[columnId]?.value || ''}
                      onChange={(e) => handleNumberFilterChange(columnId, 'value', e.target.value)}
                      className="filter-input number-input"
                      title={`Filtrar ${columnHeader}`}
                    />
                    {numberFilters[columnId]?.value && (
                      <button
                        onClick={() => clearNumberFilter(columnId)}
                        className="clear-filter-btn"
                        title="Limpiar filtro"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Filtros de texto */}
            {textColumns.map((column) => {
              const columnId = ('accessorKey' in column && typeof column.accessorKey === 'string') 
                ? column.accessorKey 
                : column.id || '';
              const columnHeader = typeof column.header === 'string' ? column.header : columnId;
              
              return (
                <div key={columnId} className="filter-group">
                  <label className="filter-label">{columnHeader}:</label>
                  <div className="text-filter-inputs">
                    <input
                      type="text"
                      placeholder={`Buscar ${columnHeader}...`}
                      value={textFilters[columnId] || ''}
                      onChange={(e) => handleTextFilterChange(columnId, e.target.value)}
                      className="filter-input text-input"
                    />
                    {textFilters[columnId] && (
                      <button
                        onClick={() => clearTextFilter(columnId)}
                        className="clear-filter-btn"
                        title="Limpiar filtro"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Filtros de select */}
            {selectColumns.map((column) => {
              const columnId = ('accessorKey' in column && typeof column.accessorKey === 'string') 
                ? column.accessorKey 
                : column.id || '';
              const columnHeader = typeof column.header === 'string' ? column.header : columnId;
              const options = column.meta?.selectOptions || [];
              
              return (
                <div key={columnId} className="filter-group">
                  <label className="filter-label">{columnHeader}:</label>
                  <div className="select-filter-inputs">
                    <select
                      value={selectFilters[columnId] || ''}
                      onChange={(e) => handleSelectFilterChange(columnId, e.target.value)}
                      className="filter-input select-input"
                    >
                      <option value="">Todos</option>
                      {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {selectFilters[columnId] && (
                      <button
                        onClick={() => clearSelectFilter(columnId)}
                        className="clear-filter-btn"
                        title="Limpiar filtro"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={header.column.getCanSort() ? "sortable" : ""}
                  >
                    <div className="header-content">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="sort-indicator">
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? " ⬍"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-message">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="table-pagination">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          className="pagination-btn"
        >
          {"<<"}
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="pagination-btn"
        >
          {"<"}
        </button>
        <span className="pagination-info">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="pagination-btn"
        >
          {">"}
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          className="pagination-btn"
        >
          {">>"}
        </button>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="page-size-select"
        >
          {[10, 20, 30, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Mostrar {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default DataTable;
