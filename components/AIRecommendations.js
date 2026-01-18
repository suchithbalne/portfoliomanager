'use client';

import { useState } from 'react';
import { analyzePortfolio, getApiKey, saveApiKey, removeApiKey } from '../utils/llmService';

export default function AIRecommendations({ holdings, metrics }) {
    const [apiKey, setApiKey] = useState('');
    const [hasApiKey, setHasApiKey] = useState(!!getApiKey());
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);

    const handleSaveApiKey = () => {
        if (apiKey.trim()) {
            saveApiKey(apiKey.trim());
            setHasApiKey(true);
            setShowApiKeyInput(false);
            setApiKey('');
        }
    };

    const handleRemoveApiKey = () => {
        removeApiKey();
        setHasApiKey(false);
        setAnalysis(null);
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError(null);

        try {
            const result = await analyzePortfolio(holdings, metrics);
            setAnalysis(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleExport = () => {
        if (!analysis) return;

        const blob = new Blob([analysis], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio-analysis-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="grid gap-3">
            {/* API Key Configuration */}
            {!hasApiKey ? (
                <div className="glass-card p-4">
                    <div className="text-center" style={{ padding: '40px' }}>
                        <div
                            style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto 24px',
                                background: 'var(--gradient-primary)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem',
                            }}
                        >
                            🤖
                        </div>
                        <h3 style={{ marginBottom: '12px' }}>AI-Powered Portfolio Analysis</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
                            Get personalized investment recommendations powered by GPT-4. Receive buy/sell/hold
                            suggestions, risk analysis, and rebalancing strategies tailored to your portfolio.
                        </p>

                        {!showApiKeyInput ? (
                            <button onClick={() => setShowApiKeyInput(true)} className="btn btn-primary">
                                Configure OpenAI API Key
                            </button>
                        ) : (
                            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                                <div
                                    style={{
                                        padding: '24px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--glass-border)',
                                    }}
                                >
                                    <h4 style={{ marginBottom: '16px' }}>Enter Your OpenAI API Key</h4>
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="sk-..."
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        style={{ marginBottom: '16px' }}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleSaveApiKey} className="btn btn-primary" style={{ flex: 1 }}>
                                            Save API Key
                                        </button>
                                        <button onClick={() => setShowApiKeyInput(false)} className="btn btn-secondary">
                                            Cancel
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '12px' }}>
                                        Your API key is stored locally in your browser and never sent to our servers.
                                        Get your key at{' '}
                                        <a
                                            href="https://platform.openai.com/api-keys"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: 'var(--primary-purple)' }}
                                        >
                                            platform.openai.com
                                        </a>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Analysis Controls */}
                    <div className="glass-card p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 style={{ marginBottom: '8px' }}>AI Portfolio Analysis</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    Get personalized recommendations based on your holdings and market conditions
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {analysis && (
                                    <button onClick={handleExport} className="btn btn-secondary">
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
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Export
                                    </button>
                                )}
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="btn btn-primary"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
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
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                                <line x1="12" y1="17" x2="12.01" y2="17" />
                                            </svg>
                                            Generate Recommendations
                                        </>
                                    )}
                                </button>
                                <button onClick={handleRemoveApiKey} className="btn btn-secondary">
                                    Remove API Key
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div
                            className="glass-card p-4 animate-fade-in"
                            style={{
                                background: 'var(--error-bg)',
                                border: '1px solid var(--error)',
                            }}
                        >
                            <h4 style={{ color: 'var(--error)', marginBottom: '8px' }}>❌ Analysis Failed</h4>
                            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{error}</p>
                        </div>
                    )}

                    {/* Analysis Results */}
                    {analysis && (
                        <div className="glass-card p-4 animate-fade-in">
                            <div
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'inherit',
                                    lineHeight: '1.8',
                                    color: 'var(--text-secondary)',
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: analysis
                                        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary)">$1</strong>')
                                        .replace(/^### (.*$)/gim, '<h3 style="color: var(--primary-purple); margin-top: 24px; margin-bottom: 12px;">$1</h3>')
                                        .replace(/^## (.*$)/gim, '<h2 style="color: var(--primary-blue); margin-top: 32px; margin-bottom: 16px;">$1</h2>')
                                        .replace(/^# (.*$)/gim, '<h1 style="margin-top: 32px; margin-bottom: 16px;">$1</h1>')
                                        .replace(/\n- /g, '\n• ')
                                        .replace(/BUY/g, '<span style="color: var(--success); font-weight: 600;">BUY</span>')
                                        .replace(/SELL/g, '<span style="color: var(--error); font-weight: 600;">SELL</span>')
                                        .replace(/HOLD/g, '<span style="color: var(--warning); font-weight: 600;">HOLD</span>'),
                                }}
                            />
                        </div>
                    )}

                    {/* Placeholder when no analysis */}
                    {!analysis && !isAnalyzing && !error && (
                        <div className="glass-card p-4">
                            <div className="text-center" style={{ padding: '60px 40px' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📊</div>
                                <h3 style={{ marginBottom: '12px' }}>Ready to Analyze</h3>
                                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                                    Click "Generate Recommendations" to get AI-powered insights on your portfolio,
                                    including buy/sell/hold recommendations and rebalancing strategies.
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
