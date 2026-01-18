/**
 * Format JSON analysis response to readable HTML with Dashboard Grid Layout
 */

export const formatJSONAnalysis = (jsonString) => {
    try {
        // Try to extract JSON from the response
        let cleanJson = jsonString.trim();

        // Remove markdown code blocks
        cleanJson = cleanJson.replace(/```json\n?/g, '').replace(/```\n?/g, '');

        // Extract JSON object (find first '{' and last '}')
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }

        // Remove trailing commas (common LLM JSON error)
        cleanJson = cleanJson.replace(/,(\s*[}\]])/g, '$1');

        let analysis;
        try {
            // First try strict JSON parse
            analysis = JSON.parse(cleanJson);
        } catch (strictError) {
            console.warn('Strict JSON parse failed, attempting loose parse:', strictError);
            try {
                // Fallback: Use Function constructor for loose JSON (handles single quotes, unquoted keys, etc.)
                // Security Note: LLM output is generally trusted in this context, but we ensure it's an object structure
                if (cleanJson.trim().startsWith('{') || cleanJson.trim().startsWith('[')) {
                    analysis = new Function('return ' + cleanJson)();
                } else {
                    throw strictError;
                }
            } catch (looseError) {
                console.error('All JSON parsing attempts failed:', looseError);
                console.debug('Failed JSON string:', cleanJson);
                return null;
            }
        }

        // Start Dashboard Grid
        let html = `<div class="analysis-dashboard">`;

        // --- Widget 1: Portfolio Overview & Top Holdings ---
        if (analysis.portfolio_overview) {
            html += `<div class="analysis-widget">
                <h2 class="widget-title">Top Holdings</h2>
                <div class="widget-content">
                    <div class="info-grid">
                         <div class="info-item">
                            <span class="label">Total Stocks</span>
                            <span class="value">${analysis.portfolio_overview.total_stocks}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Concentration</span>
                            <span class="badge badge-${getRiskClass(analysis.portfolio_overview.concentration_risk)}">${analysis.portfolio_overview.concentration_risk}</span>
                        </div>
                    </div>`;

            if (analysis.portfolio_overview.top_holdings?.length > 0) {
                html += `<div class="holdings-list">`;
                analysis.portfolio_overview.top_holdings.forEach(holding => {
                    html += `<div class="holding-item">
                        <span class="ticker">${holding.ticker}</span>
                        <span class="weight">${holding.weight}%</span>
                    </div>`;
                });
                html += `</div>`;
            }
            html += `</div></div>`;
        }

        // --- Widget 2: Sector Allocation ---
        if (analysis.sector_allocation?.length > 0) {
            html += `<div class="analysis-widget">
                <h2 class="widget-title">Sector Allocation</h2>
                <div class="widget-content sector-list">`;
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

        // --- Widget 3: Portfolio Scores ---
        if (analysis.scores) {
            html += `<div class="analysis-widget">
                <h2 class="widget-title">Portfolio Scores</h2>
                <div class="widget-content scores-grid">`;
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

        // --- Widget 4: Fundamental Quality ---
        if (analysis.fundamental_quality?.length > 0) {
            html += `<div class="analysis-widget">
                <h2 class="widget-title">Fundamental Quality</h2>
                <div class="widget-content quality-list">`;
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

        // --- Widget 5: Risk Analysis ---
        if (analysis.risk_analysis) {
            html += `<div class="analysis-widget">
                <h2 class="widget-title">Risk Analysis</h2>
                <div class="widget-content risk-grid">
                    <div class="risk-item ${analysis.risk_analysis.single_stock_risk ? 'risk-warning' : 'risk-ok'}">
                        <span class="risk-icon">${analysis.risk_analysis.single_stock_risk ? '⚠️' : '✅'}</span>
                        <span class="risk-label">Single Stock Risk</span>
                    </div>
                    <div class="risk-item ${analysis.risk_analysis.sector_concentration_risk ? 'risk-warning' : 'risk-ok'}">
                         <span class="risk-icon">${analysis.risk_analysis.sector_concentration_risk ? '⚠️' : '✅'}</span>
                         <span class="risk-label">Sector Concentration</span>
                    </div>
                    <div class="risk-item">
                        <span class="risk-label">Correlation Risk</span>
                         <span class="badge badge-${getRiskClass(analysis.risk_analysis.correlation_risk)}">${analysis.risk_analysis.correlation_risk}</span>
                    </div>
                </div>
            </div>`;
        }

        // --- Widget 6: Summary (Full Width or Large) ---
        if (analysis.retail_summary) {
            html += `<div class="analysis-widget full-width-widget">
                <h2 class="widget-title">Executive Summary</h2>
                <div class="widget-content summary-grid">`;

            if (analysis.retail_summary.strengths?.length > 0) {
                html += `<div class="summary-group">
                    <h3 class="summary-title text-success">✅ Strengths</h3>
                    <ul class="summary-list">`;
                analysis.retail_summary.strengths.forEach(item => html += `<li>${item}</li>`);
                html += `</ul></div>`;
            }

            if (analysis.retail_summary.risks?.length > 0) {
                html += `<div class="summary-group">
                     <h3 class="summary-title text-warning">⚠️ Risks</h3>
                     <ul class="summary-list">`;
                analysis.retail_summary.risks.forEach(item => html += `<li>${item}</li>`);
                html += `</ul></div>`;
            }

            if (analysis.retail_summary.improvement_plan?.length > 0) {
                html += `<div class="summary-group">
                     <h3 class="summary-title text-info">🎯 Improvement Plan</h3>
                     <ol class="summary-list">`;
                analysis.retail_summary.improvement_plan.forEach(item => html += `<li>${item}</li>`);
                html += `</ol></div>`;
            }
            html += `</div></div>`;
        }

        // --- Widget 7: Recommendations (Full Width) ---
        if (analysis.recommendations) {
            html += `<div class="analysis-widget full-width-widget">
                <h2 class="widget-title">Actionable Recommendations</h2>
                <div class="widget-content recommendations-grid">`;

            if (analysis.recommendations.hold?.length > 0) {
                html += `<div class="rec-column">
                    <h3 class="rec-title"><span class="badge badge-hold">HOLD</span></h3>
                    <ul class="rec-list">`;
                analysis.recommendations.hold.forEach(item => html += `<li>${item}</li>`);
                html += `</ul></div>`;
            }

            if (analysis.recommendations.reduce?.length > 0) {
                html += `<div class="rec-column">
                    <h3 class="rec-title"><span class="badge badge-reduce">REDUCE</span></h3>
                    <ul class="rec-list">`;
                analysis.recommendations.reduce.forEach(item => html += `<li>${item}</li>`);
                html += `</ul></div>`;
            }

            if (analysis.recommendations.exit?.length > 0) {
                html += `<div class="rec-column">
                    <h3 class="rec-title"><span class="badge badge-exit">EXIT</span></h3>
                    <ul class="rec-list">`;
                analysis.recommendations.exit.forEach(item => html += `<li>${item}</li>`);
                html += `</ul></div>`;
            }

            if (analysis.recommendations.rebalance_actions?.length > 0) {
                html += `<div class="rec-column">
                    <h3 class="rec-title"><span class="badge badge-info text-white">REBALANCE</span></h3>
                    <ul class="rec-list">`;
                analysis.recommendations.rebalance_actions.forEach(item => html += `<li>${item}</li>`);
                html += `</ul></div>`;
            }
            html += `</div></div>`;
        }

        html += `</div>`; // End Dashboard Grid
        return html;

    } catch (error) {
        console.error('Error parsing JSON analysis:', error);
        return null;
    }
};

// Helper functions (Unchanged logic, just keeping them)
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

// Updated CSS for Grid Layout
export const getJSONAnalysisStyles = () => `
  /* Dashboard Grid Container */
  .analysis-dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    padding-bottom: 20px;
  }

  /* Widget Styling */
  .analysis-widget {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-lg);
    padding: 20px;
    display: flex;
    flex-direction: column;
    max-height: 400px; /* Restrict height to prevent page scrolling */
    min-height: 300px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .analysis-widget:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    background: rgba(255, 255, 255, 0.04);
  }

  .full-width-widget {
    grid-column: 1 / -1;
    max-height: none; /* Allow summary/recs to expand if needed, or keep restricted */
  }

  .widget-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--primary-purple);
    flex-shrink: 0; /* Keep header strictly visible */
  }

  .widget-content {
    overflow-y: auto; /* Enable internal scrolling */
    padding-right: 8px; /* Space for scrollbar */
    flex-grow: 1;
  }

  /* Custom Scrollbar for Widgets */
  .widget-content::-webkit-scrollbar {
    width: 6px;
  }
  .widget-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
  }
  .widget-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  .widget-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Top Holdings Grid info */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .info-item {
     background: rgba(0,0,0,0.2);
     padding: 10px;
     border-radius: var(--radius-sm);
     display: flex;
     flex-direction: column;
     align-items: center;
     text-align: center;
  }

  .label { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 4px; }
  .value { font-weight: 700; color: var(--text-primary); }

  /* Lists */
  .holdings-list, .sector-list, .quality-list, .risk-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .holding-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-sm);
    align-items: center;
    border-left: 3px solid var(--primary-purple);
  }

  .ticker { font-weight: 700; color: var(--primary-blue); font-family: monospace; font-size: 1rem; }
  .weight { font-weight: 600; color: var(--text-primary); }

  /* Sectors */
  .sector-item {
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-sm);
  }
  .sector-header { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;}
  .sector-name { font-weight: 600; color: var(--text-primary); }
  .sector-bar { 
    height: 8px; /* Thinner bars */
    background: rgba(255,255,255,0.05); 
    border-radius: 4px; 
    overflow: hidden; 
    position: relative;
  }
  .sector-fill { height: 100%; background: linear-gradient(90deg, var(--primary-purple), var(--primary-blue)); }

  /* Scores */
  .scores-grid { display: flex; flex-direction: column; gap: 12px; }
  .score-item { display: grid; grid-template-columns: 120px 1fr 50px; gap: 10px; align-items: center; }
  .score-label { font-size: 0.85rem; font-weight: 500; color: var(--text-secondary); }
  .score-bar { height: 10px; background: rgba(255,255,255,0.05); border-radius: 5px; overflow: hidden; }
  .score-fill { height: 100%; }
  .score-value { font-size: 0.85rem; font-weight: 700; text-align: right; }

  /* Quality */
  .quality-item { 
    padding: 12px; 
    background: rgba(0,0,0,0.2); 
    border-radius: var(--radius-sm); 
  }
  .quality-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .quality-reason { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin: 0; }

  /* Risk */
  .risk-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    background: rgba(0,0,0,0.2);
    border-radius: var(--radius-sm);
  }
  .risk-icon { font-size: 1.2rem; }
  .risk-label { font-size: 0.85rem; }
  .risk-warning { border-left: 3px solid var(--error); }
  .risk-ok { border-left: 3px solid var(--success); }

  /* Summary Grid */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  .summary-group { }
  .summary-title { font-size: 1rem; font-weight: 600; margin-bottom: 8px; }
  .text-success { color: var(--success); }
  .text-warning { color: #ffc107; }
  .text-info { color: var(--primary-blue); }
  .summary-list { padding-left: 20px; margin: 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; }
  .summary-list li { margin-bottom: 6px; }

  /* Recommendations Grid */
  .recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }
  .rec-column {
    background: rgba(0,0,0,0.2);
    padding: 16px;
    border-radius: var(--radius-md);
  }
  .rec-title { margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }
  .rec-list { padding-left: 20px; margin: 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; }
  .rec-list li { margin-bottom: 6px; }

  /* Badges & Utilities */
  .badge { padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .badge-success { background: rgba(16, 185, 129, 0.2); color: #10b981; }
  .badge-warning { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
  .badge-error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
  .badge-info { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
  .badge-neutral { background: rgba(255, 255, 255, 0.1); color: #a1a1aa; }
  
  .badge-hold { background: rgba(255, 193, 7, 0.15); color: #ffc107; border: 1px solid rgba(255, 193, 7, 0.3); }
  .badge-reduce { background: rgba(249, 115, 22, 0.15); color: #f97316; border: 1px solid rgba(249, 115, 22, 0.3); }
  .badge-exit { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
  .text-white { color: white !important; }

  .score-excellent { background: linear-gradient(90deg, #10b981, #059669); }
  .score-good { background: linear-gradient(90deg, #3b82f6, #2563eb); }
  .score-fair { background: linear-gradient(90deg, #f59e0b, #d97706); }
  .score-poor { background: linear-gradient(90deg, #ef4444, #dc2626); }

  @media (max-width: 768px) {
    .analysis-dashboard { grid-template-columns: 1fr; }
    .full-width-widget { grid-column: 1; }
  }
`;
