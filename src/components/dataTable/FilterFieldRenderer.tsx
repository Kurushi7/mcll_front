import { Box, MenuItem, Select, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";

interface Props {
  type: string;
  inputValue: any;
  placeholder: string;
  field: string;
  options: any;
  modelValue: any;
  setModelValue: React.Dispatch<React.SetStateAction<any>>;
}

const FilterFieldRenderer: React.FC<Props> = ({
  type,
  inputValue,
  placeholder,
  options,
  modelValue,
  setModelValue,
}) => {
  const [error, setError] = useState("");

  // useEffect(() => {
  //   setModelValue(inputValue);
  // }, [inputValue]);

  return (
    <Box sx={{ display: "flex" }}>
      {(() => {
        switch (type) {
          case "number":
            return (
              <TextField
                autoFocus
                size="small"
                fullWidth
                required
                placeholder={placeholder}
                type="number"
                color={error ? "error" : "primary"}
                error={!!error}
                helperText={error || ""}
                value={inputValue}
                onChange={(event) => {
                  const value = parseFloat(event.target.value);
                  setModelValue(isNaN(value) ? 0 : value);
                }}
                sx={{ padding: "8px" }}
              />
            );
          case "date":
            return (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label=""
                  value={inputValue ?? null}
                  onChange={(newValue) => setModelValue(newValue)}
                  slotProps={{
                    textField: {
                      variant: "outlined",
                    },
                  }}
                  sx={{ padding: "8px" }}
                />
              </LocalizationProvider>
            );
          case "multi-select":
            return (
              <Select
                multiple
                value={inputValue}
                onChange={(newValue) => setModelValue(newValue)}
                variant="outlined"
              >
                {options &&
                  options.map((option: any, index: number) => {
                    return (
                      <MenuItem key={index} value={option.id}>
                        <span style={{ marginRight: 10 }}>{option.flag}</span>{" "}
                        {option.label}
                      </MenuItem>
                    );
                  })}
              </Select>
            );
          default:
            return (
              <TextField
                autoFocus
                size="small"
                fullWidth
                required
                placeholder={placeholder}
                color={error ? "error" : "primary"}
                error={!!error}
                helperText={error || ""}
                value={inputValue}
                onChange={(event) => {
                  setModelValue(event.target.value);
                }}
                sx={{ mt: 1, ml: 1 }}
              />
            );
        }
      })()}
    </Box>
  );
};

export default FilterFieldRenderer;
