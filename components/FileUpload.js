'use client';

import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { parsePortfolioFile } from '../utils/fileParser';

const ACCOUNT_TYPES = [
    'Taxable Brokerage',
    'Traditional IRA',
    'Roth IRA',
    '401(k)',
    'Roth 401(k)',
    'SEP IRA',
    'Simple IRA',
    'HSA',
    '529 Plan',
    'Trust Account',
    'Other'
];

export default function FileUpload() {
    const { addPortfolio, portfolios } = usePortfolio();
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [portfolioName, setPortfolioName] = useState('');
    const [accountType, setAccountType] = useState('Taxable Brokerage');

    const handleFile = async (file) => {
        if (!portfolioName.trim()) {
            setError('Please enter a portfolio name');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await parsePortfolioFile(file);
            addPortfolio(portfolioName.trim(), accountType, data);

            // Reset form
            setPortfolioName('');
            setAccountType('Taxable Brokerage');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
            <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="text-center mb-4">
                    <h1 style={{ marginBottom: '16px' }}>
                        {portfolios.length === 0 ? 'Portfolio Manager' : 'Add Portfolio'}
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                        {portfolios.length === 0
                            ? 'Import your portfolio from Fidelity, Robinhood, or any broker to get started'
                            : 'Add another portfolio to track multiple accounts'}
                    </p>
                </div>

                {/* Portfolio Name and Account Type Inputs */}
                <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '16px' }}>Portfolio Details</h3>
                    <div className="grid gap-3">
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Portfolio Name *
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Fidelity Brokerage, Vanguard IRA"
                                value={portfolioName}
                                onChange={(e) => setPortfolioName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                Account Type
                            </label>
                            <select
                                className="input"
                                value={accountType}
                                onChange={(e) => setAccountType(e.target.value)}
                                style={{ cursor: 'pointer' }}
                            >
                                {ACCOUNT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* File Upload Area */}
                <div
                    className={`glass-card ${isDragging ? 'dragging' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    style={{
                        padding: '60px 40px',
                        textAlign: 'center',
                        border: isDragging ? '2px dashed var(--primary-purple)' : '1px solid var(--glass-border)',
                        background: isDragging ? 'rgba(139, 92, 246, 0.1)' : 'var(--glass-bg)',
                    }}
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="spinner"></div>
                            <p style={{ color: 'var(--text-secondary)' }}>Processing your file...</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '32px' }}>
                                <svg
                                    width="80"
                                    height="80"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ margin: '0 auto' }}
                                >
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="var(--primary-purple)" />
                                            <stop offset="100%" stopColor="var(--primary-blue)" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>

                            <h3 style={{ marginBottom: '12px' }}>Drop your portfolio file here</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                                or click to browse
                            </p>

                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileInput}
                                style={{ display: 'none' }}
                                id="file-input"
                            />

                            <label htmlFor="file-input" className="btn btn-primary" style={{ cursor: 'pointer' }}>
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
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="12" y1="18" x2="12" y2="12" />
                                    <line x1="9" y1="15" x2="15" y2="15" />
                                </svg>
                                Choose File
                            </label>

                            <div style={{ margin: '24px 0' }}>
                                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                                    Supported formats: CSV, Excel (.xlsx, .xls)
                                </p>
                            </div>
                        </>
                    )}

                    {error && (
                        <div
                            className="animate-fade-in"
                            style={{
                                marginTop: '24px',
                                padding: '16px',
                                background: 'var(--error-bg)',
                                border: '1px solid var(--error)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--error)',
                            }}
                        >
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </div>

                {/* Existing Portfolios List */}
                {portfolios.length > 0 && (
                    <div className="glass-card" style={{ marginTop: '24px', padding: '24px' }}>
                        <h4 style={{ marginBottom: '16px' }}>Your Portfolios ({portfolios.length})</h4>
                        <div className="grid gap-2">
                            {portfolios.map(portfolio => (
                                <div
                                    key={portfolio.id}
                                    style={{
                                        padding: '12px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--glass-border)',
                                    }}
                                >
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {portfolio.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                        {portfolio.accountType} • {portfolio.holdings.length} holdings
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Broker Instructions */}
                <div className="glass-card" style={{ marginTop: '24px', padding: '24px' }}>
                    <h4 style={{ marginBottom: '16px' }}>How to export from your broker:</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <h5 style={{ color: 'var(--primary-purple)', marginBottom: '8px' }}>Fidelity</h5>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Accounts → Positions → Download
                            </p>
                        </div>
                        <div>
                            <h5 style={{ color: 'var(--primary-blue)', marginBottom: '8px' }}>Robinhood</h5>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Account → Statements → Export Holdings
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
