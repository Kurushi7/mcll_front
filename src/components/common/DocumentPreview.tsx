import React, { useEffect, useMemo, useState } from "react";
import DocViewer, { DocViewerRenderers } from "@iamjariwala/react-doc-viewer";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { GridCloseIcon } from "@mui/x-data-grid";

type Props = {
  file: File;
  open: boolean;
  onClose: () => void;
};

const DocumentPreview: React.FC<Props> = ({ file, open, onClose }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            width: "70vw",
            maxWidth: "1000px",
            height: "90vh",
            maxHeight: "90vh",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {file.name}

        <IconButton onClick={onClose}>
          <GridCloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: "80vh" }}>
        {url && (
          <iframe
            src={url}
            style={{
              width: "100%",
              height: "80vh",
              border: 0,
            }}
          />
        )}
        {/*<DocViewer*/}
        {/*  documents={[{ uri: url }]}*/}
        {/*  pluginRenderers={DocViewerRenderers}*/}
        {/*  style={{ height: "80vh" }}*/}
        {/*/>*/}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentPreview;
