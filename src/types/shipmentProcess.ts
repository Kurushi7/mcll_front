export interface ShipmentProcess {
    ShipmentProcessId: number;
    ShipmentId: number;
    client_identification: boolean;
    booking_instructions: boolean;
    document_entries: boolean;
    documents: boolean;
    tracking: boolean;
    custom_clearance: boolean;
    delivery_haulage: boolean;
    billing_debtors: boolean;
}
