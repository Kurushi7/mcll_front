import React from 'react';
import {StepStatus} from "../../views/processFlow/processLayout.tsx";

interface PipelineCellProps {
    stepsArray: StepStatus[];
    rowId: string | number;
    onSegmentClick?: (rowId: string | number, index: number) => void;
}

export const PipelineCell: React.FC<PipelineCellProps> = (
    {stepsArray, rowId, onSegmentClick}) => {

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


    const barContainer = {
        display: 'flex',
        width: '100%',
        height: '22px',
        backgroundColor: '#f1f5f9', // Dark carbon base
        borderRadius: '6px',
        padding: '3px',            // Inset frame border
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.8)',
        overflow: 'hidden',
        gap: '2px'                 // The structural capsule dividers
    };

    if (!Array.isArray(stepsArray)) return null;

    return (
        <div style={{ display: 'flex', width: '100%', height: '40px', alignItems: 'center' }}>
            <div style={barContainer}>
                {stepsArray.map((status: StepStatus, index: number) => {
                    const styleConfig = THEME[status];

                    return (
                        <div
                            key={index}
                            onClick={() => onSegmentClick?.(rowId, index)}
                            style={{
                                flex: 1,
                                background: styleConfig.gradient,
                                borderRadius: '3px',
                                cursor: onSegmentClick ? 'pointer' : 'default',
                                boxShadow: `${styleConfig.glow}, inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 3px rgba(0,0,0,0.4)`,
                                position: 'relative',
                                transition: 'all 0.15s ease',
                            }}
                            title={`Step ${index + 1}`}
                        >
                            {status !== 'pending' && (
                                <div style={{
                                    position: 'absolute',
                                    top: '1px',
                                    left: '2px',
                                    right: '2px',
                                    height: '35%',
                                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 100%)',
                                    borderRadius: '2px',
                                    pointerEvents: 'none',
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};