'use client';

import { useState, useEffect } from 'react';
import { analyzePortfolio, getActiveProvider, getProviderApiKey } from '../utils/llmService';
import { getProvider } from '../utils/llmProviders';
import { formatMarkdownToHTML, getMarkdownStyles } from '../utils/markdownFormatter';
import { formatJSONAnalysis, getJSONAnalysisStyles } from '../utils/jsonAnalysisFormatter';
import LLMProviderSettings from './LLMProviderSettings';

export default function AIRecommendations({ holdings, metrics }) {
    const [hasApiKey, setHasApiKey] = useState(false);
    const [activeProvider, setActiveProviderState] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [isCached, setIsCached] = useState(false);

    const CACHE_KEY = 'ai_analysis_cache';

    useEffect(() => {
        checkApiKey();
        loadCachedAnalysis();
    }, []);

    const checkApiKey = () => {
        const providerId = getActiveProvider();
        const apiKey = getProviderApiKey(providerId);
        const provider = getProvider(providerId);

        setHasApiKey(!!apiKey);
        setActiveProviderState(provider);
    };

    const handleSettingsClose = () => {
        setShowSettings(false);
        checkApiKey(); // Refresh API key status
    };

    const generatePortfolioHash = (holdings) => {
        return holdings.map(h => `${h.symbol}:${h.quantity}`).sort().join('|');
    };

    const loadCachedAnalysis = () => {
        if (typeof window === 'undefined') return;

        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { analysis: cachedAnalysis, timestamp, portfolioHash } = JSON.parse(cached);
                const currentHash = generatePortfolioHash(holdings);
                const isValid = portfolioHash === currentHash && (Date.now() - timestamp) < 24 * 60 * 60 * 1000;

                if (isValid) {
                    setAnalysis(cachedAnalysis);
                    setIsCached(true);
                } else {
                    localStorage.removeItem(CACHE_KEY);
                }
            }
        } catch (error) {
            console.error('Error loading cached analysis:', error);
        }
    };

    const saveAnalysisToCache = (analysisText) => {
        if (typeof window === 'undefined') return;

        try {
            const cache = {
                analysis: analysisText,
                timestamp: Date.now(),
                portfolioHash: generatePortfolioHash(holdings)
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch (error) {
            console.error('Error saving analysis to cache:', error);
        }
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError(null);
        setIsCached(false);

        try {
            const result = await analyzePortfolio(holdings, metrics);
            setAnalysis(result);
            saveAnalysisToCache(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };



    return (
        <div className="grid gap-3">
            {/* Settings Modal */}
            {showSettings && <LLMProviderSettings onClose={handleSettingsClose} />}

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
                            Get personalized investment recommendations powered by leading AI models.
                            Choose from OpenAI, Groq, Anthropic, or Google to receive buy/sell/hold
                            suggestions, risk analysis, and rebalancing strategies tailored to your portfolio.
                        </p>

                        <button onClick={() => setShowSettings(true)} className="btn btn-primary">
                            ⚙️ Configure AI Provider
                        </button>

                        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🤖</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>OpenAI</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>⚡</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Groq</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🧠</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Anthropic</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🔍</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Google</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Analysis Controls */}
                    <div className="glass-card p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 style={{ marginBottom: '8px' }}>AI Portfolio Analysis</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>
                                    Get personalized recommendations based on your holdings and market conditions
                                </p>
                                {activeProvider && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '1rem' }}>{activeProvider.icon}</span>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                                            Using {activeProvider.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowSettings(true)} className="btn btn-secondary">
                                    ⚙️ Settings
                                </button>

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
                        <div className="animate-fade-in">
                            <style>{getMarkdownStyles()}</style>
                            <style>{getJSONAnalysisStyles()}</style>
                            <div
                                style={{
                                    fontFamily: 'inherit',
                                    lineHeight: '1.8',
                                    color: 'var(--text-secondary)',
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: (() => {
                                        // Try JSON formatting first
                                        const jsonHTML = formatJSONAnalysis(analysis);
                                        if (jsonHTML) return jsonHTML;
                                        // Fallback to markdown formatting
                                        return formatMarkdownToHTML(analysis);
                                    })()
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
