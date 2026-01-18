'use client';

import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { parsePortfolioFile } from '../utils/fileParser';
import samplePortfolio from '../utils/sampleData';

export default function FileUpload() {
    const { importHoldings } = usePortfolio();
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFile = async (file) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await parsePortfolioFile(file);
            importHoldings(data);
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

    const loadSampleData = () => {
        importHoldings(samplePortfolio);
    };

    return (
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
            <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="text-center mb-4">
                    <h1 style={{ marginBottom: '16px' }}>Portfolio Manager</h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                        Import your portfolio from Fidelity, Robinhood, or any broker to get started
                    </p>
                </div>

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

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Don't have a file? Try the demo
                    </p>
                    <button onClick={loadSampleData} className="btn btn-secondary">
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
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <polyline points="19 12 12 19 5 12" />
                        </svg>
                        Load Sample Portfolio
                    </button>
                </div>

                <div className="glass-card" style={{ marginTop: '48px', padding: '24px' }}>
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
