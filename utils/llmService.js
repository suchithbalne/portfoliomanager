/**
 * LLM Service for portfolio analysis and recommendations
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Get API key from localStorage
 */
export const getApiKey = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('openai_api_key');
    }
    return null;
};

/**
 * Save API key to localStorage
 */
export const saveApiKey = (apiKey) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('openai_api_key', apiKey);
    }
};

/**
 * Remove API key from localStorage
 */
export const removeApiKey = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('openai_api_key');
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
 * Call OpenAI API for portfolio analysis
 */
export const analyzePortfolio = async (holdings, metrics) => {
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new Error('OpenAI API key not configured. Please add your API key in settings.');
    }

    const portfolioData = formatPortfolioForAnalysis(holdings, metrics);
    const prompt = createAnalysisPrompt(portfolioData);

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert financial advisor providing portfolio analysis and investment recommendations. Be specific, actionable, and consider both risk and return. Always provide clear BUY/SELL/HOLD recommendations with reasoning.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to analyze portfolio');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error analyzing portfolio:', error);
        throw error;
    }
};

/**
 * Parse recommendations from LLM response
 */
export const parseRecommendations = (analysisText) => {
    // Simple parsing - in production, you might want more sophisticated parsing
    const recommendations = [];

    const lines = analysisText.split('\n');
    let currentHolding = null;

    lines.forEach(line => {
        // Look for BUY/SELL/HOLD keywords
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
