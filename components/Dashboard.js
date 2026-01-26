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
import { formatCurrency as formatMarketCurrency } from '../utils/markets/marketConfig';

export default function Dashboard() {
    const { holdings, activePortfolio, viewMode, clearAllPortfolios, getPortfolioBreakdown, portfolios } = usePortfolio();
    const [activeTab, setActiveTab] = useState('overview');
    const [showWelcome, setShowWelcome] = useState(true);

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
    if (portfolios.length === 0 && showWelcome) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(0, 0, 0, 0) 50%)' }}>
                {/* Hero Section */}
                <div className="container" style={{ paddingTop: '80px', paddingBottom: '60px' }}>
                    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {/* Hero Content */}
                        <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                            <div
                                style={{
                                    width: '160px',
                                    height: '160px',
                                    margin: '0 auto 48px',
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
                                    border: '3px solid var(--primary-purple)',
                                    borderRadius: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '6rem',
                                    boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)',
                                    animation: 'float 3s ease-in-out infinite',
                                }}
                            >
                                📊
                            </div>
                            <h1 style={{
                                marginBottom: '32px',
                                fontSize: '4rem',
                                fontWeight: '800',
                                background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-blue) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em',
                                lineHeight: '1.1',
                            }}>
                                Portfolio Manager
                            </h1>
                            <p style={{
                                fontSize: '1.75rem',
                                color: 'var(--text-secondary)',
                                maxWidth: '800px',
                                margin: '0 auto 64px',
                                lineHeight: '1.6',
                                fontWeight: '400',
                            }}>
                                Professional portfolio tracking and AI-powered investment insights
                            </p>

                            {/* CTA Button */}
                            <button
                                onClick={() => setShowWelcome(false)}
                                className="btn btn-primary"
                                style={{
                                    fontSize: '1.25rem',
                                    padding: '20px 48px',
                                    background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-blue) 100%)',
                                    border: 'none',
                                    boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
                                    transform: 'scale(1)',
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 15px 50px rgba(139, 92, 246, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(139, 92, 246, 0.4)';
                                }}
                            >
                                Get Started →
                            </button>
                        </div>

                        {/* Key Stats */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '32px',
                            maxWidth: '1000px',
                            margin: '0 auto 80px',
                        }}>
                            {[
                                { icon: '🎯', label: 'Real-time Analytics', value: 'Live Data', desc: 'Track performance instantly' },
                                { icon: '🤖', label: 'AI Insights', value: 'GPT-4 Powered', desc: 'Smart recommendations' },
                                { icon: '📈', label: 'Multi-Portfolio', value: 'Unlimited', desc: 'Manage all accounts' },
                            ].map((stat, idx) => (
                                <div
                                    key={idx}
                                    className="glass-card"
                                    style={{
                                        padding: '32px',
                                        textAlign: 'center',
                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                        animation: `slideUp 0.6s ease-out ${idx * 0.1}s both`,
                                        transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.borderColor = 'var(--primary-purple)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                    }}
                                >
                                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{stat.icon}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {stat.label}
                                    </div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-purple)', marginBottom: '8px' }}>
                                        {stat.value}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {stat.desc}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Features Grid */}
                        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                            <h2 style={{
                                textAlign: 'center',
                                fontSize: '2.5rem',
                                marginBottom: '64px',
                                fontWeight: '700',
                            }}>
                                Everything You Need
                            </h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                gap: '32px',
                            }}>
                                {[
                                    {
                                        icon: '📊',
                                        title: 'Comprehensive Analytics',
                                        description: 'Track performance, diversification, risk metrics, and tax optimization in real-time with institutional-grade calculations',
                                    },
                                    {
                                        icon: '🎯',
                                        title: 'AI-Powered Recommendations',
                                        description: 'Get personalized buy, sell, and hold suggestions powered by GPT-4, tailored to your investment goals and risk tolerance',
                                    },
                                    {
                                        icon: '💰',
                                        title: 'Tax Optimization',
                                        description: 'Identify tax-loss harvesting opportunities, optimize your capital gains strategy, and maximize after-tax returns',
                                    },
                                    {
                                        icon: '�',
                                        title: 'Multi-Portfolio Support',
                                        description: 'Manage unlimited portfolios across different brokers and account types with consolidated or individual views',
                                    },
                                    {
                                        icon: '📈',
                                        title: 'Risk Management',
                                        description: 'Monitor volatility, beta, Sharpe ratio, and concentration risk with advanced metrics and visual dashboards',
                                    },
                                    {
                                        icon: '🎨',
                                        title: 'Beautiful Interface',
                                        description: 'Modern, intuitive design with dark mode, glassmorphism effects, and smooth animations for a premium experience',
                                    },
                                ].map((feature, idx) => (
                                    <div
                                        key={idx}
                                        className="glass-card"
                                        style={{
                                            padding: '40px',
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease',
                                            cursor: 'default',
                                            animation: `slideUp 0.6s ease-out ${0.2 + idx * 0.1}s both`,
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '4rem',
                                            marginBottom: '24px',
                                            filter: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.3))',
                                        }}>
                                            {feature.icon}
                                        </div>
                                        <h3 style={{
                                            fontSize: '1.5rem',
                                            marginBottom: '16px',
                                            fontWeight: '700',
                                        }}>
                                            {feature.title}
                                        </h3>
                                        <p style={{
                                            color: 'var(--text-secondary)',
                                            lineHeight: '1.7',
                                            fontSize: '1rem',
                                        }}>
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom CTA */}
                        <div style={{ textAlign: 'center', marginTop: '100px' }}>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '24px', fontWeight: '700' }}>
                                Ready to optimize your portfolio?
                            </h2>
                            <button
                                onClick={() => setShowWelcome(false)}
                                className="btn btn-primary"
                                style={{
                                    fontSize: '1.25rem',
                                    padding: '20px 48px',
                                    background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-blue) 100%)',
                                    border: 'none',
                                    boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
                                }}
                            >
                                Get Started →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Animations */}
                <style jsx>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </div>
        );
    }

    // Portfolio manager entry screen (after clicking Get Started)
    if (portfolios.length === 0) {
        return (
            <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
                <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    {/* Back button */}
                    <button
                        onClick={() => setShowWelcome(true)}
                        className="btn btn-secondary"
                        style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Back to Welcome
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <h1 style={{ marginBottom: '16px', fontSize: '2.5rem' }}>Create Your First Portfolio</h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                            Import your holdings from any broker to get started
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: '48px' }}>
                        <FileUpload />
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

                {/* Title - Centered */}
                <div className="text-center" style={{ marginBottom: '24px' }}>
                    <h1 style={{ marginBottom: '8px' }}>Portfolio Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {holdings.length} holdings • Last updated: {new Date().toLocaleDateString()}
                        {activePortfolio?.market && activePortfolio.market !== 'US' && (
                            <span style={{
                                marginLeft: '12px',
                                padding: '2px 8px',
                                background: 'rgba(139, 92, 246, 0.2)',
                                border: '1px solid var(--primary-purple)',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: 'var(--primary-purple)'
                            }}>
                                {activePortfolio.market === 'INDIA' ? '🇮🇳 India' : activePortfolio.market}
                            </span>
                        )}
                    </p>
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
            )
            }

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3 mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="dashboard-card">
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                        Total Value
                    </p>
                    <h2 style={{ marginBottom: '4px' }}>
                        {activePortfolio?.market ? formatMarketCurrency(metrics.totalValue, activePortfolio.market) : calc.formatCurrency(metrics.totalValue)}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Cost: {activePortfolio?.market ? formatMarketCurrency(metrics.totalCost, activePortfolio.market) : calc.formatCurrency(metrics.totalCost)}
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
                        {activePortfolio?.market ? formatMarketCurrency(metrics.totalGainLoss, activePortfolio.market) : calc.formatCurrency(metrics.totalGainLoss)}
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
            {
                viewMode === 'consolidated' && (
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
                                            {portfolio.market ? formatMarketCurrency(portfolio.totalValue, portfolio.market) : calc.formatCurrency(portfolio.totalValue)}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.875rem',
                                                color: portfolio.gainLoss >= 0 ? 'var(--success)' : 'var(--error)',
                                            }}
                                        >
                                            {portfolio.market ? formatMarketCurrency(portfolio.gainLoss, portfolio.market) : calc.formatCurrency(portfolio.gainLoss)} ({calc.formatPercentage(portfolio.gainLossPercent)})
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

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

                {activeTab === 'risk' && <RiskMetrics holdings={holdings} metrics={metrics} market={activePortfolio?.market} />}

                {activeTab === 'tax' && <TaxOptimization holdings={holdings} />}

                {activeTab === 'ai' && <AIRecommendations holdings={holdings} metrics={metrics} market={activePortfolio?.market} />}
            </div>
        </div >
    );
}
