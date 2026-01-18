'use client';

import { useState } from 'react';
import * as calc from '../utils/portfolioCalculations';

export default function HoldingsTable({ holdings, showAll = true }) {
    const [sortField, setSortField] = useState('marketValue');
    const [sortDirection, setSortDirection] = useState('desc');

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedHoldings = [...holdings].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const multiplier = sortDirection === 'asc' ? 1 : -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return (aVal - bVal) * multiplier;
        }
        return String(aVal).localeCompare(String(bVal)) * multiplier;
    });

    const displayHoldings = showAll ? sortedHoldings : sortedHoldings.slice(0, 10);

    const SortIcon = ({ field }) => {
        if (sortField !== field) return null;
        return (
            <span style={{ marginLeft: '4px' }}>
                {sortDirection === 'asc' ? '↑' : '↓'}
            </span>
        );
    };

    return (
        <div className="dashboard-card">
            <h3 className="card-header">{showAll ? 'All Holdings' : 'Top Holdings'}</h3>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('symbol')}>
                                Symbol <SortIcon field="symbol" />
                            </th>
                            <th onClick={() => handleSort('name')}>
                                Name <SortIcon field="name" />
                            </th>
                            <th onClick={() => handleSort('quantity')} className="text-right">
                                Quantity <SortIcon field="quantity" />
                            </th>
                            <th onClick={() => handleSort('currentPrice')} className="text-right">
                                Price <SortIcon field="currentPrice" />
                            </th>
                            <th onClick={() => handleSort('marketValue')} className="text-right">
                                Value <SortIcon field="marketValue" />
                            </th>
                            <th onClick={() => handleSort('gainLoss')} className="text-right">
                                Gain/Loss <SortIcon field="gainLoss" />
                            </th>
                            <th onClick={() => handleSort('gainLossPercent')} className="text-right">
                                Return <SortIcon field="gainLossPercent" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayHoldings.map((holding, index) => (
                            <tr key={holding.symbol + index}>
                                <td>
                                    <strong style={{ color: 'var(--text-primary)' }}>{holding.symbol}</strong>
                                </td>
                                <td>
                                    <div>
                                        <div style={{ color: 'var(--text-primary)' }}>{holding.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                            {holding.assetType} • {holding.sector}
                                        </div>
                                    </div>
                                </td>
                                <td className="text-right">{calc.formatNumber(holding.quantity)}</td>
                                <td className="text-right">{calc.formatCurrency(holding.currentPrice)}</td>
                                <td className="text-right">
                                    <strong style={{ color: 'var(--text-primary)' }}>
                                        {calc.formatCurrency(holding.marketValue)}
                                    </strong>
                                </td>
                                <td
                                    className="text-right"
                                    style={{ color: holding.gainLoss >= 0 ? 'var(--success)' : 'var(--error)' }}
                                >
                                    {calc.formatCurrency(holding.gainLoss)}
                                </td>
                                <td className="text-right">
                                    <span
                                        className={`badge ${holding.gainLossPercent >= 0 ? 'badge-success' : 'badge-error'}`}
                                    >
                                        {calc.formatPercentage(holding.gainLossPercent)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!showAll && holdings.length > 10 && (
                <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Showing 10 of {holdings.length} holdings
                    </p>
                </div>
            )}
        </div>
    );
}
