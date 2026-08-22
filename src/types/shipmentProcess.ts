export interface ShipmentProcess {
    ShipmentProcessId: number;
    ShipmentId: number;
    client_identification: string;
    booking_instructions: string;
    document_entries: string;
    documents: boolean;
    tracking: string;
    custom_clearance: string;
    delivery_haulage: string;
    billing_debtors: string;
}
