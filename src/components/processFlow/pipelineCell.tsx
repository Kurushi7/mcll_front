import React from 'react';
import {StepStatus} from "../../views/processFlow/processLayout.tsx";

type StepField =
    | "client_identification"
    | "booking_instructions"
    | "document_entries"
    | "tracking"
    | "custom_clearance"
    | "delivery_haulage"
    | "billing_debtors";

interface PipelineCellProps {
    status: StepStatus;
    rowId: number;
    field: StepField;
    stepFields: readonly StepField[];
    onSegmentClick?: (rowId: number, field: string) => void;
}

export const PipelineCell: React.FC<PipelineCellProps> = (
    {status, rowId, field, stepFields, onSegmentClick}) => {

    const THEME: Record<StepStatus, { base: string; gradient: string; glow: string }> = {
        complete: {
            base: '#10b981',
            gradient: 'linear-gradient(to bottom, #a7f3d0 0%, #10b981 40%, #047857 100%)',
            glow: '0 2px 6px rgba(16, 185, 129, 0.2)',
        },
        correction: {
            base: '#f97316',
            gradient: 'linear-gradient(to bottom, #fed7aa 0%, #f97316 40%, #c2410c 100%)',
            glow: '0 2px 6px rgba(249, 115, 22, 0.2)',
        },
        pending: {
            base: '#2e3238',
            gradient: 'linear-gradient(to bottom, #ffffff 0%, #f1f5f9 50%, #cbd5e1 100%)',
            glow: 'none',
        }
    };

    const stepIndex = stepFields.indexOf(field);

    const isFirst = stepIndex === 0;
    const isLast = stepIndex === stepFields.length - 1;

    const styleConfig = THEME[status];

    return (
        <div
            onClick={() => onSegmentClick?.(rowId, field)}
            style={{
                width: '100%',
                height: '32px',
                borderRadius: '3px',
                cursor: onSegmentClick ? 'pointer' : 'default',
                background: styleConfig.gradient,
                boxShadow: `${styleConfig.glow}, inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 3px rgba(0,0,0,0.4)`,
                position: 'relative',
                transition: 'all 0.15s ease',
                boxSizing: 'border-box',

                borderTopLeftRadius: isFirst ? 8 : 0,
                borderBottomLeftRadius: isFirst ? 8 : 0,
                borderTopRightRadius: isLast ? 8 : 0,
                borderBottomRightRadius: isLast ? 8 : 0,
            }}
            title={field}
        >
            {status !== 'pending' && (
                <div
                    style={{
                        position: 'absolute',
                        top: '1px',
                        left: '2px',
                        right: '2px',
                        height: '40%',
                        background:
                            'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 100%)',
                        borderRadius: '2px',
                        pointerEvents: 'none',
                    }}
                />
            )}
        </div>
    );
};