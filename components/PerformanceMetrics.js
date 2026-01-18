'use client';

import * as calc from '../utils/portfolioCalculations';

export default function PerformanceMetrics({ holdings, metrics }) {
    const metricsData = [
        {
            label: 'Best Performer',
            value: metrics.bestPerformer ? metrics.bestPerformer.symbol : 'N/A',
            subValue: metrics.bestPerformer ? calc.formatPercentage(metrics.bestPerformer.gainLossPercent) : '',
            color: 'var(--success)',
        },
        {
            label: 'Worst Performer',
            value: metrics.worstPerformer ? metrics.worstPerformer.symbol : 'N/A',
            subValue: metrics.worstPerformer ? calc.formatPercentage(metrics.worstPerformer.gainLossPercent) : '',
            color: 'var(--error)',
        },
        {
            label: 'Average Return',
            value: calc.formatPercentage(metrics.averageReturn),
            subValue: 'Across all holdings',
            color: metrics.averageReturn >= 0 ? 'var(--success)' : 'var(--error)',
        },
        {
            label: 'Volatility',
            value: `${metrics.volatility.toFixed(2)}%`,
            subValue: 'Standard deviation',
            color: 'var(--warning)',
        },
        {
            label: 'Top 5 Concentration',
            value: `${metrics.concentrationRisk.toFixed(1)}%`,
            subValue: 'Of total portfolio',
            color: metrics.concentrationRisk > 50 ? 'var(--warning)' : 'var(--success)',
        },
        {
            label: 'Number of Holdings',
            value: holdings.length,
            subValue: `${Object.keys(metrics.assetAllocation).length} asset types`,
            color: 'var(--primary-blue)',
        },
    ];

    return (
        <div className="dashboard-card">
            <h3 className="card-header">Performance Metrics</h3>
            <div className="grid grid-cols-3 gap-3">
                {metricsData.map((metric, index) => (
                    <div
                        key={index}
                        style={{
                            padding: '20px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'all var(--transition-base)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                            {metric.label}
                        </p>
                        <h3 style={{ color: metric.color, marginBottom: '4px' }}>
                            {metric.value}
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {metric.subValue}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
