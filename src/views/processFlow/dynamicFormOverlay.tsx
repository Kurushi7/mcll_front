import React from "react";

export type ProcessStepType =
    | 'client_identification'
    | 'booking_instructions'
    | 'document_entries'
    | 'tracking'
    | 'custom_clearance'
    | 'delivery_haulage'
    | 'billing_debtors';

interface ColumnOverlayProps {
    activeForm: {
        rowId: number;
        columnId: ProcessStepType;
        initialData: any;
    } | null;
    onClose: () => void;
    onSave: (rowId: number, columnId: ProcessStepType, payload: Record<string, any>) => void;
}

export default function DynamicFormOverlay({ activeForm, onClose, onSave }: ColumnOverlayProps) {
    if (!activeForm) return null;

    const { columnId, initialData } = activeForm;

    const renderFields = () => {
        switch (columnId) {
            case 'client_identification':
                return (
                    <>
                        <label style={labelStyle}>Customer Name</label>
                        <input
                            type="text"
                            name="customer_detail"
                            defaultValue={initialData.customer_detail || ''}
                            placeholder="Enter customer verification code or name..."
                            style={inputStyle}
                            required
                        />
                    </>
                );

            case 'booking_instructions':
                return (
                    <>
                        <label style={labelStyle}>Booking Verifications</label>
                        <div style={checkboxGroupStyle}>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" name="booking_done" defaultChecked={!!initialData.booking_done} style={checkboxStyle} />
                                Booking Done
                            </label>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" name="booking_confirmation" defaultChecked={!!initialData.booking_confirmation} style={checkboxStyle} />
                                Booking Confirmation
                            </label>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" name="release_order" defaultChecked={!!initialData.release_order} style={checkboxStyle} />
                                Release Order Attached
                            </label>
                        </div>
                    </>
                );

            case 'document_entries':
                return (
                    <>
                        <label style={labelStyle}>Manifest Documents Cleared</label>
                        <div style={checkboxGroupStyle}>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" name="debit_note" defaultChecked={!!initialData.debit_note} style={checkboxStyle} />
                                Debit Note Verified
                            </label>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" name="housebl" defaultChecked={!!initialData.housebl} style={checkboxStyle} />
                                House BL (HBL) Resolved
                            </label>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" name="masterbl" defaultChecked={!!initialData.masterbl} style={checkboxStyle} />
                                Master BL (MBL) Closed
                            </label>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" name="invoice" defaultChecked={!!initialData.invoice} style={checkboxStyle} />
                                Commercial Invoice Settled
                            </label>
                        </div>

                        <label style={labelStyle}>Documentation Processing Date</label>
                        <input
                            type="date"
                            name="document_entries_date"
                            defaultValue={initialData.document_entries_date || ''}
                            style={inputStyle}
                            required
                        />
                    </>
                );

            // Steps 4, 5, 6, and 7 all share the unified Date + Status Change layout patterns
            case 'tracking':
            case 'custom_clearance':
            case 'delivery_haulage':
            case 'billing_debtors':
                const currentStatus = initialData[columnId] || 'pending';
                const dateFieldName = `${columnId}_date`;

                return (
                    <>
                        <label style={labelStyle}>Update Pipeline Status</label>
                        <select name={columnId} defaultValue={currentStatus} style={inputStyle}>
                            <option value="pending">Pending (Gray)</option>
                            <option value="in_progress">In Progress (Blue)</option>
                            <option value="completed">Completed (Orange)</option>
                            <option value="failed">Failed / Exception (Red)</option>
                        </select>

                        <label style={labelStyle}>Milestone Resolution Date</label>
                        <input
                            type="date"
                            name={dateFieldName}
                            defaultValue={initialData[dateFieldName] || ''}
                            style={inputStyle}
                            required
                        />
                    </>
                );

            default:
                return <p style={{ fontSize: '14px', color: '#64748b' }}>Unknown process step pipeline context.</p>;
        }
    };

    return (
        <div style={backdropStyle}>
            <div style={modalCardStyle}>
                <h3 style={headerStyle}>
                    Update: {columnId.replace(/_/g, ' ')}
                </h3>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const payload: Record<string, any> = {};

                    formData.forEach((value, key) => {
                        payload[key] = value;
                    });

                    if (columnId === 'client_identification') {
                        payload.client_identification = payload.customer_detail ? 'completed' : 'pending';
                    }

                    if (columnId === 'booking_instructions') {
                        payload.booking_done = formData.has('booking_done');
                        payload.booking_confirmation = formData.has('booking_confirmation');
                        payload.release_order = formData.has('release_order');

                        payload.booking_instructions = (payload.booking_instructions_date && payload.booking_done) ? 'completed' : 'in_progress';
                    }

                    if (columnId === 'document_entries') {
                        payload.debit_note = formData.has('debit_note');
                        payload.housebl = formData.has('housebl');
                        payload.masterbl = formData.has('masterbl');
                        payload.invoice = formData.has('invoice');

                        payload.document_entries = payload.document_entries_date ? 'completed' : 'in_progress';
                    }

                    onSave(activeForm.rowId, columnId, payload);
                }}>

                    <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                        {renderFields()}
                    </div>

                    {/* Action Button Row */}
                    <div style={actionsContainerStyle}>
                        <button type="button" onClick={onClose} style={cancelBtnStyle}>
                            Cancel
                        </button>
                        <button type="submit" style={saveBtnStyle}>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Fixed CSS Inline Styling Rule Configurations
const backdropStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalCardStyle: React.CSSProperties = { backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', width: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', boxSizing: 'border-box' };
const headerStyle: React.CSSProperties = { margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', letterSpacing: '0.05em' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '6px', marginTop: '14px', letterSpacing: '0.02em' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#1e293b', boxSizing: 'border-box', outline: 'none' };
const checkboxGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#f8fafc' };
const checkboxLabelStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', fontWeight: 500 };
const checkboxStyle: React.CSSProperties = { width: '16px', height: '16px', cursor: 'pointer' };
const actionsContainerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' };
const cancelBtnStyle: React.CSSProperties = { padding: '9px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' };
const saveBtnStyle: React.CSSProperties = { padding: '9px 16px', borderRadius: '6px', background: '#f97316', color: '#ffffff', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' };