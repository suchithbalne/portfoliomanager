'use client';

import { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import * as calc from '../utils/portfolioCalculations';
import { formatCurrency as formatMarketCurrency } from '../utils/markets/marketConfig';

export default function PortfolioSelector() {
    const {
        portfolios,
        activePortfolioId,
        viewMode,
        switchPortfolio,
        toggleViewMode,
        getPortfolioBreakdown,
        deletePortfolio,
        updatePortfolio,
        addPortfolio,
        clearAllPortfolios
    } = usePortfolio();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPortfolioName, setNewPortfolioName] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);

    const activePortfolio = portfolios.find(p => p.id === activePortfolioId);
    const breakdown = getPortfolioBreakdown();

    if (portfolios.length === 0) return null;

    const totalConsolidatedValue = breakdown.reduce((sum, p) => sum + p.totalValue, 0);

    const handleDelete = (portfolioId) => {
        setDeleteConfirmId(portfolioId);
    };

    const confirmDelete = () => {
        if (deleteConfirmId) {
            deletePortfolio(deleteConfirmId);
            setDeleteConfirmId(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmId(null);
    };

    const handleCreatePortfolio = () => {
        setShowCreateModal(true);
    };

    const confirmCreatePortfolio = () => {
        if (newPortfolioName.trim()) {
            // Create new portfolio with empty holdings
            addPortfolio(newPortfolioName.trim(), 'taxable', []);
            setShowCreateModal(false);
            setNewPortfolioName('');
            setIsSidebarOpen(false);
        }
    };

    const cancelCreatePortfolio = () => {
        setShowCreateModal(false);
        setNewPortfolioName('');
    };

    const handleResetAll = () => {
        setShowResetModal(true);
    };

    const confirmResetAll = () => {
        clearAllPortfolios();
        setShowResetModal(false);
        setIsSidebarOpen(false);
    };

    const cancelResetAll = () => {
        setShowResetModal(false);
    };

    const handleSaveEdit = (portfolioId) => {
        if (editName.trim()) {
            updatePortfolio(portfolioId, { name: editName.trim() });
            setEditingId(null);
            setEditName('');
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="glass-card"
                style={{
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary-purple)';
                    e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.transform = 'translateX(0)';
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {viewMode === 'consolidated' ? 'All Portfolios' : 'Active'}
                    </div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {viewMode === 'consolidated'
                            ? `${portfolios.length} Portfolio${portfolios.length > 1 ? 's' : ''}`
                            : activePortfolio?.name || 'Select'}
                    </div>
                </div>
            </button>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        zIndex: 9998,
                        animation: 'fadeIn 0.3s ease-out',
                    }}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: isSidebarOpen ? 0 : '-400px',
                    bottom: 0,
                    width: '400px',
                    background: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--glass-border)',
                    zIndex: 9999,
                    transition: 'left 0.3s ease-out',
                    boxShadow: isSidebarOpen ? '4px 0 24px rgba(0, 0, 0, 0.5)' : 'none',
                    overflowY: 'auto',
                }}
            >
                {/* Sidebar Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--glass-border)',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Portfolios</h2>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '1.75rem',
                                padding: '4px',
                                lineHeight: 1,
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                        Manage and switch between your portfolios
                    </p>
                </div>

                {/* Create Portfolio Button */}
                <div style={{ padding: '0 16px 16px 16px' }}>
                    <button
                        onClick={handleCreatePortfolio}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Create Portfolio
                    </button>

                    {/* Reset Button (for testing) */}
                    <button
                        onClick={handleResetAll}
                        className="btn"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: 'var(--error)',
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                        Reset All (View Welcome)
                    </button>
                </div>

                {/* Sidebar Content */}
                <div style={{ padding: '16px' }}>
                    {/* Consolidated View Card */}
                    <button
                        onClick={() => {
                            toggleViewMode();
                            setIsSidebarOpen(false);
                        }}
                        className="glass-card"
                        style={{
                            width: '100%',
                            padding: '16px',
                            marginBottom: '16px',
                            textAlign: 'left',
                            background: viewMode === 'consolidated'
                                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)'
                                : 'var(--glass-bg)',
                            border: viewMode === 'consolidated'
                                ? '2px solid var(--primary-purple)'
                                : '1px solid var(--glass-border)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            if (viewMode !== 'consolidated') {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (viewMode !== 'consolidated') {
                                e.currentTarget.style.background = 'var(--glass-bg)';
                            }
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '1.5rem' }}>📊</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                                    Consolidated View
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    All {portfolios.length} portfolio{portfolios.length > 1 ? 's' : ''} combined
                                </div>
                            </div>
                            {viewMode === 'consolidated' && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </div>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: 'var(--primary-purple)',
                            background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-blue) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            {calc.formatCurrency(totalConsolidatedValue)}
                        </div>
                    </button>

                    {/* Individual Portfolios Section */}
                    <div style={{ marginBottom: '16px' }}>
                        <h3 style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '12px',
                            fontWeight: '600',
                        }}>
                            Your Portfolios
                        </h3>

                        <div className="grid gap-2">
                            {portfolios.map(portfolio => {
                                const isActive = viewMode === 'individual' && portfolio.id === activePortfolioId;
                                const portfolioValue = portfolio.holdings.reduce((sum, h) => sum + h.marketValue, 0);
                                const isEditing = editingId === portfolio.id;

                                return (
                                    <div
                                        key={portfolio.id}
                                        className="glass-card"
                                        style={{
                                            padding: '14px',
                                            background: isActive
                                                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
                                                : 'var(--glass-bg)',
                                            border: isActive
                                                ? '2px solid var(--primary-purple)'
                                                : '1px solid var(--glass-border)',
                                        }}
                                    >
                                        {isEditing ? (
                                            <div>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    placeholder="Portfolio name"
                                                    autoFocus
                                                    style={{ marginBottom: '12px', fontSize: '0.9rem' }}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(portfolio.id)}
                                                        className="btn btn-primary"
                                                        style={{ fontSize: '0.875rem', padding: '8px 16px' }}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="btn btn-secondary"
                                                        style={{ fontSize: '0.875rem', padding: '8px 16px' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        switchPortfolio(portfolio.id);
                                                        setIsSidebarOpen(false);
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        padding: 0,
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        marginBottom: '12px',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '1.25rem' }}>💼</span>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1rem' }}>
                                                                {portfolio.name}
                                                            </div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                                                {portfolio.accountType} • {portfolio.holdings.length} holdings
                                                            </div>
                                                        </div>
                                                        {isActive && (
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="3">
                                                                <polyline points="20 6 9 17 4 12" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '1.1rem',
                                                        fontWeight: '700',
                                                        color: 'var(--primary-purple)',
                                                    }}>
                                                        {portfolio.market ? formatMarketCurrency(portfolioValue, portfolio.market) : calc.formatCurrency(portfolioValue)}
                                                    </div>
                                                </button>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(portfolio.id);
                                                            setEditName(portfolio.name);
                                                        }}
                                                        className="btn"
                                                        title="Rename portfolio"
                                                        style={{
                                                            fontSize: '1rem',
                                                            padding: '8px',
                                                            minWidth: '36px',
                                                            height: '36px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                            border: '1px solid var(--glass-border)',
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        }}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(portfolio.id)}
                                                        className="btn"
                                                        title="Delete portfolio"
                                                        style={{
                                                            fontSize: '1rem',
                                                            padding: '8px',
                                                            minWidth: '36px',
                                                            height: '36px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                                            color: 'var(--error)',
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        }}
                                                    >
                                                        🗑️
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
            </div>

            {/* Modern Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        animation: 'fadeIn 0.2s ease-out',
                    }}
                    onClick={cancelDelete}
                >
                    <div
                        className="glass-card"
                        style={{
                            maxWidth: '420px',
                            width: '90%',
                            padding: '32px',
                            animation: 'slideUp 0.3s ease-out',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    margin: '0 auto 16px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '2px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                }}
                            >
                                ⚠️
                            </div>
                            <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
                                Delete Portfolio?
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                Are you sure you want to delete{' '}
                                <strong style={{ color: 'var(--text-primary)' }}>
                                    {portfolios.find(p => p.id === deleteConfirmId)?.name}
                                </strong>
                                ? This action cannot be undone.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={cancelDelete}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="btn"
                                style={{
                                    flex: 1,
                                    background: 'var(--error)',
                                    color: 'white',
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Portfolio Modal */}
            {showCreateModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        animation: 'fadeIn 0.2s ease-out',
                    }}
                    onClick={cancelCreatePortfolio}
                >
                    <div
                        className="glass-card"
                        style={{
                            maxWidth: '420px',
                            width: '90%',
                            padding: '32px',
                            animation: 'slideUp 0.3s ease-out',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    margin: '0 auto 16px',
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                                    border: '2px solid var(--primary-purple)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                }}
                            >
                                📁
                            </div>
                            <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
                                Create New Portfolio
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                Enter a name for your new portfolio
                            </p>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Tech Stocks, Dividend Portfolio"
                                value={newPortfolioName}
                                onChange={(e) => setNewPortfolioName(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        confirmCreatePortfolio();
                                    }
                                }}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '1rem',
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={cancelCreatePortfolio}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmCreatePortfolio}
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                disabled={!newPortfolioName.trim()}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset All Confirmation Modal */}
            {showResetModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        animation: 'fadeIn 0.2s ease-out',
                    }}
                    onClick={cancelResetAll}
                >
                    <div
                        className="glass-card"
                        style={{
                            maxWidth: '420px',
                            width: '90%',
                            padding: '32px',
                            animation: 'slideUp 0.3s ease-out',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    margin: '0 auto 16px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '2px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                }}
                            >
                                ⚠️
                            </div>
                            <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
                                Reset All Portfolios?
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                This will delete <strong style={{ color: 'var(--error)' }}>ALL {portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}</strong> and return you to the welcome screen. This action cannot be undone.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={cancelResetAll}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmResetAll}
                                className="btn"
                                style={{
                                    flex: 1,
                                    background: 'var(--error)',
                                    color: 'white',
                                }}
                            >
                                Reset All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </>
    );
}
