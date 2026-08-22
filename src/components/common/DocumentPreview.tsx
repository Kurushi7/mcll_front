import React, { useEffect, useMemo } from "react";
import DocViewer, { DocViewerRenderers } from "@iamjariwala/react-doc-viewer";

type Props = {
  file: File;
};
const DocumentPreview: React.FC<Props> = ({ file }) => {
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <DocViewer
      documents={[{ uri: url }]}
      pluginRenderers={DocViewerRenderers}
      style={{ height: "80vh" }}
    />
  );
};

export default DocumentPreview;
