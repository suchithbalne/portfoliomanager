'use client';

import { usePortfolio } from '../context/PortfolioContext';
import * as calc from '../utils/portfolioCalculations';
import { formatCurrency as formatMarketCurrency } from '../utils/markets/marketConfig';

export default function DividendTracker({ holdings }) {
    const { activePortfolio } = usePortfolio();
    const market = activePortfolio?.market || 'US';

    // Helper function to format currency based on market
    const formatCurrency = (amount) => {
        return market ? formatMarketCurrency(amount, market) : calc.formatCurrency(amount);
    };
    const dividendHoldings = calc.identifyDividendHoldings(holdings);

    const totalAnnualDividends = dividendHoldings.reduce(
        (sum, h) => sum + h.estimatedAnnualDividend,
        0
    );

    const portfolioValue = calc.calculateTotalValue(holdings);
    const portfolioYield = portfolioValue > 0 ? (totalAnnualDividends / portfolioValue) * 100 : 0;

    const monthlyDividend = totalAnnualDividends / 12;

    return (
        <div className="grid gap-3">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3">
                <div className="glass-card p-3">
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                        Dividend Holdings
                    </p>
                    <h2 style={{ marginBottom: '4px', color: 'var(--primary-purple)' }}>
                        {dividendHoldings.length}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        of {holdings.length} total
                    </p>
                </div>

                <div className="glass-card p-3">
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                        Annual Dividends
                    </p>
                    <h2 style={{ marginBottom: '4px', color: 'var(--success)' }}>
                        {formatCurrency(totalAnnualDividends)}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Estimated
                    </p>
                </div>

                <div className="glass-card p-3">
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                        Monthly Income
                    </p>
                    <h2 style={{ marginBottom: '4px', color: 'var(--primary-blue)' }}>
                        {formatCurrency(monthlyDividend)}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Average
                    </p>
                </div>

                <div className="glass-card p-3">
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                        Portfolio Yield
                    </p>
                    <h2 style={{ marginBottom: '4px', color: 'var(--primary-teal)' }}>
                        {portfolioYield.toFixed(2)}%
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Annual
                    </p>
                </div>
            </div>

            {/* Dividend Holdings Table */}
            {dividendHoldings.length > 0 ? (
                <div className="glass-card">
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)' }}>
                        <h3>Dividend-Paying Holdings</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
                            Estimated annual dividend income by holding
                        </p>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Symbol</th>
                                    <th>Name</th>
                                    <th className="text-right">Shares</th>
                                    <th className="text-right">Dividend Yield</th>
                                    <th className="text-right">Annual Dividend</th>
                                    <th className="text-right">Monthly Income</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dividendHoldings
                                    .sort((a, b) => b.estimatedAnnualDividend - a.estimatedAnnualDividend)
                                    .map((holding, index) => (
                                        <tr key={index}>
                                            <td>
                                                <strong style={{ color: 'var(--text-primary)' }}>{holding.symbol}</strong>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{holding.name}</td>
                                            <td className="text-right">{calc.formatNumber(holding.quantity)}</td>
                                            <td className="text-right">
                                                <span className="badge badge-success">{holding.dividendYield.toFixed(2)}%</span>
                                            </td>
                                            <td className="text-right" style={{ color: 'var(--success)' }}>
                                                <strong>{calc.formatCurrency(holding.estimatedAnnualDividend)}</strong>
                                            </td>
                                            <td className="text-right" style={{ color: 'var(--text-secondary)' }}>
                                                {formatCurrency(holding.estimatedAnnualDividend / 12)}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="glass-card p-4">
                    <div className="text-center" style={{ padding: '40px' }}>
                        <h3 style={{ marginBottom: '12px' }}>No Dividend-Paying Holdings</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                            Consider adding dividend stocks or ETFs to generate passive income
                        </p>
                    </div>
                </div>
            )}

            {/* Dividend Income Projection */}
            {dividendHoldings.length > 0 && (
                <div className="glass-card p-4">
                    <h3 style={{ marginBottom: '24px' }}>Dividend Income Projection</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div
                            style={{
                                padding: '20px',
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                            }}
                        >
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                                Quarterly
                            </p>
                            <h2 style={{ color: 'var(--primary-purple)' }}>
                                {formatCurrency(totalAnnualDividends / 4)}
                            </h2>
                        </div>

                        <div
                            style={{
                                padding: '20px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                            }}
                        >
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                                Semi-Annual
                            </p>
                            <h2 style={{ color: 'var(--primary-blue)' }}>
                                {formatCurrency(totalAnnualDividends / 2)}
                            </h2>
                        </div>

                        <div
                            style={{
                                padding: '20px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                            }}
                        >
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                                Annual
                            </p>
                            <h2 style={{ color: 'var(--success)' }}>
                                {formatCurrency(totalAnnualDividends)}
                            </h2>
                        </div>
                    </div>
                </div>
            )}

            {/* Dividend Growth Tips */}
            <div className="glass-card p-4">
                <h3 style={{ marginBottom: '16px' }}>Dividend Investment Strategies</h3>
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
                            💰 Dividend Aristocrats
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Consider investing in companies with 25+ years of consecutive dividend increases for
                            reliable income growth.
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
                            🔄 Reinvest Dividends
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Enable dividend reinvestment (DRIP) to compound your returns and accelerate portfolio
                            growth over time.
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
                            📊 Diversify Dividend Sources
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Spread dividend income across different sectors and asset types to reduce risk and ensure
                            consistent cash flow.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
