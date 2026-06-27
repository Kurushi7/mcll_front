import { ShipmentModel } from "../../types/request";
import { Document, Page, View, Text, PDFViewer } from "@react-pdf/renderer";
import { Column } from "../../types/table";
import { StyleSheet } from "@react-pdf/renderer";

interface Props {
  data: ShipmentModel[];
  total: number;
  selectedColumns: Column[];
}

const ShipmentListDocument = ({ data, total, selectedColumns }: Props) => {
  const styles = StyleSheet.create({
    page: {
      fontSize: 8,
      fontFamily: "Arial",
    },
    headerText: {
      fontSize: 12,
      marginTop: 10,
      marginBottom: 10,
      fontWeight: "bold",
      textAlign: "center",
    },
    table: {
      width: "100%",
      borderStyle: "solid",
      borderWidth: 1,
      borderRightWidth: 0,
      borderLeftWidth: 0,
    },
    tableRow: {
      flexDirection: "row",
      fontSize: 10,
    },
    tableHeader: {
      backgroundColor: "#AAAAAA",
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
      fontSize: 8,
    },
    tableColHeader: {
      flex: 1,
      borderRightWidth: 1,
      borderRightColor: "#ccc",
      padding: 6,
      fontWeight: "bold",
      textAlign: "left",
    },
    tableCol: {
      flex: 1,
      borderRightWidth: 1,
      borderRightColor: "#eee",
      padding: 6,
    },
    evenRow: {
      flexDirection: "row",
      backgroundColor: "#ffffff",
    },
    oddRow: {
      flexDirection: "row",
      backgroundColor: "#f9f9f9",
    },
  });

  const dateFields = ["eta", "etd"];

  return (
    <Document>
      <Page size={"A4"} style={styles.table}>
        <View style={styles.table}>
          <View style={styles.headerText}>
            <Text> Shipment list report</Text>
          </View>

          <View style={[styles.tableRow, styles.tableHeader]}>
            {selectedColumns.map((column, i) => (
              <Text key={i} style={styles.tableColHeader}>
                {column.headerName}
              </Text>
            ))}
          </View>

          {data.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.oddRow : styles.evenRow,
              ]}
            >
              {selectedColumns.map((col) => (
                <Text key={col.field} style={styles.tableCol}>
                  {dateFields.includes(col.field)
                    ? String(item[col.field as keyof ShipmentModel]).split(
                        "T",
                      )[0]
                    : String(item[col.field as keyof ShipmentModel])}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default ShipmentListDocument;
