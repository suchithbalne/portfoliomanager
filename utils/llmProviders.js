// LLM Provider Configuration
// Centralized configuration for all supported LLM providers

export const LLM_PROVIDERS = {
    openai: {
        id: 'openai',
        name: 'OpenAI',
        icon: '🤖',
        website: 'https://platform.openai.com',
        apiEndpoint: 'https://api.openai.com/v1/chat/completions',
        requiresApiKey: true,
        models: [
            {
                id: 'gpt-4-turbo',
                name: 'GPT-4 Turbo',
                contextWindow: 128000,
                description: 'Most capable, best for complex analysis'
            },
            {
                id: 'gpt-4',
                name: 'GPT-4',
                contextWindow: 8192,
                description: 'High quality, slower'
            },
            {
                id: 'gpt-3.5-turbo',
                name: 'GPT-3.5 Turbo',
                contextWindow: 16385,
                description: 'Fast and cost-effective'
            }
        ],
        defaultModel: 'gpt-4-turbo',
        headers: (apiKey) => ({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }),
        formatRequest: (messages, options) => ({
            model: options.model || 'gpt-4-turbo',
            messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000
        }),
        formatResponse: (response) => {
            return response.choices[0].message.content;
        }
    },

    groq: {
        id: 'groq',
        name: 'Groq',
        icon: '⚡',
        website: 'https://console.groq.com',
        apiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
        requiresApiKey: true,
        models: [
            // Llama 3.3 (Latest)
            {
                id: 'llama-3.3-70b-versatile',
                name: 'Llama 3.3 70B Versatile',
                contextWindow: 128000,
                description: 'Latest Llama 3.3, most capable'
            },
            {
                id: 'llama-3.3-70b-specdec',
                name: 'Llama 3.3 70B Speculative',
                contextWindow: 8192,
                description: 'Optimized for speed with speculative decoding'
            },
            // Llama 3.1
            {
                id: 'llama-3.1-70b-versatile',
                name: 'Llama 3.1 70B Versatile',
                contextWindow: 128000,
                description: 'Large context, versatile'
            },
            {
                id: 'llama-3.1-8b-instant',
                name: 'Llama 3.1 8B Instant',
                contextWindow: 128000,
                description: 'Fast, large context'
            },
            // Llama 3 (Original)
            {
                id: 'llama3-70b-8192',
                name: 'Llama 3 70B',
                contextWindow: 8192,
                description: 'High quality, balanced'
            },
            {
                id: 'llama3-8b-8192',
                name: 'Llama 3 8B',
                contextWindow: 8192,
                description: 'Fastest Llama 3'
            },
            // Llama Guard
            {
                id: 'llama-guard-3-8b',
                name: 'Llama Guard 3 8B',
                contextWindow: 8192,
                description: 'Content moderation model'
            },
            // Mixtral
            {
                id: 'mixtral-8x7b-32768',
                name: 'Mixtral 8x7B',
                contextWindow: 32768,
                description: 'Large context, MoE architecture'
            },
            // Gemma 2
            {
                id: 'gemma2-9b-it',
                name: 'Gemma 2 9B',
                contextWindow: 8192,
                description: 'Google Gemma 2, efficient'
            },
            {
                id: 'gemma-7b-it',
                name: 'Gemma 7B',
                contextWindow: 8192,
                description: 'Original Gemma, fast'
            },
            // Qwen (Alibaba)
            {
                id: 'qwen2.5-72b-instruct',
                name: 'Qwen 2.5 72B',
                contextWindow: 32768,
                description: 'Latest Qwen, very capable'
            },
        ],
        defaultModel: 'llama-3.3-70b-versatile',
        headers: (apiKey) => ({
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }),
        formatRequest: (messages, options) => ({
            model: options.model || 'llama-3.3-70b-versatile',
            messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 2000
        }),
        formatResponse: (response) => {
            return response.choices[0].message.content;
        },
        // Dynamic model fetching from Groq API
        fetchModels: async (apiKey) => {
            try {
                const response = await fetch('https://api.groq.com/openai/v1/models', {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch models');
                }

                const data = await response.json();

                // Transform API response to our model format
                return data.data
                    .filter(model => model.active) // Only active models
                    .map(model => ({
                        id: model.id,
                        name: model.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                        contextWindow: model.context_window || 8192,
                        description: `${model.owned_by || 'Groq'} model`
                    }))
                    .sort((a, b) => b.contextWindow - a.contextWindow); // Sort by context window
            } catch (error) {
                console.error('Error fetching Groq models:', error);
                return null; // Fall back to static list
            }
        }
    },

    anthropic: {
        id: 'anthropic',
        name: 'Anthropic',
        icon: '🧠',
        website: 'https://console.anthropic.com',
        apiEndpoint: 'https://api.anthropic.com/v1/messages',
        requiresApiKey: true,
        models: [
            {
                id: 'claude-3-opus-20240229',
                name: 'Claude 3 Opus',
                contextWindow: 200000,
                description: 'Most intelligent, best reasoning'
            },
            {
                id: 'claude-3-sonnet-20240229',
                name: 'Claude 3 Sonnet',
                contextWindow: 200000,
                description: 'Balanced performance and speed'
            },
            {
                id: 'claude-3-haiku-20240307',
                name: 'Claude 3 Haiku',
                contextWindow: 200000,
                description: 'Fastest, most compact'
            }
        ],
        defaultModel: 'claude-3-sonnet-20240229',
        headers: (apiKey) => ({
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
        }),
        formatRequest: (messages, options) => {
            // Convert OpenAI format to Anthropic format
            const systemMessage = messages.find(m => m.role === 'system');
            const userMessages = messages.filter(m => m.role !== 'system');

            return {
                model: options.model || 'claude-3-sonnet-20240229',
                max_tokens: options.maxTokens || 4096,
                system: systemMessage?.content || '',
                messages: userMessages
            };
        },
        formatResponse: (response) => {
            return response.content[0].text;
        }
    },

    google: {
        id: 'google',
        name: 'Google',
        icon: '🔍',
        website: 'https://ai.google.dev',
        apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        requiresApiKey: true,
        models: [
            {
                id: 'gemini-pro',
                name: 'Gemini Pro',
                contextWindow: 32000,
                description: 'Powerful multimodal model'
            },
            {
                id: 'gemini-pro-vision',
                name: 'Gemini Pro Vision',
                contextWindow: 16000,
                description: 'Supports images'
            }
        ],
        defaultModel: 'gemini-pro',
        headers: (apiKey) => ({
            'Content-Type': 'application/json'
        }),
        formatRequest: (messages, options) => {
            // Convert to Gemini format
            const contents = messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            return {
                contents,
                generationConfig: {
                    temperature: options.temperature || 0.7,
                    maxOutputTokens: options.maxTokens || 2000
                }
            };
        },
        formatResponse: (response) => {
            return response.candidates[0].content.parts[0].text;
        },
        customEndpoint: (model, apiKey) => {
            return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        }
    }
};

// Get all provider IDs
export const getProviderIds = () => Object.keys(LLM_PROVIDERS);

// Get provider by ID
export const getProvider = (providerId) => LLM_PROVIDERS[providerId];

// Get all providers as array
export const getAllProviders = () => Object.values(LLM_PROVIDERS);

// Check if provider exists
export const isValidProvider = (providerId) => providerId in LLM_PROVIDERS;

// Get models for a provider
export const getProviderModels = (providerId) => {
    const provider = getProvider(providerId);
    return provider ? provider.models : [];
};

// Get default model for provider
export const getDefaultModel = (providerId) => {
    const provider = getProvider(providerId);
    return provider ? provider.defaultModel : null;
};
