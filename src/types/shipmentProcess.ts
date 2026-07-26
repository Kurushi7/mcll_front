export interface ShipmentProcess {
    ShipmentProcessId: number;
    ShipmentId: number;
    client_identification: boolean;
    booking_instructions: boolean;
    document_entries: boolean;
    documents: boolean;
    tracking: string;
    custom_clearance: string;
    delivery_haulage: string;
    billing_debtors: string;
}
