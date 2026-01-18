'use client';

import { useState } from 'react';
import * as calc from '../utils/portfolioCalculations';

export default function HoldingsTable({ holdings, showAll = true }) {
    const [sortField, setSortField] = useState('marketValue');
    const [sortDirection, setSortDirection] = useState('desc');
    const [selectedSector, setSelectedSector] = useState('All');
    const [selectedAssetType, setSelectedAssetType] = useState('All');

    // Get unique values for filters
    const sectors = ['All', ...new Set(holdings.map(h => h.sector || 'Unknown'))].sort();
    const assetTypes = ['All', ...new Set(holdings.map(h => h.assetType || 'Unknown'))].sort();

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const filteredHoldings = holdings.filter(h => {
        const sectorMatch = selectedSector === 'All' || (h.sector || 'Unknown') === selectedSector;
        const assetMatch = selectedAssetType === 'All' || (h.assetType || 'Unknown') === selectedAssetType;
        return sectorMatch && assetMatch;
    });

    const sortedHoldings = [...filteredHoldings].sort((a, b) => {
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
            <div style={{ padding: '20px 20px 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <h3 className="card-header" style={{ padding: 0, margin: 0, border: 'none' }}>
                    {showAll ? 'All Holdings' : 'Top Holdings'}
                </h3>

                {showAll && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select
                            className="input"
                            style={{ padding: '8px 12px', fontSize: '0.875rem', minWidth: '140px' }}
                            value={selectedAssetType}
                            onChange={(e) => setSelectedAssetType(e.target.value)}
                        >
                            {assetTypes.map(type => (
                                <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                            ))}
                        </select>
                        <select
                            className="input"
                            style={{ padding: '8px 12px', fontSize: '0.875rem', minWidth: '140px' }}
                            value={selectedSector}
                            onChange={(e) => setSelectedSector(e.target.value)}
                        >
                            {sectors.map(sector => (
                                <option key={sector} value={sector}>{sector === 'All' ? 'All Sectors' : sector}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Divider if headers were inline, but now they are in a flex headers above */}
            <div style={{ height: '20px' }}></div>

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
