/**
 * Format markdown text to HTML for AI analysis display
 */

export const formatMarkdownToHTML = (markdown) => {
  if (!markdown) return '';

  let html = markdown;

  // Escape HTML to prevent XSS
  html = html.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers (must be done before other replacements)
  html = html.replace(/^# (.*$)/gim, '<h1 class="ai-h1">$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="ai-h2">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="ai-h3">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4 class="ai-h4">$1</h4>');

  // Bold text **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="ai-bold">$1</strong>');

  // Italic text *text*
  html = html.replace(/\*(.*?)\*/g, '<em class="ai-italic">$1</em>');

  // Code blocks ```code```
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="ai-code-block"><code>$1</code></pre>');

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>');

  // Unordered lists
  html = html.replace(/^\s*[-*+]\s+(.+)$/gim, '<li class="ai-list-item">$1</li>');

  // Wrap consecutive list items in ul
  html = html.replace(/(<li class="ai-list-item">.*<\/li>\n?)+/g, (match) => {
    return '<ul class="ai-list">' + match + '</ul>';
  });

  // Numbered lists
  html = html.replace(/^\s*(\d+)\.\s+(.+)$/gim, '<li class="ai-list-item">$2</li>');

  // Wrap consecutive numbered list items in ol
  html = html.replace(/(<li class="ai-list-item">.*<\/li>\n?)+/g, (match) => {
    // Only wrap if not already wrapped
    if (!match.includes('<ul') && !match.includes('<ol')) {
      return '<ol class="ai-list">' + match + '</ol>';
    }
    return match;
  });

  // Action keywords with badges
  html = html.replace(/\bBUY\b/g, '<span class="ai-badge ai-badge-buy">BUY</span>');
  html = html.replace(/\bSELL\b/g, '<span class="ai-badge ai-badge-sell">SELL</span>');
  html = html.replace(/\bHOLD\b/g, '<span class="ai-badge ai-badge-hold">HOLD</span>');

  // Stock symbols (e.g., $AAPL, AAPL)
  html = html.replace(/\$([A-Z]{1,5})\b/g, '<span class="ai-symbol">$$$1</span>');
  html = html.replace(/\b([A-Z]{2,5})\b(?=\s|,|\.|\))/g, (match) => {
    // Only highlight if it looks like a stock symbol (2-5 uppercase letters)
    if (match.length >= 2 && match.length <= 5) {
      return `<span class="ai-symbol">${match}</span>`;
    }
    return match;
  });

  // Percentages
  html = html.replace(/(-?\d+\.?\d*)%/g, '<span class="ai-percentage">$1%</span>');

  // Currency
  html = html.replace(/\$(\d{1,3}(,\d{3})*(\.\d{2})?)/g, '<span class="ai-currency">$$$1</span>');

  // Line breaks
  html = html.replace(/\n\n/g, '<br/><br/>');
  html = html.replace(/\n/g, '<br/>');

  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gim, '<blockquote class="ai-blockquote">$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="ai-hr"/>');

  return `<div class="glass-card p-4">${html}</div>`;
};

// CSS styles to inject
export const getMarkdownStyles = () => `
  .ai-h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-top: 32px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--primary-purple);
  }
  
  .ai-h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-purple);
    margin-top: 28px;
    margin-bottom: 14px;
  }
  
  .ai-h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary-blue);
    margin-top: 24px;
    margin-bottom: 12px;
  }
  
  .ai-h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 20px;
    margin-bottom: 10px;
  }
  
  .ai-bold {
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .ai-italic {
    font-style: italic;
    color: var(--text-secondary);
  }
  
  .ai-code-block {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: 16px;
    margin: 16px 0;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
  }
  
  .ai-code-block code {
    color: var(--text-primary);
  }
  
  .ai-inline-code {
    background: rgba(139, 92, 246, 0.15);
    color: var(--primary-purple);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
  }
  
  .ai-list {
    margin: 12px 0;
    padding-left: 24px;
  }
  
  .ai-list-item {
    margin: 8px 0;
    line-height: 1.6;
    color: var(--text-secondary);
  }
  
  .ai-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.875rem;
    letter-spacing: 0.5px;
    margin: 0 4px;
  }
  
  .ai-badge-buy {
    background: var(--success-bg);
    color: var(--success);
    border: 1px solid var(--success);
  }
  
  .ai-badge-sell {
    background: var(--error-bg);
    color: var(--error);
    border: 1px solid var(--error);
  }
  
  .ai-badge-hold {
    background: rgba(255, 193, 7, 0.1);
    color: #ffc107;
    border: 1px solid #ffc107;
  }
  
  .ai-symbol {
    font-weight: 600;
    color: var(--primary-blue);
    font-family: monospace;
  }
  
  .ai-percentage {
    font-weight: 600;
    color: var(--primary-purple);
  }
  
  .ai-currency {
    font-weight: 600;
    color: var(--success);
  }
  
  .ai-blockquote {
    border-left: 4px solid var(--primary-purple);
    padding-left: 16px;
    margin: 16px 0;
    color: var(--text-tertiary);
    font-style: italic;
  }
  
  .ai-hr {
    border: none;
    border-top: 1px solid var(--glass-border);
    margin: 24px 0;
  }
`;
