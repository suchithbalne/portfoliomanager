'use client';

import { formatCurrency } from '../utils/portfolioCalculations';
import { formatCurrency as formatMarketCurrency } from '../utils/markets/marketConfig';

export default function RiskMetrics({ holdings, metrics, market }) {
    const getRiskLevel = (score) => {
        if (score >= 70) return { text: 'High', color: 'var(--error)', bg: 'var(--error-bg)' };
        if (score >= 40) return { text: 'Moderate', color: 'var(--warning)', bg: 'var(--warning-bg)' };
        return { text: 'Low', color: 'var(--success)', bg: 'var(--success-bg)' };
    };

    const riskLevel = getRiskLevel(metrics.riskScore);

    const advancedMetrics = [
        {
            name: 'Portfolio Beta',
            value: (metrics.beta ?? 1.0).toFixed(2),
            description: 'Sensitivity to market (>1 is higher risk)',
            recommendation: 'Target: 0.8 - 1.2',
            info: 'Measures how much the portfolio moves vs the market.\n1.0 is market average.',
            color: metrics.beta > 1.2 ? 'var(--error)' : 'var(--primary-blue)',
        },
        {
            name: 'Sharpe Ratio',
            value: (metrics.sharpeRatio ?? 0).toFixed(2),
            description: 'Risk-adjusted return (>1 is good)',
            recommendation: 'Target: > 1.0',
            info: 'Returns earned in excess of risk-free rate per unit of volatility.\nHigher is better.',
            color: metrics.sharpeRatio > 1 ? 'var(--success)' : 'var(--warning)',
        },
        {
            name: 'Sortino Ratio',
            value: (metrics.sortinoRatio ?? 0).toFixed(2),
            description: 'Downside risk-adjusted return',
            recommendation: 'Target: > 1.0',
            info: 'Similar to Sharpe, but only penalizes downside volatility.\nFocuses on harmful risk.',
            color: metrics.sortinoRatio > 1 ? 'var(--success)' : 'var(--warning)',
        },
        {
            name: 'Treynor Ratio',
            value: (metrics.treynorRatio ?? 0).toFixed(2),
            description: 'Return per unit of systematic risk',
            recommendation: 'Target: Higher is better',
            info: 'Returns earned per unit of market risk (Beta).\nEfficiency of systematic risk.',
            color: 'var(--primary-purple)',
        },
        {
            name: 'VaR (95%)',
            value: metrics.var95 ? (market ? formatMarketCurrency(metrics.var95, market) : formatCurrency(metrics.var95)) : (market ? formatMarketCurrency(0, market) : '$0.00'),
            description: 'Max expected 1-day loss (95% conf.)',
            recommendation: 'Target: < 2% of Total',
            info: 'Maximum likely loss in a day with 95% confidence.\nIndicator of tail risk.',
            color: 'var(--error)',
        },
        {
            name: 'Max Drawdown',
            value: (metrics.maxDrawdown ?? 0).toFixed(2) + '%',
            description: 'Largest peak-to-trough decline',
            recommendation: 'Target: < 20%',
            info: 'Maximum observed loss from a peak to a trough.\nHistoric deep risk.',
            color: 'var(--error)',
        },
    ];

    const riskFactors = [
        {
            name: 'Portfolio Beta',
            value: (metrics.beta ?? 1.0).toFixed(2),
            description: 'Market risk factor',
            score: Math.min(100, (metrics.beta / 2) * 100),
        },
        {
            name: 'Portfolio Volatility',
            value: metrics.volatility.toFixed(2) + '%',
            description: 'Standard deviation',
            score: Math.min(100, (metrics.volatility / 50) * 100),
        },
        {
            name: 'Concentration Risk',
            value: metrics.concentrationRisk.toFixed(1) + '%',
            description: 'Top 5 holdings weight',
            score: Math.min(100, (metrics.concentrationRisk / 80) * 100),
        },
    ];

    return (
        <div className="grid gap-3">
            {/* Overall Risk Score */}
            <div className="dashboard-card">
                <div className="flex justify-between items-center">
                    <div style={{ flex: 1 }}>
                        <h3 className="card-header">Overall Risk Assessment</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
                            Comprehensive risk analysis based on multiple factors
                        </p>

                        <div style={{ marginBottom: '16px' }}>
                            <div className="flex justify-between mb-1">
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    Risk Score
                                </span>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: riskLevel.color }}>
                                    {metrics.riskScore.toFixed(0)}/100
                                </span>
                            </div>
                            <div
                                style={{
                                    width: '100%',
                                    height: '12px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '999px',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        width: `${metrics.riskScore}%`,
                                        height: '100%',
                                        background: `linear-gradient(90deg, ${riskLevel.color}, ${riskLevel.color})`,
                                        borderRadius: '999px',
                                        transition: 'width 1s ease-out',
                                    }}
                                />
                            </div>
                        </div>

                        <div
                            style={{
                                padding: '16px',
                                background: riskLevel.bg,
                                border: `1px solid ${riskLevel.color}`,
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            <h4 style={{ color: riskLevel.color, marginBottom: '8px' }}>
                                {riskLevel.text} Risk Portfolio
                            </h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                                {riskLevel.text === 'High' &&
                                    'Your portfolio has elevated risk. Consider rebalancing towards more stable assets.'}
                                {riskLevel.text === 'Moderate' &&
                                    'Your portfolio has balanced risk. Monitor concentration and volatility regularly.'}
                                {riskLevel.text === 'Low' &&
                                    'Your portfolio has conservative risk. You may want to consider higher-growth opportunities.'}
                            </p>
                        </div>
                    </div>

                    <div
                        style={{
                            width: '180px',
                            height: '180px',
                            borderRadius: '50%',
                            background: `conic-gradient(${riskLevel.color} ${metrics.riskScore}%, rgba(255,255,255,0.05) 0)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '40px',
                        }}
                    >
                        <div
                            style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                background: 'var(--bg-secondary)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <h1 style={{ color: riskLevel.color, marginBottom: '8px' }}>
                                {metrics.riskScore.toFixed(0)}
                            </h1>
                            <p style={{ fontSize: '0.875rem', color: riskLevel.color, fontWeight: '600' }}>
                                {riskLevel.text} Risk
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Risk Analytics */}
            <div className="dashboard-card">
                <h3 className="card-header">Advanced Risk Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {advancedMetrics.map((metric, index) => (
                        <div key={index} style={{
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            position: 'relative'
                        }}>
                            <div className="flex justify-between items-start mb-1">
                                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{metric.name}</h4>
                                <div className="info-icon">
                                    ⓘ
                                    <div className="custom-tooltip">{metric.info}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: metric.color, marginBottom: '4px' }}>{metric.value}</div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{metric.description}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--primary-blue)', opacity: 0.9 }}>
                                {metric.recommendation}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Risk Factors Breakdown */}
            <div className="dashboard-card">
                <h3 className="card-header">Risk Factors Breakdown</h3>
                <div className="grid gap-3">
                    {riskFactors.map((factor, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '20px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                            }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 style={{ marginBottom: '4px' }}>{factor.name}</h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: 0 }}>
                                        {factor.description}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <h3 style={{ color: 'var(--primary-purple)' }}>{factor.value}</h3>
                                </div>
                            </div>
                            <div
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '999px',
                                    overflow: 'hidden',
                                    marginTop: '12px',
                                }}
                            >
                                <div
                                    style={{
                                        width: `${factor.score}%`,
                                        height: '100%',
                                        background: 'var(--gradient-primary)',
                                        borderRadius: '999px',
                                        transition: 'width 1s ease-out',
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Risk Mitigation Strategies */}
            <div className="dashboard-card">
                <h3 className="card-header">Risk Mitigation Strategies</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div
                        style={{
                            padding: '16px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        <h4 style={{ color: 'var(--primary-purple)', marginBottom: '8px' }}>
                            💼 Diversify Holdings
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Spread investments across different sectors and asset classes to reduce concentration risk.
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
                            📊 Add Index Funds
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Consider adding broad market ETFs to reduce volatility and provide stable returns.
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
                            ⚖️ Rebalance Regularly
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Review and rebalance your portfolio quarterly to maintain your target allocation.
                        </p>
                    </div>

                    <div
                        style={{
                            padding: '16px',
                            background: 'rgba(236, 72, 153, 0.1)',
                            border: '1px solid rgba(236, 72, 153, 0.3)',
                            borderRadius: 'var(--radius-md)',
                        }}
                    >
                        <h4 style={{ color: 'var(--primary-pink)', marginBottom: '8px' }}>
                            🛡️ Consider Bonds
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Add fixed-income securities to provide stability and reduce overall portfolio volatility.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
