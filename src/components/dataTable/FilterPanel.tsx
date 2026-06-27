import { Button, FormControl, Grid2, MenuItem, Select } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Column, FilterItems, Operator } from "../../types/table";
import FilterFieldRenderer from "./FilterFieldRenderer";
import React, { useEffect, useState } from "react";

interface Props {
  columns: Column[];
  fetchData: (data: FilterItems[]) => Promise<void>;
  data: FilterItems[];
  setData: React.Dispatch<React.SetStateAction<any[]>>;
}

const FilterPanel: React.FC<Props> = ({
  columns,
  fetchData,
  data,
  setData,
}) => {
  const closeButtonStyle: React.CSSProperties = {
    width: "30px",
    height: "30px",
    border: "none",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "20px",
    boxSizing: "border-box",
    minWidth: "10px",
    padding: 0,
    transition: "background-color 0.3s ease",
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    minHeight: "300px",
    overflow: "auto",
    transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    flexDirection: "column",
  };

  const closeButtonDiv: React.CSSProperties = {
    display: "inline-flex",
    flexDirection: "column",
    position: "relative",
    minWidth: 0,
    padding: 0,
    margin: "0px 4px 1.6px 0px",
    border: 0,
    verticalAlign: "top",
    flexShrink: 0,
    justifyContent: "flex-end",
  };

  const [operatorList, setOperatorList] = React.useState<Operator[]>([]);

  const firstVisibleField = columns.filter((column) => !column.hidden)[0].field;

  const [modelValue, setModelValue] = useState<any>();

  const [reload, setReload] = useState<boolean>(false);

  const blankItem: FilterItems = {
    logicOperator: "and",
    field: firstVisibleField,
    operator: "",
    operatorList: operatorList,
    value: "",
    component: "text",
  };

  const getOperatorList = (fieldName: string) => {
    columns.map((column) => {
      if (column.field === fieldName && column.operators) {
        blankItem.operatorList = column.operators;
        blankItem.operator = column.operators[0].name;
        blankItem.value = column.operators[0].defaultValue ?? "";
        blankItem.component = column.operators[0].component;
        setOperatorList(column.operators);
      }
    });
  };

  const addBlankRow = () => {
    getOperatorList(firstVisibleField);
    setData((prevData) => [...prevData, blankItem]);
  };

  const removeRow = (id: number) => {
    setData(data.filter((item: any, index: number) => index !== id));

    if (data.length === 0) {
      setData([blankItem]);
    }
  };

  const removeAllFilters = async () => {
    setData([blankItem]);
    setReload(true);
  };

  const updateLogicOperator = (id: number, value: string) => {
    setData(
      data.map((row: any, index: number) => {
        if (index === id) {
          return {
            ...row,
            logicOperator: value,
          };
        }
      }),
    );
  };

  const updateComponent = (id: number, value: string) => {
    let component = "";
    let defaultValue: any = null;

    // update operator with actual value
    setData(
      data.map((row: { operatorList: Operator[] }, index: number) => {
        if (index === id) {
          row.operatorList.forEach((operatorObj: Operator) => {
            if (operatorObj.name === value) {
              component = operatorObj.component;
              defaultValue = operatorObj.defaultValue;
              return;
            }
          });
          return {
            ...row,
            component: component,
            operator: value,
            value: defaultValue,
          };
        }
        return row;
      }),
    );
  };

  const updateOperator = (id: number, value: string) => {
    let operators: Operator[] = [];
    let componentValue: any = "";

    // set the operator list to be displayed after field has been selected
    columns.map((column) => {
      if (column.field === value && column.operators) {
        operators = column.operators;
        componentValue =
          column.operators[0].defaultValue !== undefined
            ? column.operators[0].defaultValue
            : "";
      }
    });

    // update the default or first operator
    setData(
      data.map((row: any, index: number) => {
        if (index === id) {
          return {
            ...row,
            field: value,
            operator: operators[0].name,
            operatorList: operators,
            component: operators[0].component,
            value: componentValue,
            options: operators[0].options ?? [],
          };
        }
        return row;
      }),
    );
  };

  const filteredColumns = () =>
    columns
      .filter((column) => column.type !== "action")
      .filter((column) => !column.hidden);

  const executeFilter = async () => {
    await fetchData(data);
  };

  // Update specific filter value by index
  const updateFilterValue = (index: number, newValue: string) => {
    const updatedFilters = [...data];
    updatedFilters[index].value = newValue;
    setData(updatedFilters);
  };

  useEffect(() => {
    getOperatorList(firstVisibleField);
    if (data.length === 0) {
      setData([blankItem]);
    }
  }, [data]);

  useEffect(() => {
    if (reload) {
      (async () => {
        try {
          await executeFilter();
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      })();
      setReload(false);
    }
  }, [reload]);

  return (
    <div style={formStyle}>
      <div style={{ flex: 1, padding: "8px" }}>
        <Grid2 container spacing={1}>
          {data.length > 1 && <Grid2 size={1} />}
          <Grid2 size={2} />
          <Grid2 size={data.length > 1 ? 3 : 3}>Column</Grid2>
          <Grid2 size={data.length > 1 ? 3 : 3}>Operator</Grid2>
          <Grid2 size={data.length > 1 ? 3 : 4}>Value</Grid2>
        </Grid2>
        {data.map((row, index) => (
          <Grid2 key={index} container spacing={1} style={{ padding: "2px" }}>
            {data.length > 1 && (
              <Grid2 size={1}>
                {data.length > 1 && (
                  <div style={closeButtonDiv}>
                    <Button
                      style={closeButtonStyle}
                      onClick={() => removeRow(index)}
                    >
                      <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
                    </Button>
                  </div>
                )}
              </Grid2>
            )}

            <Grid2 size={2}>
              <FormControl>
                {data.length > 1 && index > 0 && (
                  <Select
                    size="small"
                    value={row.logicOperator ?? "AND"}
                    onChange={(e) => {
                      updateLogicOperator(index, e.target.value);
                    }}
                    variant="outlined"
                  >
                    <MenuItem value="and" key="and">
                      And
                    </MenuItem>
                    <MenuItem value="or" key="or">
                      Or
                    </MenuItem>
                  </Select>
                )}
              </FormControl>
            </Grid2>

            <Grid2 size={data.length > 1 ? 3 : 3} sx={{ flex: 1 }}>
              <FormControl fullWidth={true}>
                <Select
                  size="small"
                  variant="outlined"
                  value={row.field ?? ""}
                  onChange={(e) => {
                    updateOperator(index, e.target.value);
                  }}
                  sx={{ width: "100%" }}
                >
                  {filteredColumns().map((column, colInd) => (
                    <MenuItem key={`${index}-${colInd}`} value={column.field}>
                      {column.headerName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={data.length > 1 ? 3 : 3}>
              <FormControl fullWidth={true}>
                <Select
                  size="small"
                  variant="outlined"
                  value={row.operator !== "" ? row.operator : ""}
                  onChange={(e) => {
                    updateComponent(index, e.target.value);
                  }}
                  sx={{ width: "100%" }}
                >
                  {row.operatorList.map(
                    (operator: Operator, operatorInd: any) => (
                      <MenuItem
                        key={`${index}-${operatorInd}`}
                        value={operator.name}
                      >
                        {operator.name}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={data.length > 1 ? 3 : 4}>
              <FormControl>
                <FilterFieldRenderer
                  type={row.component ?? "text"}
                  inputValue={row.value}
                  placeholder="value"
                  field={row.field}
                  options={row.options ?? []}
                  modelValue={modelValue}
                  setModelValue={(newValue: string) =>
                    updateFilterValue(index, newValue)
                  }
                />
              </FormControl>
            </Grid2>
          </Grid2>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          padding: "8px",
          justifyContent: "space-between",
          marginTop: "auto",
        }}
      >
        <Button onClick={() => addBlankRow()}>Add filters</Button>
        <Button onClick={removeAllFilters}>Remove all filters</Button>
        <Button onClick={executeFilter}>Search</Button>
      </div>
    </div>
  );
};

export default FilterPanel;
