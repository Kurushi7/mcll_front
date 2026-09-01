import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  Typography,
} from "@mui/material";
import * as XLSX from "xlsx";
import { z } from "zod";

const ImportFile: React.FC<any> = ({ open, onClose }: any) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [filename, _setFilename] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const schema = z.array(
    z.object({
      valid_from: z
        .string()
        .refine((val) => !isNaN(new Date(val).getTime()), {
          message: "Invalid valid from date format",
        })
        .transform((val) => new Date(val)),
      valid_to: z
        .string()
        .refine((val) => !isNaN(new Date(val).getTime()), {
          message: "Invalid valid to date format",
        })
        .transform((val) => new Date(val)),
      rate: z.number().max(2000, "Rate cannot be over 2000"),
    }),
  );

  const handleImport = async () => {
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      schema.parse(json);

      onClose();
    } catch (err: any) {
      if (err.errors) {
        setError(err.errors[0].message);
      } else {
        setError("Invalid file or unknown error");
      }
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose()}>
      <DialogTitle id="import-file">Choose CSV or Excel file</DialogTitle>
      <DialogContent>
        <Input
          type="file"
          slotProps={{
            input: {
              accept:
                ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          }}
          onChange={handleFileChange}
        />

        {filename && (
          <Typography variant="body2" color="textSecondary" component="div">
            📄File: {filename}
          </Typography>
        )}

        {error && <Typography color="error">⚠️ {error}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}> Close </Button>
        <Button onClick={handleImport} disabled={!file}>
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportFile;
