'use client';

import { useState, useEffect } from 'react';
import { getAllProviders, getProvider } from '../utils/llmProviders';
import {
    getProviderConfig,
    getActiveProvider,
    setActiveProvider,
    getProviderApiKey,
    setProviderApiKey,
    removeProviderApiKey,
    getProviderModel,
    setProviderModel,
    testProviderConnection
} from '../utils/llmService';

export default function LLMProviderSettings({ onClose }) {
    const [config, setConfig] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [selectedModel, setSelectedModel] = useState('');
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [availableModels, setAvailableModels] = useState([]);
    const [loadingModels, setLoadingModels] = useState(false);

    const providers = getAllProviders();
    const CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

    const getCachedModels = (providerId) => {
        try {
            const cacheKey = `llm_models_${providerId}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const { timestamp, models } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    return models;
                }
            }
        } catch (error) {
            console.error('Error reading from cache:', error);
        }
        return null;
    };

    const saveCachedModels = (providerId, models) => {
        try {
            const cacheKey = `llm_models_${providerId}`;
            const data = {
                timestamp: Date.now(),
                models
            };
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = () => {
        const cfg = getProviderConfig();
        setConfig(cfg);
        const activeId = cfg.activeProvider || 'openai';
        setSelectedProvider(activeId);
        setApiKey(getProviderApiKey(activeId) || '');
        setSelectedModel(getProviderModel(activeId) || getProvider(activeId).defaultModel);

        // Initialize available models
        // Check cache first
        const cachedModels = getCachedModels(activeId);
        if (cachedModels) {
            setAvailableModels(cachedModels);
        } else {
            const provider = getProvider(activeId);
            setAvailableModels(provider.models);
        }
    };

    const handleProviderChange = async (providerId) => {
        setSelectedProvider(providerId);
        setApiKey(getProviderApiKey(providerId) || '');
        setSelectedModel(getProviderModel(providerId) || getProvider(providerId).defaultModel);
        setTestResult(null);
        setHasChanges(true);

        const provider = getProvider(providerId);

        // Try cache first
        const cachedModels = getCachedModels(providerId);
        if (cachedModels) {
            setAvailableModels(cachedModels);
            // If explicit fetch is needed even with cache (optional), add logic here.
            // But requirement implies cache is enough.
            return;
        }

        // Fallback to static defaults
        setAvailableModels(provider.models);

        // If provider supports dynamic model fetching and has API key, fetch models
        if (provider.fetchModels && getProviderApiKey(providerId)) {
            setLoadingModels(true);
            try {
                const dynamicModels = await provider.fetchModels(getProviderApiKey(providerId));
                if (dynamicModels && dynamicModels.length > 0) {
                    setAvailableModels(dynamicModels);
                    saveCachedModels(providerId, dynamicModels);
                }
            } catch (error) {
                console.error("Failed to fetch models:", error);
            } finally {
                setLoadingModels(false);
            }
        }
    };

    const handleSave = () => {
        if (apiKey) {
            setProviderApiKey(selectedProvider, apiKey);
        }
        if (selectedModel) {
            setProviderModel(selectedProvider, selectedModel);
        }
        setActiveProvider(selectedProvider);
        setHasChanges(false);
        loadConfig();
        onClose(); // Close the dialog after saving
    };

    const handleRemoveKey = () => {
        if (confirm(`Remove API key for ${getProvider(selectedProvider).name}?`)) {
            removeProviderApiKey(selectedProvider);
            setApiKey('');
            setHasChanges(true);
        }
    };

    const handleTestConnection = async () => {
        if (!apiKey) {
            setTestResult({ success: false, message: 'Please enter an API key first' });
            return;
        }

        // Save temporarily for testing
        setProviderApiKey(selectedProvider, apiKey);
        setProviderModel(selectedProvider, selectedModel);

        setTesting(true);
        setTestResult(null);

        try {
            const result = await testProviderConnection(selectedProvider);
            setTestResult(result);
        } catch (error) {
            setTestResult({ success: false, message: error.message });
        } finally {
            setTesting(false);
        }
    };

    const currentProvider = getProvider(selectedProvider);
    const isActive = config?.activeProvider === selectedProvider;

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
                zIndex: 10000,
                padding: '20px',
            }}
            onClick={onClose}
        >
            <div
                className="glass-card"
                style={{
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '32px',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ marginBottom: '4px' }}>LLM Provider Settings</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Configure AI providers for portfolio analysis
                        </p>
                    </div>
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

                {/* Provider Selection */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        Select Provider
                    </label>
                    <div className="grid gap-2">
                        {providers.map(provider => (
                            <button
                                key={provider.id}
                                onClick={() => handleProviderChange(provider.id)}
                                className="glass-card"
                                style={{
                                    padding: '14px',
                                    textAlign: 'left',
                                    background: selectedProvider === provider.id
                                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)'
                                        : 'var(--glass-bg)',
                                    border: selectedProvider === provider.id
                                        ? '2px solid var(--primary-purple)'
                                        : '1px solid var(--glass-border)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{provider.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                            {provider.name}
                                            {isActive && provider.id === selectedProvider && (
                                                <span style={{
                                                    marginLeft: '8px',
                                                    fontSize: '0.75rem',
                                                    color: 'var(--success)',
                                                    background: 'var(--success-bg)',
                                                    padding: '2px 8px',
                                                    borderRadius: '999px'
                                                }}>
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {provider.models.length} models available
                                        </div>
                                    </div>
                                    {selectedProvider === provider.id && (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-purple)" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* API Key Input */}
                {currentProvider && (
                    <>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                API Key
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type={showApiKey ? 'text' : 'password'}
                                    className="input"
                                    value={apiKey}
                                    onChange={(e) => {
                                        setApiKey(e.target.value);
                                        setHasChanges(true);
                                        setTestResult(null);
                                    }}
                                    placeholder={`Enter your ${currentProvider.name} API key`}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="btn btn-secondary"
                                    style={{ padding: '12px 16px' }}
                                >
                                    {showApiKey ? '🙈' : '👁️'}
                                </button>
                                {apiKey && (
                                    <button
                                        onClick={handleRemoveKey}
                                        className="btn"
                                        style={{ padding: '12px 16px', background: 'var(--error-bg)', color: 'var(--error)' }}
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                            <a
                                href={currentProvider.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--primary-purple)',
                                    marginTop: '4px',
                                    display: 'inline-block'
                                }}
                            >
                                Get API key from {currentProvider.name} →
                            </a>
                        </div>

                        {/* Model Selection */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                Model {loadingModels && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>(Loading latest models...)</span>}
                            </label>
                            <select
                                className="input"
                                value={selectedModel}
                                onChange={(e) => {
                                    setSelectedModel(e.target.value);
                                    setHasChanges(true);
                                }}
                                style={{ width: '100%' }}
                                disabled={loadingModels}
                            >
                                {availableModels.map(model => (
                                    <option key={model.id} value={model.id}>
                                        {model.name} - {model.description}
                                    </option>
                                ))}
                            </select>
                            {currentProvider.fetchModels && (
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                    ✨ Models are dynamically loaded from {currentProvider.name}
                                </p>
                            )}
                        </div>

                        {/* Test Connection */}
                        {apiKey && (
                            <div style={{ marginBottom: '20px' }}>
                                <button
                                    onClick={handleTestConnection}
                                    disabled={testing}
                                    className="btn btn-secondary"
                                    style={{ width: '100%' }}
                                >
                                    {testing ? '⏳ Testing...' : '🔌 Test Connection'}
                                </button>
                                {testResult && (
                                    <div
                                        style={{
                                            marginTop: '12px',
                                            padding: '12px',
                                            borderRadius: 'var(--radius-md)',
                                            background: testResult.success ? 'var(--success-bg)' : 'var(--error-bg)',
                                            color: testResult.success ? 'var(--success)' : 'var(--error)',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {testResult.success ? '✅' : '❌'} {testResult.message}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={!apiKey || !hasChanges}
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                            >
                                💾 Save & Activate
                            </button>
                            <button
                                onClick={onClose}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
