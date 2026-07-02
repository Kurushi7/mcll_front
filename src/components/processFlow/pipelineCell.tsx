import React from 'react';

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

interface PipelineCellProps {
    status: StepStatus;
    rowId: number;
    field: string;
    // Receives the entire database row containing all saved checkboxes, customer details, and dates
    rowData: Record<string, any>;
    onSegmentClick: (id: number, field: string) => void;
}

export const PipelineCell: React.FC<PipelineCellProps> = ({
  status,
  rowId,
  field,
  rowData,
  onSegmentClick,
}) => {


    const getStyleConfig = () => {
        switch (status) {
            case 'completed':
                return {
                    gradient: 'linear-gradient(to bottom, #ff7e15 0%, #e65c00 100%)', // Your signature orange
                    glow: '0 1px 3px rgba(230, 92, 0, 0.4)',
                };
            case 'in_progress':
                return {
                    gradient: 'linear-gradient(to bottom, #3b82f6 0%, #1d4ed8 100%)', // High-visibility blue
                    glow: '0 1px 3px rgba(29, 78, 216, 0.3)',
                };
            case 'failed':
                return {
                    gradient: 'linear-gradient(to bottom, #ef4444 0%, #b91c1c 100%)', // Exception/Error red
                    glow: '0 1px 3px rgba(185, 28, 28, 0.3)',
                };
            case 'pending':
            default:
                return {
                    gradient: 'linear-gradient(to bottom, #f1f5f9 0%, #cbd5e1 100%)', // Neutral placeholder gray
                    glow: 'none',
                };
        }
    };

    const formatDateString = (rawDateStr: string | undefined | null): string => {
        if (!rawDateStr) return '';

        if (rawDateStr.startsWith('0001-01-01')) {
            return '';
        }

        if (rawDateStr.includes('T')) {
            return rawDateStr.split('T')[0];
        }

        return rawDateStr;
    };

    const styleConfig = getStyleConfig();


    const getDisplayText = () => {
        switch (field) {
            case 'client_identification':
                return '';

            case 'booking_instructions':
                return '';

            case 'document_entries':
                return formatDateString(rowData.document_date) || '';

            case 'tracking':
                return formatDateString(rowData['tracking_date']) || '';
            case 'custom_clearance':
                return formatDateString(rowData['clearance_date']) || '';
            case 'delivery_haulage':
                return formatDateString(rowData['haulage_date']) || '';
            case 'billing_debtors':
                return rowData.billing_debtors;

            default:
                return '';
        }
    };

    const displayText = getDisplayText();
    const isLightBackground = status === 'pending';

    return (
        <div
            onClick={() => onSegmentClick(rowId, field)}
            style={{
                width: '100%',
                height: '32px',
                cursor: 'pointer',
                background: styleConfig.gradient,
                boxShadow: styleConfig.glow,
                position: 'relative',
                transition: 'all 0.15s ease',
                boxSizing: 'border-box',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            title={`${field.replace(/_/g, ' ')}: ${status}`}
        >
            {status !== 'pending' && (
                <div
                    style={{
                        position: 'absolute',
                        top: '1px',
                        left: '2px',
                        right: '2px',
                        height: '40%',
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 100%)',
                        borderRadius: '2px',
                        pointerEvents: 'none',
                    }}
                />
            )}

            {displayText && (
                <span
                    style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: isLightBackground ? '#475569' : '#ffffff',
                        textShadow: isLightBackground ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
                        pointerEvents: 'none',
                        zIndex: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        padding: '0 4px'
                    }}
                >
          {displayText}
        </span>
            )}
        </div>
    );
};
