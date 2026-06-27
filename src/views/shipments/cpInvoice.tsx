import React from "react";
import { Card, CardContent, CardHeader, Grid2 } from "@mui/material";
import InvoiceList from "./invoiceList";
import CardTitle from "../../components/global/Card/CardTitle";

interface Props {
  shipmentId?: number;
}

const CpInvoice: React.FC<Props> = ({ shipmentId }) => {
  return (
    <div style={{ backgroundColor: "hsl(0deg 0% 100%)", padding: "16px" }}>
      <CardTitle>Cp invoice</CardTitle>
      <div style={{ paddingTop: "16px", paddingLeft: "16px" }}>
        <Grid2 container size={12}>
          <InvoiceList type="cp" shipmentId={shipmentId} />
        </Grid2>
      </div>
    </div>
  );
};

export default CpInvoice;
