import React, {useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {Alert, Snackbar, SnackbarCloseReason} from "@mui/material";
import {getSignedUrl, uploadFile} from "../../composables/uploader/Uploader.tsx";

type FileUploaderProps = {
    shipmentProcessId: number;
    onUploaded: (url: string) => void;
    fileValue: string;
}

const FileUploader : React.FC<FileUploaderProps> = ({shipmentProcessId, onUploaded, fileValue}) => {
    const [selectedFile, setSelectedFile] = useState<File| null>(null);
    const [openSnackBar, setOpenSnackBar] = React.useState(false);
    const [snackMessage, setSnackMessage] = React.useState<{
        message: string;
        severity: "success" | "info" | "warning" | "error" | undefined;
    }>({
        message: "",
        severity: "success",
    });

    const getFileName= () => {
        if(!fileValue) return null;

        return fileValue.split(/[\\/]/).pop() ?? "";
    }

    const handleUploadFile= async (file: any) => {
        const response = await getSignedUrl();
        let error: boolean = false;
        if(!(response && response.data && response.data.uploadUrl)) error= true;

        const uploadResponse = await uploadFile(shipmentProcessId, file, response.data.uploadUrl);
        if(!uploadResponse) error = true;

        if(error){
            setSnackMessage({
                message: `Error uploading file`,
                severity: "error",
            });
            setOpenSnackBar(true);
        }
        return response.data.uploadUrl
    }

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
            onUploaded(selectedFile?.name ?? "");
            setSnackMessage({
                message: `File uploaded successfully`,
                severity: "success",
            });
            setOpenSnackBar(true);

        },
        onError: (error: Error)=>{
            setSnackMessage({
                message: `Could not upload file: ${error}`,
                severity: "error",
            });
            setOpenSnackBar(true);
        }
    });

    const extractFile= (e: EventTarget & HTMLInputElement) => {
        if(!e.files) return;

        setSelectedFile(e.files[0]);
    }

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
        if (!selectedFile) return;

        mutation.mutate(selectedFile);
    }


    return (
        <div className="form-container" style={{
            maxWidth: "420px",
            margin: "40px auto",
            padding: "24px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            backgroundColor: "#fff",
        }}>
            {fileValue &&(
             <div style={{
                 display: "flex",
                 justifyContent: "space-between",
                 alignItems: "center",
                 padding: "12px",
                 marginBottom: "20px",
                 border: "1px solid #e0e0e0",
                 borderRadius: "8px",
                 backgroundColor: "#f8f9fa",
                }}
             >
                <div>
                    <div style={{fontSize: "0.8rem", color: "#666"}}>
                        Attached file
                    </div>
                    <div style={{ fontWeight: 600}}>
                        📄 {getFileName()}
                    </div>
                </div>

                 <a
                     href={fileValue}
                     target="_blank"
                     rel="noopener noreferrer"
                     style={{
                         color: "#1976d2",
                         textDecoration: "none",
                         fontWeight: 600
                     }}
                     >
                     Open
                 </a>
             </div>
            )}

            <input type="file" onChange={(e) => extractFile(e.target)}
                   style={{ width: "100%", marginBottom: "20px" }}/>

            <button onClick={handleUpload} disabled={!selectedFile || mutation.isPending}
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
                    }}>
                {mutation.isPending ? 'Uploading...' : 'Upload file'}
            </button>

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
    )
}

export default FileUploader;