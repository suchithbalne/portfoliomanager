'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AllocationChart({ holdings, metrics }) {
    const colors = [
        '#8b5cf6', '#3b82f6', '#14b8a6', '#ec4899', '#f59e0b',
        '#10b981', '#ef4444', '#6366f1', '#8b5cf6', '#06b6d4',
    ];

    // Get top 8 holdings by value, group rest as "Others"
    const sortedHoldings = [...holdings].sort((a, b) => b.marketValue - a.marketValue);
    const topHoldings = sortedHoldings.slice(0, 8);
    const otherHoldings = sortedHoldings.slice(8);

    const labels = topHoldings.map(h => h.symbol);
    const values = topHoldings.map(h => h.marketValue);

    if (otherHoldings.length > 0) {
        labels.push('Others');
        values.push(otherHoldings.reduce((sum, h) => sum + h.marketValue, 0));
    }

    const data = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: colors,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#a1a1aa',
                    padding: 15,
                    font: {
                        size: 12,
                    },
                    generateLabels: (chart) => {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return {
                                    text: `${label} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i,
                                };
                            });
                        }
                        return [];
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                    },
                },
            },
        },
    };

    return (
        <div className="glass-card">
            <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
                <h3>Portfolio Allocation</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                    Distribution by holding
                </p>
            </div>
            <div className="chart-container" style={{ height: '350px' }}>
                <Doughnut data={data} options={options} />
            </div>
        </div>
    );
}
