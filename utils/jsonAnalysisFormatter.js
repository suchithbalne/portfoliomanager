/**
 * Format JSON analysis response to readable HTML
 */

export const formatJSONAnalysis = (jsonString) => {
    try {
        // Try to extract JSON from the response (in case it's wrapped in markdown)
        let cleanJson = jsonString.trim();

        // Remove markdown code blocks if present
        cleanJson = cleanJson.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Parse the JSON
        const analysis = JSON.parse(cleanJson);

        let html = '';

        // Portfolio Overview
        if (analysis.portfolio_overview) {
            html += `<div class="analysis-section">
        <h2 class="section-title">📊 Portfolio Overview</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Total Stocks:</span>
            <span class="value">${analysis.portfolio_overview.total_stocks}</span>
          </div>
          <div class="info-item">
            <span class="label">Concentration Risk:</span>
            <span class="badge badge-${getRiskClass(analysis.portfolio_overview.concentration_risk)}">${analysis.portfolio_overview.concentration_risk}</span>
          </div>
        </div>`;

            if (analysis.portfolio_overview.top_holdings?.length > 0) {
                html += `<h3 class="subsection-title">Top Holdings</h3>
          <div class="holdings-list">`;
                analysis.portfolio_overview.top_holdings.forEach(holding => {
                    html += `<div class="holding-item">
            <span class="ticker">${holding.ticker}</span>
            <span class="weight">${holding.weight}%</span>
          </div>`;
                });
                html += `</div>`;
            }
            html += `</div>`;
        }

        // Sector Allocation
        if (analysis.sector_allocation?.length > 0) {
            html += `<div class="analysis-section">
        <h2 class="section-title">🎯 Sector Allocation</h2>
        <div class="sector-list">`;
            analysis.sector_allocation.forEach(sector => {
                html += `<div class="sector-item">
          <div class="sector-header">
            <span class="sector-name">${sector.sector}</span>
            <span class="badge badge-${getStatusClass(sector.status)}">${sector.status}</span>
          </div>
          <div class="sector-bar">
            <div class="sector-fill" style="width: ${sector.weight}%"></div>
            <span class="sector-weight">${sector.weight}%</span>
          </div>
        </div>`;
            });
            html += `</div></div>`;
        }

        // Risk Analysis
        if (analysis.risk_analysis) {
            html += `<div class="analysis-section">
        <h2 class="section-title">⚠️ Risk Analysis</h2>
        <div class="risk-grid">
          <div class="risk-item ${analysis.risk_analysis.single_stock_risk ? 'risk-warning' : 'risk-ok'}">
            <span class="risk-icon">${analysis.risk_analysis.single_stock_risk ? '⚠️' : '✅'}</span>
            <span class="risk-label">Single Stock Risk</span>
          </div>
          <div class="risk-item ${analysis.risk_analysis.sector_concentration_risk ? 'risk-warning' : 'risk-ok'}">
            <span class="risk-icon">${analysis.risk_analysis.sector_concentration_risk ? '⚠️' : '✅'}</span>
            <span class="risk-label">Sector Concentration Risk</span>
          </div>
          <div class="risk-item">
            <span class="risk-label">Correlation Risk:</span>
            <span class="badge badge-${getRiskClass(analysis.risk_analysis.correlation_risk)}">${analysis.risk_analysis.correlation_risk}</span>
          </div>
        </div>
      </div>`;
        }

        // Fundamental Quality
        if (analysis.fundamental_quality?.length > 0) {
            html += `<div class="analysis-section">
        <h2 class="section-title">💎 Fundamental Quality</h2>
        <div class="quality-list">`;
            analysis.fundamental_quality.forEach(stock => {
                html += `<div class="quality-item">
          <div class="quality-header">
            <span class="ticker">${stock.ticker}</span>
            <span class="badge badge-${getRatingClass(stock.rating)}">${stock.rating}</span>
          </div>
          <p class="quality-reason">${stock.reason}</p>
        </div>`;
            });
            html += `</div></div>`;
        }

        // Scores
        if (analysis.scores) {
            html += `<div class="analysis-section">
        <h2 class="section-title">📈 Portfolio Scores</h2>
        <div class="scores-grid">`;
            Object.entries(analysis.scores).forEach(([key, value]) => {
                const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                html += `<div class="score-item">
          <div class="score-label">${label}</div>
          <div class="score-bar">
            <div class="score-fill score-${getScoreClass(value)}" style="width: ${value}%"></div>
          </div>
          <div class="score-value">${value}/100</div>
        </div>`;
            });
            html += `</div></div>`;
        }

        // Recommendations
        if (analysis.recommendations) {
            html += `<div class="analysis-section">
        <h2 class="section-title">💡 Recommendations</h2>`;

            if (analysis.recommendations.hold?.length > 0) {
                html += `<div class="rec-group">
          <h3 class="rec-title"><span class="badge badge-hold">HOLD</span></h3>
          <ul class="rec-list">`;
                analysis.recommendations.hold.forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += `</ul></div>`;
            }

            if (analysis.recommendations.reduce?.length > 0) {
                html += `<div class="rec-group">
          <h3 class="rec-title"><span class="badge badge-reduce">REDUCE</span></h3>
          <ul class="rec-list">`;
                analysis.recommendations.reduce.forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += `</ul></div>`;
            }

            if (analysis.recommendations.exit?.length > 0) {
                html += `<div class="rec-group">
          <h3 class="rec-title"><span class="badge badge-exit">EXIT</span></h3>
          <ul class="rec-list">`;
                analysis.recommendations.exit.forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += `</ul></div>`;
            }

            if (analysis.recommendations.rebalance_actions?.length > 0) {
                html += `<div class="rec-group">
          <h3 class="rec-title">🔄 Rebalance Actions</h3>
          <ul class="rec-list">`;
                analysis.recommendations.rebalance_actions.forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += `</ul></div>`;
            }

            html += `</div>`;
        }

        // Retail Summary
        if (analysis.retail_summary) {
            html += `<div class="analysis-section">
        <h2 class="section-title">📝 Summary</h2>`;

            if (analysis.retail_summary.strengths?.length > 0) {
                html += `<div class="summary-group">
          <h3 class="summary-title">✅ Strengths</h3>
          <ul class="summary-list">`;
                analysis.retail_summary.strengths.forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += `</ul></div>`;
            }

            if (analysis.retail_summary.risks?.length > 0) {
                html += `<div class="summary-group">
          <h3 class="summary-title">⚠️ Risks</h3>
          <ul class="summary-list">`;
                analysis.retail_summary.risks.forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += `</ul></div>`;
            }

            if (analysis.retail_summary.improvement_plan?.length > 0) {
                html += `<div class="summary-group">
          <h3 class="summary-title">🎯 Improvement Plan</h3>
          <ol class="summary-list">`;
                analysis.retail_summary.improvement_plan.forEach(item => {
                    html += `<li>${item}</li>`;
                });
                html += `</ol></div>`;
            }

            html += `</div>`;
        }

        return html;
    } catch (error) {
        console.error('Error parsing JSON analysis:', error);
        // Fallback to markdown formatter
        return null;
    }
};

// Helper functions
const getRiskClass = (risk) => {
    const r = risk?.toLowerCase();
    if (r === 'low') return 'success';
    if (r === 'moderate') return 'warning';
    if (r === 'high') return 'error';
    return 'neutral';
};

const getStatusClass = (status) => {
    const s = status?.toLowerCase();
    if (s === 'normal') return 'success';
    if (s === 'overweight') return 'warning';
    if (s === 'underweight') return 'info';
    return 'neutral';
};

const getRatingClass = (rating) => {
    const r = rating?.toLowerCase();
    if (r === 'strong') return 'success';
    if (r === 'neutral') return 'warning';
    if (r === 'weak') return 'error';
    return 'neutral';
};

const getScoreClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
};

// CSS styles for JSON analysis
export const getJSONAnalysisStyles = () => `
  .analysis-section {
    margin-bottom: 32px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    border: 1px solid var(--glass-border);
  }
  
  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--primary-purple);
  }
  
  .subsection-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--primary-blue);
    margin: 16px 0 12px 0;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-md);
  }
  
  .label {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
  
  .value {
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .badge {
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  .badge-success { background: var(--success-bg); color: var(--success); }
  .badge-warning { background: rgba(255, 193, 7, 0.1); color: #ffc107; }
  .badge-error { background: var(--error-bg); color: var(--error); }
  .badge-info { background: rgba(59, 130, 246, 0.1); color: var(--primary-blue); }
  .badge-neutral { background: rgba(255, 255, 255, 0.05); color: var(--text-secondary); }
  
  .badge-hold { background: rgba(255, 193, 7, 0.1); color: #ffc107; border: 1px solid #ffc107; }
  .badge-reduce { background: rgba(255, 152, 0, 0.1); color: #ff9800; border: 1px solid #ff9800; }
  .badge-exit { background: var(--error-bg); color: var(--error); border: 1px solid var(--error); }
  
  .holdings-list, .sector-list, .quality-list {
    display: grid;
    gap: 12px;
  }
  
  .holding-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 14px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-sm);
  }
  
  .ticker {
    font-weight: 700;
    color: var(--primary-blue);
    font-family: monospace;
  }
  
  .weight {
    font-weight: 600;
    color: var(--primary-purple);
  }
  
  .sector-item {
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-md);
  }
  
  .sector-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .sector-name {
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .sector-bar {
    position: relative;
    height: 24px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    overflow: hidden;
  }
  
  .sector-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-purple), var(--primary-blue));
    transition: width 0.3s ease;
  }
  
  .sector-weight {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.75rem;
    font-weight: 600;
    color: white;
  }
  
  .risk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  
  .risk-item {
    padding: 16px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .risk-warning {
    border-left: 4px solid var(--error);
  }
  
  .risk-ok {
    border-left: 4px solid var(--success);
  }
  
  .risk-icon {
    font-size: 1.5rem;
  }
  
  .risk-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  
  .quality-item {
    padding: 16px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-md);
  }
  
  .quality-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .quality-reason {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin: 0;
  }
  
  .scores-grid {
    display: grid;
    gap: 16px;
  }
  
  .score-item {
    display: grid;
    grid-template-columns: 120px 1fr 60px;
    gap: 12px;
    align-items: center;
  }
  
  .score-label {
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .score-bar {
    height: 24px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    overflow: hidden;
  }
  
  .score-fill {
    height: 100%;
    transition: width 0.3s ease;
  }
  
  .score-excellent { background: linear-gradient(90deg, #10b981, #059669); }
  .score-good { background: linear-gradient(90deg, #3b82f6, #2563eb); }
  .score-fair { background: linear-gradient(90deg, #f59e0b, #d97706); }
  .score-poor { background: linear-gradient(90deg, #ef4444, #dc2626); }
  
  .score-value {
    text-align: right;
    font-weight: 700;
    color: var(--primary-purple);
  }
  
  .rec-group, .summary-group {
    margin-bottom: 20px;
  }
  
  .rec-title, .summary-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }
  
  .rec-list, .summary-list {
    margin: 0;
    padding-left: 24px;
  }
  
  .rec-list li, .summary-list li {
    margin: 8px 0;
    color: var(--text-secondary);
    line-height: 1.6;
  }
`;
