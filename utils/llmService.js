/**
 * LLM Service for portfolio analysis and recommendations
 * Supports multiple LLM providers (OpenAI, Groq, Anthropic, Google)
 */

import { getProvider, isValidProvider } from './llmProviders';

const STORAGE_KEY = 'llm_providers';
const LEGACY_KEY = 'openai_api_key';

/**
 * Get LLM provider configuration from localStorage
 */
export const getProviderConfig = () => {
    if (typeof window === 'undefined') return null;

    const config = localStorage.getItem(STORAGE_KEY);
    if (config) {
        return JSON.parse(config);
    }

    // Check for legacy OpenAI key and migrate
    const legacyKey = localStorage.getItem(LEGACY_KEY);
    if (legacyKey) {
        const newConfig = {
            activeProvider: 'openai',
            providers: {
                openai: {
                    apiKey: legacyKey,
                    model: 'gpt-4-turbo',
                    settings: {
                        temperature: 0.7,
                        maxTokens: 2000
                    }
                }
            }
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
        localStorage.removeItem(LEGACY_KEY);
        return newConfig;
    }

    return {
        activeProvider: 'openai',
        providers: {}
    };
};

/**
 * Save provider configuration to localStorage
 */
export const saveProviderConfig = (config) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
};

/**
 * Get active provider ID
 */
export const getActiveProvider = () => {
    const config = getProviderConfig();
    return config?.activeProvider || 'openai';
};

/**
 * Set active provider
 */
export const setActiveProvider = (providerId) => {
    if (!isValidProvider(providerId)) {
        throw new Error(`Invalid provider: ${providerId}`);
    }

    const config = getProviderConfig();
    config.activeProvider = providerId;
    saveProviderConfig(config);
};

/**
 * Get API key for a provider
 */
export const getProviderApiKey = (providerId) => {
    const config = getProviderConfig();
    return config?.providers?.[providerId]?.apiKey || null;
};

/**
 * Set API key for a provider
 */
export const setProviderApiKey = (providerId, apiKey) => {
    if (!isValidProvider(providerId)) {
        throw new Error(`Invalid provider: ${providerId}`);
    }

    const config = getProviderConfig();
    if (!config.providers[providerId]) {
        const provider = getProvider(providerId);
        config.providers[providerId] = {
            apiKey,
            model: provider.defaultModel,
            settings: {
                temperature: 0.7,
                maxTokens: 2000
            }
        };
    } else {
        config.providers[providerId].apiKey = apiKey;
    }

    saveProviderConfig(config);
};

/**
 * Remove API key for a provider
 */
export const removeProviderApiKey = (providerId) => {
    const config = getProviderConfig();
    if (config.providers[providerId]) {
        delete config.providers[providerId];
        saveProviderConfig(config);
    }
};

/**
 * Get model for a provider
 */
export const getProviderModel = (providerId) => {
    const config = getProviderConfig();
    const provider = getProvider(providerId);
    return config?.providers?.[providerId]?.model || provider?.defaultModel || null;
};

/**
 * Set model for a provider
 */
export const setProviderModel = (providerId, model) => {
    const config = getProviderConfig();
    if (config.providers[providerId]) {
        config.providers[providerId].model = model;
        saveProviderConfig(config);
    }
};

/**
 * Get settings for a provider
 */
export const getProviderSettings = (providerId) => {
    const config = getProviderConfig();
    return config?.providers?.[providerId]?.settings || {
        temperature: 0.7,
        maxTokens: 2000
    };
};

/**
 * Update settings for a provider
 */
export const updateProviderSettings = (providerId, settings) => {
    const config = getProviderConfig();
    if (config.providers[providerId]) {
        config.providers[providerId].settings = {
            ...config.providers[providerId].settings,
            ...settings
        };
        saveProviderConfig(config);
    }
};

/**
 * Format portfolio data for LLM analysis
 */
const formatPortfolioForAnalysis = (holdings, metrics) => {
    const holdingsSummary = holdings.map(h => ({
        symbol: h.symbol,
        name: h.name,
        type: h.assetType,
        sector: h.sector,
        quantity: h.quantity,
        currentValue: h.marketValue,
        costBasis: h.totalCost,
        gainLoss: h.gainLoss,
        returnPercent: h.gainLossPercent,
    }));

    return {
        totalValue: metrics.totalValue,
        totalCost: metrics.totalCost,
        totalGainLoss: metrics.totalGainLoss,
        totalReturn: metrics.totalReturn,
        holdings: holdingsSummary,
        diversification: {
            score: metrics.diversificationScore,
            assetAllocation: metrics.assetAllocation,
            sectorAllocation: metrics.sectorAllocation,
            concentrationRisk: metrics.concentrationRisk,
        },
        risk: {
            score: metrics.riskScore,
            volatility: metrics.volatility,
        },
    };
};

/**
 * Create prompt for portfolio analysis
 */
const createAnalysisPrompt = (portfolioData) => {
    return `You are an expert financial advisor analyzing an investment portfolio. Please provide detailed, actionable recommendations.

Portfolio Summary:
- Total Value: $${portfolioData.totalValue.toFixed(2)}
- Total Return: ${portfolioData.totalReturn.toFixed(2)}%
- Risk Score: ${portfolioData.risk.score.toFixed(0)}/100
- Diversification Score: ${portfolioData.diversification.score.toFixed(0)}/100
- Concentration Risk: ${portfolioData.diversification.concentrationRisk.toFixed(1)}% in top 5 holdings

Holdings (${portfolioData.holdings.length} positions):
${portfolioData.holdings.map(h =>
        `- ${h.symbol} (${h.name}): ${h.type}, ${h.sector}, Value: $${h.currentValue.toFixed(2)}, Return: ${h.returnPercent.toFixed(2)}%`
    ).join('\n')}

Asset Allocation:
${Object.entries(portfolioData.diversification.assetAllocation).map(([type, data]) =>
        `- ${type}: ${data.percentage.toFixed(1)}% ($${data.value.toFixed(2)})`
    ).join('\n')}

Sector Allocation:
${Object.entries(portfolioData.diversification.sectorAllocation).map(([sector, data]) =>
        `- ${sector}: ${data.percentage.toFixed(1)}% ($${data.value.toFixed(2)})`
    ).join('\n')}

Please provide:
1. **Overall Assessment**: Brief analysis of the portfolio's current state
2. **Specific Recommendations**: For each holding, provide BUY/SELL/HOLD recommendation with reasoning
3. **Diversification Suggestions**: How to improve diversification
4. **Risk Management**: Suggestions to optimize risk-adjusted returns
5. **Action Items**: Top 3-5 specific actions to take

Format your response in clear sections with markdown formatting.`;
};

/**
 * Call LLM API for portfolio analysis
 */
export const analyzePortfolio = async (holdings, metrics, providerId = null) => {
    const activeProviderId = providerId || getActiveProvider();
    const provider = getProvider(activeProviderId);

    if (!provider) {
        throw new Error(`Provider not found: ${activeProviderId}`);
    }

    const apiKey = getProviderApiKey(activeProviderId);
    if (!apiKey) {
        throw new Error(`API key not configured for ${provider.name}. Please add your API key in settings.`);
    }

    const model = getProviderModel(activeProviderId);
    const settings = getProviderSettings(activeProviderId);

    const portfolioData = formatPortfolioForAnalysis(holdings, metrics);
    const prompt = createAnalysisPrompt(portfolioData);

    const messages = [
        {
            role: 'system',
            content: 'You are an expert financial advisor providing portfolio analysis and investment recommendations. Be specific, actionable, and consider both risk and return. Always provide clear BUY/SELL/HOLD recommendations with reasoning.',
        },
        {
            role: 'user',
            content: prompt,
        },
    ];

    try {
        let endpoint = provider.apiEndpoint;

        // Handle custom endpoint (e.g., Google)
        if (provider.customEndpoint) {
            endpoint = provider.customEndpoint(model, apiKey);
        }

        const headers = provider.headers(apiKey);
        const requestBody = provider.formatRequest(messages, {
            model,
            ...settings
        });

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || error.message || 'Failed to analyze portfolio');
        }

        const data = await response.json();
        return provider.formatResponse(data);
    } catch (error) {
        console.error('Error analyzing portfolio:', error);
        throw error;
    }
};

/**
 * Test connection to a provider
 */
export const testProviderConnection = async (providerId) => {
    const provider = getProvider(providerId);
    if (!provider) {
        throw new Error(`Provider not found: ${providerId}`);
    }

    const apiKey = getProviderApiKey(providerId);
    if (!apiKey) {
        throw new Error(`API key not configured for ${provider.name}`);
    }

    const model = getProviderModel(providerId);
    const messages = [
        {
            role: 'user',
            content: 'Hello, this is a test message. Please respond with "Connection successful".'
        }
    ];

    try {
        let endpoint = provider.apiEndpoint;
        if (provider.customEndpoint) {
            endpoint = provider.customEndpoint(model, apiKey);
        }

        const headers = provider.headers(apiKey);
        const requestBody = provider.formatRequest(messages, {
            model,
            temperature: 0.5,
            maxTokens: 50
        });

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || error.message || 'Connection failed');
        }

        return { success: true, message: 'Connection successful!' };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

/**
 * Parse recommendations from LLM response
 */
export const parseRecommendations = (analysisText) => {
    const recommendations = [];
    const lines = analysisText.split('\n');

    lines.forEach(line => {
        const buyMatch = line.match(/BUY/i);
        const sellMatch = line.match(/SELL/i);
        const holdMatch = line.match(/HOLD/i);

        if (buyMatch || sellMatch || holdMatch) {
            const action = buyMatch ? 'BUY' : sellMatch ? 'SELL' : 'HOLD';
            recommendations.push({
                action,
                text: line.trim(),
            });
        }
    });

    return {
        fullAnalysis: analysisText,
        recommendations,
    };
};

// Legacy exports for backward compatibility
export const getApiKey = () => getProviderApiKey(getActiveProvider());
export const saveApiKey = (apiKey) => setProviderApiKey(getActiveProvider(), apiKey);
export const removeApiKey = () => removeProviderApiKey(getActiveProvider());
