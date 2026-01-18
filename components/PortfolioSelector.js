'use client';

import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import * as calc from '../utils/portfolioCalculations';

export default function PortfolioSelector() {
    const {
        portfolios,
        activePortfolioId,
        viewMode,
        switchPortfolio,
        toggleViewMode,
        getPortfolioBreakdown
    } = usePortfolio();

    const [isOpen, setIsOpen] = useState(false);
    const [showManager, setShowManager] = useState(false);

    const activePortfolio = portfolios.find(p => p.id === activePortfolioId);
    const breakdown = getPortfolioBreakdown();

    if (portfolios.length === 0) return null;

    const totalConsolidatedValue = breakdown.reduce((sum, p) => sum + p.totalValue, 0);

    return (
        <>
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="glass-card"
                    style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        cursor: 'pointer',
                        minWidth: '250px',
                    }}
                >
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                            {viewMode === 'consolidated' ? 'All Portfolios' : 'Active Portfolio'}
                        </div>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            {viewMode === 'consolidated'
                                ? `${portfolios.length} Portfolios`
                                : activePortfolio?.name || 'Select Portfolio'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {viewMode === 'consolidated'
                                ? calc.formatCurrency(totalConsolidatedValue)
                                : activePortfolio && calc.formatCurrency(
                                    activePortfolio.holdings.reduce((sum, h) => sum + h.marketValue, 0)
                                )}
                        </div>
                    </div>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {isOpen && (
                    <div
                        className="glass-card"
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            maxHeight: '400px',
                            overflowY: 'auto',
                            border: '1px solid var(--glass-border)',
                        }}
                    >
                        {/* Consolidated View Option */}
                        <button
                            onClick={() => {
                                toggleViewMode();
                                setIsOpen(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                textAlign: 'left',
                                background: viewMode === 'consolidated' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                border: 'none',
                                borderBottom: '1px solid var(--glass-border)',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (viewMode !== 'consolidated') {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (viewMode !== 'consolidated') {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.25rem' }}>📊</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                        Consolidated View
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        All {portfolios.length} portfolios combined
                                    </div>
                                </div>
                                {viewMode === 'consolidated' && (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                        </button>

                        {/* Individual Portfolios */}
                        {portfolios.map(portfolio => {
                            const isActive = viewMode === 'individual' && portfolio.id === activePortfolioId;
                            const portfolioValue = portfolio.holdings.reduce((sum, h) => sum + h.marketValue, 0);

                            return (
                                <button
                                    key={portfolio.id}
                                    onClick={() => {
                                        switchPortfolio(portfolio.id);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        background: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                                {portfolio.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                {portfolio.accountType} • {portfolio.holdings.length} holdings
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                {calc.formatCurrency(portfolioValue)}
                                            </div>
                                        </div>
                                        {isActive && (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>
                                </button>
                            );
                        })}

                        {/* Manage Portfolios Button */}
                        <button
                            onClick={() => {
                                setShowManager(true);
                                setIsOpen(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                textAlign: 'left',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--primary-purple)',
                                fontWeight: '600',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                Manage Portfolios
                            </div>
                        </button>
                    </div>
                )}
            </div>

            {/* Portfolio Manager Modal */}
            {showManager && (
                <PortfolioManagerModal onClose={() => setShowManager(false)} />
            )}
        </>
    );
}

// Portfolio Manager Modal Component
function PortfolioManagerModal({ onClose }) {
    const { portfolios, deletePortfolio, updatePortfolio } = usePortfolio();
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleDelete = (portfolioId) => {
        if (confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) {
            deletePortfolio(portfolioId);
        }
    };

    const handleSaveEdit = (portfolioId) => {
        if (editName.trim()) {
            updatePortfolio(portfolioId, { name: editName.trim() });
            setEditingId(null);
            setEditName('');
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '20px',
            }}
            onClick={onClose}
        >
            <div
                className="glass-card"
                style={{
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    padding: '32px',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2>Manage Portfolios</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '1.5rem',
                        }}
                    >
                        ×
                    </button>
                </div>

                <div className="grid gap-3">
                    {portfolios.map(portfolio => {
                        const portfolioValue = portfolio.holdings.reduce((sum, h) => sum + h.marketValue, 0);
                        const isEditing = editingId === portfolio.id;

                        return (
                            <div key={portfolio.id} className="glass-card p-3">
                                {isEditing ? (
                                    <div>
                                        <input
                                            type="text"
                                            className="input"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Portfolio name"
                                            autoFocus
                                            style={{ marginBottom: '12px' }}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => handleSaveEdit(portfolio.id)} className="btn btn-primary">
                                                Save
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="btn btn-secondary">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: '12px' }}>
                                            <h3 style={{ marginBottom: '4px' }}>{portfolio.name}</h3>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                                                {portfolio.accountType} • Created {new Date(portfolio.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--primary-purple)' }}>
                                                {calc.formatCurrency(portfolioValue)}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {portfolio.holdings.length} holdings
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingId(portfolio.id);
                                                    setEditName(portfolio.name);
                                                }}
                                                className="btn btn-secondary"
                                            >
                                                Rename
                                            </button>
                                            <button
                                                onClick={() => handleDelete(portfolio.id)}
                                                className="btn"
                                                style={{ background: 'var(--error-bg)', color: 'var(--error)' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
