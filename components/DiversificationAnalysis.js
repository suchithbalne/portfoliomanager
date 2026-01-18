'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function DiversificationAnalysis({ holdings, metrics }) {
    const assetColors = {
        'Stock': '#8b5cf6',
        'ETF': '#3b82f6',
        'Crypto': '#14b8a6',
        'Bond': '#f59e0b',
        'Other': '#6366f1',
    };

    const sectorColors = [
        '#8b5cf6', '#3b82f6', '#14b8a6', '#ec4899', '#f59e0b',
        '#10b981', '#ef4444', '#6366f1', '#06b6d4', '#a855f7',
    ];

    // Asset allocation chart data
    const assetLabels = Object.keys(metrics.assetAllocation);
    const assetData = {
        labels: assetLabels,
        datasets: [
            {
                data: assetLabels.map(type => metrics.assetAllocation[type].percentage),
                backgroundColor: assetLabels.map(type => assetColors[type] || assetColors['Other']),
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 2,
            },
        ],
    };

    // Sector allocation chart data
    const sectorLabels = Object.keys(metrics.sectorAllocation);
    const sectorData = {
        labels: sectorLabels,
        datasets: [
            {
                label: 'Allocation %',
                data: sectorLabels.map(sector => metrics.sectorAllocation[sector].percentage),
                backgroundColor: sectorColors,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#a1a1aa',
                    padding: 12,
                    font: { size: 11 },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                callbacks: {
                    label: (context) => {
                        return `${context.label}: ${context.parsed.toFixed(1)}%`;
                    },
                },
            },
        },
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#a1a1aa',
                    callback: (value) => value + '%',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
            },
            x: {
                ticks: { color: '#a1a1aa' },
                grid: { display: false },
            },
        },
    };

    const getDiversificationLevel = (score) => {
        if (score >= 70) return { text: 'Excellent', color: 'var(--success)' };
        if (score >= 50) return { text: 'Good', color: 'var(--primary-blue)' };
        if (score >= 30) return { text: 'Moderate', color: 'var(--warning)' };
        return { text: 'Poor', color: 'var(--error)' };
    };

    const level = getDiversificationLevel(metrics.diversificationScore);

    const advancedStats = [
        {
            title: 'HHI',
            value: (metrics.hhi ?? 0).toFixed(2),
            desc: 'Concentration (Lower is better)',
            target: 'Target: < 0.15',
            info: 'Herfindahl-Hirschman Index.\n< 0.15 is diverse, > 0.25 is very concentrated.'
        },
        {
            title: 'Effective Stocks',
            value: (metrics.effectiveStocks ?? 0).toFixed(1),
            desc: 'Equivalent equal-weight count',
            target: 'Target: Closer to actual count',
            info: 'The number of equal-sized positions that would provide the same diversification benefits.\nHigher is better.'
        },
        {
            title: 'Sector Ratio',
            value: (metrics.sectorRatio ?? 0).toFixed(2),
            desc: 'Sectors per stock',
            target: 'Target: > 0.2',
            info: 'Ratio of unique sectors to total stocks.\nHigher indicates better cross-sector spread.'
        },
        {
            title: 'Avg Correlation',
            value: (metrics.avgCorrelation ?? 0).toFixed(2),
            desc: 'Asset co-movement (0-1)',
            target: 'Target: < 0.5',
            info: 'How closely your assets move together.\nLower correlation improves diversification.'
        },
    ];

    return (
        <div className="grid gap-3">
            {/* Diversification Score Card */}
            <div className="dashboard-card">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="card-header">Diversification Score</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Based on asset types, sectors, and concentration
                        </p>
                    </div>
                    <div className="text-center">
                        <div
                            style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: `conic-gradient(${level.color} ${metrics.diversificationScore}%, rgba(255,255,255,0.1) 0)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            <div
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    background: 'var(--bg-secondary)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <h2 style={{ color: level.color, marginBottom: '4px' }}>
                                    {metrics.diversificationScore.toFixed(0)}
                                </h2>
                                <p style={{ fontSize: '0.75rem', color: level.color }}>{level.text}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Metrics */}
            <div className="dashboard-card">
                <h3 className="card-header">Advanced Diversification Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {advancedStats.map((stat, i) => (
                        <div key={i} style={{
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            position: 'relative'
                        }}>
                            <div className="flex justify-between items-start mb-1">
                                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{stat.title}</h4>
                                <div className="info-icon">
                                    ⓘ
                                    <div className="custom-tooltip">{stat.info}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--primary-purple)', marginBottom: '4px' }}>{stat.value}</div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{stat.desc}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--primary-blue)', opacity: 0.9 }}>
                                {stat.target}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Asset Type Breakdown */}
                <div className="dashboard-card">
                    <div style={{ borderBottom: '1px solid var(--primary-purple)', paddingBottom: '12px', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Asset Type Breakdown</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                            {assetLabels.length} different asset types
                        </p>
                    </div>
                    <div className="chart-container" style={{ height: '300px' }}>
                        <Doughnut data={assetData} options={doughnutOptions} />
                    </div>
                </div>

                {/* Sector Breakdown */}
                <div className="dashboard-card">
                    <div style={{ borderBottom: '1px solid var(--primary-purple)', paddingBottom: '12px', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sector Breakdown</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                            {sectorLabels.length} different sectors
                        </p>
                    </div>
                    <div className="chart-container" style={{ height: '300px' }}>
                        <Bar data={sectorData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="dashboard-card">
                <h3 className="card-header">Diversification Recommendations</h3>
                <div className="grid grid-cols-2 gap-3">
                    {metrics.concentrationRisk > 50 && (
                        <div
                            style={{
                                padding: '16px',
                                background: 'var(--warning-bg)',
                                border: '1px solid var(--warning)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            <h4 style={{ color: 'var(--warning)', marginBottom: '8px' }}>⚠️ High Concentration</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Your top 5 holdings represent {metrics.concentrationRisk.toFixed(1)}% of your portfolio.
                                Consider rebalancing to reduce risk.
                            </p>
                        </div>
                    )}

                    {assetLabels.length < 3 && (
                        <div
                            style={{
                                padding: '16px',
                                background: 'var(--warning-bg)',
                                border: '1px solid var(--warning)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            <h4 style={{ color: 'var(--warning)', marginBottom: '8px' }}>📊 Limited Asset Types</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                You only have {assetLabels.length} asset type(s). Consider adding ETFs, bonds, or other
                                asset classes for better diversification.
                            </p>
                        </div>
                    )}

                    {sectorLabels.length < 5 && (
                        <div
                            style={{
                                padding: '16px',
                                background: 'var(--warning-bg)',
                                border: '1px solid var(--warning)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            <h4 style={{ color: 'var(--warning)', marginBottom: '8px' }}>🎯 Sector Concentration</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Your portfolio is concentrated in {sectorLabels.length} sector(s). Consider diversifying
                                across more industries.
                            </p>
                        </div>
                    )}

                    {metrics.diversificationScore >= 70 && (
                        <div
                            style={{
                                padding: '16px',
                                background: 'var(--success-bg)',
                                border: '1px solid var(--success)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            <h4 style={{ color: 'var(--success)', marginBottom: '8px' }}>✅ Well Diversified</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Your portfolio shows good diversification across asset types and sectors. Keep monitoring
                                to maintain balance.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
