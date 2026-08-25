import React, { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Alert, Snackbar, SnackbarCloseReason } from "@mui/material";
import {
  getSignedUrl,
  uploadFile,
} from "../../composables/uploader/Uploader.tsx";
import DocumentPreview from "../common/DocumentPreview.tsx";

type FileUploaderProps = {
  shipmentProcessId: number;
  onUploaded: (url: string) => void;
  fileValue: string;
};

const FileUploader: React.FC<FileUploaderProps> = ({
  shipmentProcessId,
  onUploaded,
  fileValue,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<
    { file: File; error: string }[]
  >([]);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState<{
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
  }>({
    message: "",
    severity: "success",
  });
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewFile, setPreviewFile] = React.useState<File | null>(null);

  const handleUploadFile = async (file: any) => {
    const response = await getSignedUrl();
    let error: boolean = false;
    if (!(response && response.data && response.data.data)) error = true;

    await Promise.all(
      response.data.data.map((item: { url: string; error: string }, index) => {
        if (item.error) {
          return Promise.resolve();
        }

        return uploadFile(shipmentProcessId, file, item.url);
      }),
    );

    if (error) {
      setSnackMessage({
        message: `Error uploading file`,
        severity: "error",
      });
      setOpenSnackBar(true);
    }
    return response.data.uploadUrl;
  };

  const mutation = useMutation({
    mutationFn: handleUploadFile,
    onMutate: () => {
      setSnackMessage({
        message: `Uploading file... Please wait`,
        severity: "info",
      });
      setOpenSnackBar(true);
    },
    onSuccess: async (data: any) => {
      // onUploaded(selectedFile?.name ?? "");
      setSnackMessage({
        message: `File uploaded successfully`,
        severity: "success",
      });
      setOpenSnackBar(true);
    },
    onError: (error: Error) => {
      setSnackMessage({
        message: `Could not upload file: ${error}`,
        severity: "error",
      });
      setOpenSnackBar(true);
    },
  });

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
  };

  const handleAddFiles = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReplaceIndex(null);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);

    if (!files) return;

    setSelectedFiles((previous) => {
      if (replaceIndex !== null) {
        const next = [...previous];
        next[replaceIndex] = { file: files[0], error: "" };
        return next;
      }

      return [
        ...previous,
        ...files.map((file) => ({
          file,
          error: "",
        })),
      ];
    });

    setReplaceIndex(null);
    event.target.value = "";
  };

  const handleReplaceFile = (index: number) => {
    setReplaceIndex(index);

    fileInputRef.current?.click();
  };

  const handleClose = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackBar(false);
  };

  const handleUpload = () => {
    if (!selectedFiles) return;

    mutation.mutate(selectedFiles);
  };

  const handleOpenPreview = (file: File, preview: boolean) => {
    setPreviewFile(file);
    setPreviewOpen(preview);
  };

  return (
    <div
      className="form-container"
      style={{
        maxWidth: "420px",
        margin: "20px auto",
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        backgroundColor: "#fff",
      }}
    >
      <button
        style={{ marginBottom: "20px" }}
        onClick={(e) => handleAddFiles(e)}
      >
        + Add files
      </button>

      {selectedFiles.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              fontSize: "0.85rem",
              color: "#666",
              marginBottom: "8px",
              fontWeight: 600,
            }}
          >
            Files to upload
          </div>

          {selectedFiles.map((file, index) => (
            <div
              key={`${file.file.name}-${index}`}
              style={{
                padding: "12px",
                marginBottom: "8px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                backgroundColor: "#f8f9fa",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {file.error ? (
                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    {file.error}
                  </div>
                ) : (
                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      📄 {file.file.name}
                    </div>

                    <div
                      style={{
                        marginLeft: "6px",
                        fontSize: "0.8rem",
                        color: "#666",
                        marginTop: "4px",
                      }}
                    >
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                )}
              </div>

              {/* File actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  marginTop: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleOpenPreview(file.file, true)}
                  style={{
                    border: "1px solid #1976d2",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#1976d2",
                    padding: "6px 12px",
                    cursor: mutation.isPending ? "not-allowed" : "pointer",
                  }}
                >
                  Open
                </button>

                <button
                  type="button"
                  onClick={() => handleReplaceFile(index)}
                  disabled={mutation.isPending}
                  style={{
                    border: "1px solid #1976d2",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#1976d2",
                    padding: "6px 12px",
                    cursor: mutation.isPending ? "not-allowed" : "pointer",
                  }}
                >
                  Replace
                </button>

                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={mutation.isPending}
                  style={{
                    border: "1px solid #d32f2f",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#d32f2f",
                    padding: "6px 12px",
                    cursor: mutation.isPending ? "not-allowed" : "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        multiple={true}
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e)}
        hidden
        style={{ width: "100%", marginBottom: "20px" }}
      />

      <button
        onClick={handleUpload}
        disabled={!selectedFiles || mutation.isPending}
        style={{
          width: "100%",
          padding: "12px",
          border: "none",
          borderRadius: "8px",
          backgroundColor: mutation.isPending ? "#9e9e9e" : "#1976d2",
          color: "white",
          cursor: mutation.isPending ? "not-allowed" : "pointer",
          fontWeight: 600,
          transition: "background-color 0.2s",
        }}
      >
        {mutation.isPending ? "Uploading..." : "Upload file"}
      </button>

      {previewFile && (
        <DocumentPreview
          file={previewFile}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      )}

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

export default FileUploader;
