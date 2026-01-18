'use client';

import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import PortfolioSelector from './PortfolioSelector';
import HoldingsTable from './HoldingsTable';
import AllocationChart from './AllocationChart';
import PerformanceMetrics from './PerformanceMetrics';
import DiversificationAnalysis from './DiversificationAnalysis';
import RiskMetrics from './RiskMetrics';
import TaxOptimization from './TaxOptimization';
import AIRecommendations from './AIRecommendations';
import FileUpload from './FileUpload';
import * as calc from '../utils/portfolioCalculations';
import * as advCalc from '../utils/advancedCalculations';

export default function Dashboard() {
    const { holdings, activePortfolio, viewMode, clearAllPortfolios, getPortfolioBreakdown, portfolios } = usePortfolio();
    const [activeTab, setActiveTab] = useState('overview');

    // Calculate advanced metrics
    const advRisk = advCalc.getComprehensiveRiskMetrics(holdings);
    const advDiv = advCalc.getComprehensiveDiversificationMetrics(holdings);

    // Calculate all metrics (combining basic and advanced)
    const metrics = {
        totalValue: calc.calculateTotalValue(holdings),
        totalCost: calc.calculateTotalCost(holdings),
        totalGainLoss: calc.calculateTotalGainLoss(holdings),
        totalReturn: calc.calculateTotalReturn(holdings),
        bestPerformer: calc.getBestPerformer(holdings),
        worstPerformer: calc.getWorstPerformer(holdings),
        averageReturn: calc.calculateAverageReturn(holdings),

        // Advanced Risk Metrics
        volatility: advRisk.volatility,
        riskScore: advRisk.riskScore,
        beta: advRisk.beta,
        sharpeRatio: advRisk.sharpeRatio,
        sortinoRatio: advRisk.sortinoRatio,
        treynorRatio: advRisk.treynorRatio,
        var95: advRisk.var95_1day,
        maxDrawdown: advRisk.maxDrawdown,

        // Asset & Sector Allocation (keep basic calc for charts)
        assetAllocation: calc.calculateAssetAllocation(holdings),
        sectorAllocation: calc.calculateSectorAllocation(holdings),
        concentrationRisk: calc.calculateConcentrationRisk(holdings),

        // Advanced Diversification Metrics
        diversificationScore: advDiv.diversificationScore,
        hhi: advDiv.hhi,
        effectiveStocks: advDiv.effectiveStocks,
        sectorRatio: advDiv.sectorRatio,
        avgCorrelation: advDiv.avgCorrelation,
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'holdings', label: 'Holdings' },
        { id: 'diversification', label: 'Diversification' },
        { id: 'risk', label: 'Risk Analysis' },
        { id: 'tax', label: 'Tax Optimization' },
        { id: 'ai', label: 'AI Recommendations' },
    ];

    // Welcome screen for first-time users (no portfolios at all)
    if (portfolios.length === 0) {
        return (
            <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
                <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ marginBottom: '48px' }}>
                        <div
                            style={{
                                width: '120px',
                                height: '120px',
                                margin: '0 auto 32px',
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                                border: '3px solid var(--primary-purple)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '4rem',
                            }}
                        >
                            📊
                        </div>
                        <h1 style={{ marginBottom: '16px', fontSize: '2.5rem' }}>Welcome to Portfolio Manager</h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                            Track, analyze, and optimize your investment portfolio with AI-powered insights
                        </p>
                    </div>

                    <div className="grid gap-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="glass-card" style={{ padding: '32px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                <div
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'linear-gradient(135deg, var(--primary-purple), var(--primary-blue))',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        flexShrink: 0,
                                    }}
                                >
                                    📁
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ marginBottom: '8px' }}>Import from Your Broker</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                                        Upload CSV or Excel files from Fidelity, Robinhood, Vanguard, or any broker.
                                        We'll automatically parse your holdings and calculate comprehensive metrics.
                                    </p>
                                    <FileUpload />
                                </div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                Or start with an empty portfolio and add holdings manually later
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show FileUpload component for empty portfolios, but keep navigation visible
    if (holdings.length === 0) {
        return (
            <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
                <div className="animate-fade-in" style={{ marginBottom: '32px' }}>
                    <div style={{ marginBottom: '24px', maxWidth: '300px' }}>
                        <PortfolioSelector />
                    </div>

                    <div className="text-center" style={{ marginBottom: '32px' }}>
                        <h1 style={{ marginBottom: '8px' }}>Add Holdings to {activePortfolio?.name}</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            This portfolio is empty. Import a file or switch to another portfolio.
                        </p>
                    </div>
                </div>

                <FileUpload />
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
            {/* Header Section */}
            <div className="animate-fade-in" style={{ marginBottom: '32px' }}>
                {/* Portfolio Selector - Left Side */}
                <div style={{ marginBottom: '24px', maxWidth: '300px' }}>
                    <PortfolioSelector />
                </div>

                {/* Title and Actions - Centered Title */}
                <div className="flex justify-between items-center">
                    <div style={{ flex: 1 }}></div>

                    <div className="text-center" style={{ flex: 2 }}>
                        <h1 style={{ marginBottom: '8px' }}>Portfolio Dashboard</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {holdings.length} holdings • Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>


                </div>
            </div>

            {/* View Mode Indicator */}
            {viewMode === 'consolidated' && (
                <div
                    className="dashboard-card animate-fade-in"
                    style={{
                        marginBottom: '16px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid var(--primary-purple)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.5rem' }}>📊</span>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ marginBottom: '4px', color: 'var(--primary-purple)' }}>
                                Consolidated View
                            </h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Viewing combined data from all portfolios
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3 mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="dashboard-card">
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                        Total Value
                    </p>
                    <h2 style={{ marginBottom: '4px' }}>{calc.formatCurrency(metrics.totalValue)}</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Cost: {calc.formatCurrency(metrics.totalCost)}
                    </p>
                </div>

                <div className="dashboard-card">
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                        Total Gain/Loss
                    </p>
                    <h2
                        style={{
                            marginBottom: '4px',
                            color: metrics.totalGainLoss >= 0 ? 'var(--success)' : 'var(--error)',
                        }}
                    >
                        {calc.formatCurrency(metrics.totalGainLoss)}
                    </h2>
                    <span
                        className={`badge ${metrics.totalReturn >= 0 ? 'badge-success' : 'badge-error'}`}
                    >
                        {calc.formatPercentage(metrics.totalReturn)}
                    </span>
                </div>

                <div className="dashboard-card">
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                        Diversification
                    </p>
                    <h2 style={{ marginBottom: '4px' }}>
                        {metrics.diversificationScore.toFixed(0)}/100
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {metrics.diversificationScore >= 70 ? 'Well diversified' :
                            metrics.diversificationScore >= 40 ? 'Moderate' : 'Needs improvement'}
                    </p>
                </div>

                <div className="dashboard-card">
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                        Risk Score
                    </p>
                    <h2
                        style={{
                            marginBottom: '4px',
                            color: metrics.riskScore >= 70 ? 'var(--error)' :
                                metrics.riskScore >= 40 ? 'var(--warning)' : 'var(--success)',
                        }}
                    >
                        {metrics.riskScore.toFixed(0)}/100
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {metrics.riskScore >= 70 ? 'High risk' :
                            metrics.riskScore >= 40 ? 'Moderate risk' : 'Low risk'}
                    </p>
                </div>
            </div>

            {/* Portfolio Breakdown (Consolidated View Only) */}
            {viewMode === 'consolidated' && (
                <div className="dashboard-card mb-4 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                    <h3 className="card-header">Portfolio Breakdown</h3>
                    <div className="grid gap-2">
                        {getPortfolioBreakdown().map(portfolio => (
                            <div
                                key={portfolio.id}
                                style={{
                                    padding: '12px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {portfolio.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        {portfolio.accountType} • {portfolio.holdingsCount} holdings
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {calc.formatCurrency(portfolio.totalValue)}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '0.875rem',
                                            color: portfolio.gainLoss >= 0 ? 'var(--success)' : 'var(--error)',
                                        }}
                                    >
                                        {calc.formatCurrency(portfolio.gainLoss)} ({calc.formatPercentage(portfolio.gainLossPercent)})
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div
                className="dashboard-card"
                style={{
                    padding: '8px',
                    marginBottom: '24px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '8px',
                    overflowX: 'auto',
                    position: 'sticky',
                    top: '0px',
                    zIndex: 20,
                    backdropFilter: 'blur(12px)',
                }}
            >
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="btn"
                        style={{
                            background: activeTab === tab.id ? 'var(--gradient-primary)' : 'transparent',
                            color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                            border: 'none',
                            padding: '12px 20px',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            justifyContent: 'center',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-12 gap-4 animate-fade-in">
                        <div className="col-span-12 md:col-span-8">
                            <AllocationChart holdings={holdings} metrics={metrics} />
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <PerformanceMetrics holdings={holdings} metrics={metrics} />
                        </div>
                        <div className="col-span-12">
                            <HoldingsTable
                                holdings={[...holdings].sort((a, b) => b.marketValue - a.marketValue).slice(0, 10)}
                                showAll={false}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'holdings' && <HoldingsTable holdings={holdings} showAll={true} />}

                {activeTab === 'diversification' && (
                    <DiversificationAnalysis holdings={holdings} metrics={metrics} />
                )}

                {activeTab === 'risk' && <RiskMetrics holdings={holdings} metrics={metrics} />}

                {activeTab === 'tax' && <TaxOptimization holdings={holdings} />}

                {activeTab === 'ai' && <AIRecommendations holdings={holdings} metrics={metrics} />}
            </div>
        </div>
    );
}
