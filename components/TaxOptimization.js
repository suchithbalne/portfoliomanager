'use client';

import { usePortfolio } from '../context/PortfolioContext';
import * as calc from '../utils/portfolioCalculations';
import { formatCurrency as formatMarketCurrency } from '../utils/markets/marketConfig';

export default function TaxOptimization({ holdings }) {
    const { activePortfolio } = usePortfolio();
    const market = activePortfolio?.market || 'US';

    // Helper function to format currency based on market
    const formatCurrency = (amount) => {
        return market ? formatMarketCurrency(amount, market) : calc.formatCurrency(amount);
    };
    const taxLossOpportunities = calc.identifyTaxLossOpportunities(holdings);
    const gainsByPeriod = calc.calculateGainsByHoldingPeriod(holdings);

    const totalPotentialSavings = taxLossOpportunities.reduce(
        (sum, h) => sum + h.potentialTaxSavings,
        0
    );

    return (
        <div className="grid gap-3">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="dashboard-card">
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                        Tax Loss Opportunities
                    </p>
                    <h2 style={{ marginBottom: '4px', color: 'var(--primary-purple)' }}>
                        {taxLossOpportunities.length}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Potential savings: {formatCurrency(totalPotentialSavings)}
                    </p>
                </div>

                <div className="dashboard-card">
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                        Short-Term Gains
                    </p>
                    <h2
                        style={{
                            marginBottom: '4px',
                            color: gainsByPeriod.shortTerm.gains > 0 ? 'var(--success)' : 'var(--text-primary)',
                        }}
                    >
                        {formatCurrency(gainsByPeriod.shortTerm.gains)}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {gainsByPeriod.shortTerm.count} holdings
                    </p>
                </div>

                <div className="dashboard-card">
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                        Long-Term Gains
                    </p>
                    <h2
                        style={{
                            marginBottom: '4px',
                            color: gainsByPeriod.longTerm.gains > 0 ? 'var(--success)' : 'var(--text-primary)',
                        }}
                    >
                        {formatCurrency(gainsByPeriod.longTerm.gains)}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {gainsByPeriod.longTerm.count} holdings
                    </p>
                </div>
            </div>

            {/* Tax Loss Harvesting Opportunities */}
            {taxLossOpportunities.length > 0 ? (
                <div className="dashboard-card">
                    <h3 className="card-header">Tax Loss Harvesting Opportunities</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
                        Sell these positions to offset capital gains
                    </p>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Symbol</th>
                                    <th>Name</th>
                                    <th className="text-right">Current Loss</th>
                                    <th className="text-right">Potential Tax Savings</th>
                                    <th className="text-right">Purchase Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxLossOpportunities.map((holding, index) => (
                                    <tr key={index}>
                                        <td>
                                            <strong style={{ color: 'var(--text-primary)' }}>{holding.symbol}</strong>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{holding.name}</td>
                                        <td className="text-right" style={{ color: 'var(--error)' }}>
                                            {formatCurrency(holding.gainLoss)}
                                        </td>
                                        <td className="text-right" style={{ color: 'var(--success)' }}>
                                            {formatCurrency(holding.potentialTaxSavings)}
                                        </td>
                                        <td className="text-right" style={{ color: 'var(--text-secondary)' }}>
                                            {new Date(holding.purchaseDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="dashboard-card">
                    <div className="text-center" style={{ padding: '40px' }}>
                        <h3 style={{ color: 'var(--success)', marginBottom: '12px' }}>
                            ✅ No Tax Loss Opportunities
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            All your holdings are currently profitable. Great job!
                        </p>
                    </div>
                </div>
            )}

            {/* Gains Analysis */}
            <div className="dashboard-card">
                <h3 className="card-header">Capital Gains Analysis</h3>
                <div className="grid grid-cols-2 gap-3">
                    {/* Short-Term */}
                    <div
                        style={{
                            padding: '20px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                    >
                        <h4 style={{ marginBottom: '16px', color: 'var(--warning)' }}>
                            Short-Term ({"<"} 1 year)
                        </h4>
                        <div className="flex justify-between mb-2">
                            <span style={{ color: 'var(--text-secondary)' }}>Holdings:</span>
                            <strong>{gainsByPeriod.shortTerm.count}</strong>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span style={{ color: 'var(--text-secondary)' }}>Gains:</span>
                            <strong style={{ color: 'var(--success)' }}>
                                {formatCurrency(gainsByPeriod.shortTerm.gains)}
                            </strong>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span style={{ color: 'var(--text-secondary)' }}>Losses:</span>
                            <strong style={{ color: 'var(--error)' }}>
                                {formatCurrency(gainsByPeriod.shortTerm.losses)}
                            </strong>
                        </div>
                        <div
                            style={{
                                marginTop: '16px',
                                padding: '12px',
                                background: 'var(--warning-bg)',
                                borderRadius: 'var(--radius-sm)',
                            }}
                        >
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Taxed at ordinary income rates (up to 37%)
                            </p>
                        </div>
                    </div>

                    {/* Long-Term */}
                    <div
                        style={{
                            padding: '20px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                    >
                        <h4 style={{ marginBottom: '16px', color: 'var(--success)' }}>
                            Long-Term ({">"}= 1 year)
                        </h4>
                        <div className="flex justify-between mb-2">
                            <span style={{ color: 'var(--text-secondary)' }}>Holdings:</span>
                            <strong>{gainsByPeriod.longTerm.count}</strong>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span style={{ color: 'var(--text-secondary)' }}>Gains:</span>
                            <strong style={{ color: 'var(--success)' }}>
                                {formatCurrency(gainsByPeriod.longTerm.gains)}
                            </strong>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span style={{ color: 'var(--text-secondary)' }}>Losses:</span>
                            <strong style={{ color: 'var(--error)' }}>
                                {formatCurrency(gainsByPeriod.longTerm.losses)}
                            </strong>
                        </div>
                        <div
                            style={{
                                marginTop: '16px',
                                padding: '12px',
                                background: 'var(--success-bg)',
                                borderRadius: 'var(--radius-sm)',
                            }}
                        >
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Preferential tax rates (0%, 15%, or 20%)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tax Optimization Tips */}
            <div className="dashboard-card">
                <h3 className="card-header">Tax Optimization Strategies</h3>
                <div className="grid gap-2">
                    <div
                        style={{
                            padding: '16px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        <h4 style={{ color: 'var(--primary-purple)', marginBottom: '8px' }}>
                            💡 Hold for Long-Term Gains
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Wait at least one year before selling profitable positions to qualify for lower long-term
                            capital gains tax rates.
                        </p>
                    </div>

                    <div
                        style={{
                            padding: '16px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        <h4 style={{ color: 'var(--primary-blue)', marginBottom: '8px' }}>
                            📅 Time Your Sales
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Consider selling losing positions before year-end to offset gains. Be aware of wash sale
                            rules (30-day period).
                        </p>
                    </div>

                    <div
                        style={{
                            padding: '16px',
                            background: 'rgba(20, 184, 166, 0.1)',
                            border: '1px solid rgba(20, 184, 166, 0.3)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        <h4 style={{ color: 'var(--primary-teal)', marginBottom: '8px' }}>
                            🔄 Tax-Loss Harvesting
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Sell losing positions to offset gains, then reinvest in similar (but not identical) assets
                            to maintain market exposure.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
