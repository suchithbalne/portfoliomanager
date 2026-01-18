'use client';

import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import HoldingsTable from './HoldingsTable';
import AllocationChart from './AllocationChart';
import PerformanceMetrics from './PerformanceMetrics';
import DiversificationAnalysis from './DiversificationAnalysis';
import RiskMetrics from './RiskMetrics';
import TaxOptimization from './TaxOptimization';
import DividendTracker from './DividendTracker';
import AIRecommendations from './AIRecommendations';
import * as calc from '../utils/portfolioCalculations';

export default function Dashboard() {
    const { holdings, portfolioName, clearPortfolio } = usePortfolio();
    const [activeTab, setActiveTab] = useState('overview');

    // Calculate all metrics
    const metrics = {
        totalValue: calc.calculateTotalValue(holdings),
        totalCost: calc.calculateTotalCost(holdings),
        totalGainLoss: calc.calculateTotalGainLoss(holdings),
        totalReturn: calc.calculateTotalReturn(holdings),
        bestPerformer: calc.getBestPerformer(holdings),
        worstPerformer: calc.getWorstPerformer(holdings),
        averageReturn: calc.calculateAverageReturn(holdings),
        volatility: calc.calculateVolatility(holdings),
        assetAllocation: calc.calculateAssetAllocation(holdings),
        sectorAllocation: calc.calculateSectorAllocation(holdings),
        concentrationRisk: calc.calculateConcentrationRisk(holdings),
        diversificationScore: calc.calculateDiversificationScore(holdings),
        riskScore: calc.calculateRiskScore(holdings),
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'holdings', label: 'Holdings', icon: '📈' },
        { id: 'diversification', label: 'Diversification', icon: '🎯' },
        { id: 'risk', label: 'Risk Analysis', icon: '⚠️' },
        { id: 'tax', label: 'Tax Optimization', icon: '💰' },
        { id: 'dividends', label: 'Dividends', icon: '💵' },
        { id: 'ai', label: 'AI Recommendations', icon: '🤖' },
    ];

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-4 animate-fade-in">
                <div>
                    <h1 style={{ marginBottom: '8px' }}>{portfolioName}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {holdings.length} holdings • Last updated: {new Date().toLocaleDateString()}
                    </p>
                </div>
                <button onClick={clearPortfolio} className="btn btn-secondary">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    New Portfolio
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3 mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="glass-card p-3">
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                        Total Value
                    </p>
                    <h2 style={{ marginBottom: '4px' }}>{calc.formatCurrency(metrics.totalValue)}</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Cost: {calc.formatCurrency(metrics.totalCost)}
                    </p>
                </div>

                <div className="glass-card p-3">
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

                <div className="glass-card p-3">
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

                <div className="glass-card p-3">
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

            {/* Tabs */}
            <div
                className="glass-card animate-fade-in"
                style={{
                    padding: '8px',
                    marginBottom: '24px',
                    animationDelay: '0.2s',
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
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
                        }}
                    >
                        <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                {activeTab === 'overview' && (
                    <div className="grid gap-3">
                        <PerformanceMetrics holdings={holdings} metrics={metrics} />
                        <div className="grid grid-cols-2 gap-3">
                            <AllocationChart holdings={holdings} metrics={metrics} />
                            <HoldingsTable holdings={holdings.slice(0, 10)} showAll={false} />
                        </div>
                    </div>
                )}

                {activeTab === 'holdings' && <HoldingsTable holdings={holdings} showAll={true} />}

                {activeTab === 'diversification' && (
                    <DiversificationAnalysis holdings={holdings} metrics={metrics} />
                )}

                {activeTab === 'risk' && <RiskMetrics holdings={holdings} metrics={metrics} />}

                {activeTab === 'tax' && <TaxOptimization holdings={holdings} />}

                {activeTab === 'dividends' && <DividendTracker holdings={holdings} />}

                {activeTab === 'ai' && <AIRecommendations holdings={holdings} metrics={metrics} />}
            </div>
        </div>
    );
}
