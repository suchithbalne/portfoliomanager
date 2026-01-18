# Portfolio Manager

A comprehensive portfolio management application with AI-powered recommendations and advanced financial analytics.

![Portfolio Manager](https://img.shields.io/badge/Next.js-16.1.3-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=flat-square&logo=react)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## Features

### 📊 Portfolio Analysis
- Import portfolios from CSV/Excel files (Fidelity, Robinhood, or any broker)
- Real-time portfolio valuation and performance tracking
- Comprehensive holdings table with sortable columns
- Interactive charts and visualizations

### 🎯 Advanced Analytics
- **Diversification Analysis**: Asset type and sector breakdown with recommendations
- **Risk Assessment**: Calculate portfolio risk score, volatility, and concentration
- **Performance Metrics**: Track best/worst performers, average returns, and more
- **Tax Optimization**: Identify tax loss harvesting opportunities and analyze capital gains
- **Dividend Tracking**: Monitor dividend income and yield across holdings

### 🤖 AI-Powered Recommendations
- Integration with OpenAI GPT-4 for intelligent portfolio analysis
- Personalized buy/sell/hold recommendations
- Risk-adjusted strategy suggestions
- Rebalancing guidance

### 🎨 Premium Design
- Modern dark mode with glassmorphism effects
- Vibrant gradient color palette
- Smooth animations and transitions
- Fully responsive design

## Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x450/1a1a24/8b5cf6?text=Dashboard+Overview)

### Diversification Analysis
![Diversification](https://via.placeholder.com/800x450/1a1a24/3b82f6?text=Diversification+Analysis)

### Risk Assessment
![Risk](https://via.placeholder.com/800x450/1a1a24/14b8a6?text=Risk+Assessment)

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd portfoliomanager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Importing Your Portfolio

1. **Export from your broker**:
   - **Fidelity**: Accounts → Positions → Download
   - **Robinhood**: Account → Statements → Export Holdings
   - **Generic**: Any CSV/Excel with Symbol and Quantity columns

2. **Upload to Portfolio Manager**:
   - Drag and drop your file onto the upload area
   - Or click "Choose File" to browse
   - Or click "Load Sample Portfolio" to try the demo

3. **Analyze your portfolio**:
   - View the Overview tab for summary metrics
   - Explore Holdings for detailed position information
   - Check Diversification for asset allocation insights
   - Review Risk Analysis for portfolio risk assessment
   - Use Tax Optimization to find tax-saving opportunities
   - Track Dividends for income projections
   - Get AI Recommendations for personalized advice

### Using AI Recommendations

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Navigate to the "AI Recommendations" tab
3. Click "Configure OpenAI API Key"
4. Enter your API key (stored locally in your browser only)
5. Click "Generate Recommendations"
6. Review and export your personalized investment advice

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **UI Library**: React 19
- **Styling**: Vanilla CSS with custom design system
- **Charts**: Chart.js with react-chartjs-2
- **File Parsing**: PapaParse (CSV) and SheetJS (Excel)
- **State Management**: React Context API
- **AI Integration**: OpenAI API (GPT-4)
- **Fonts**: Inter from Google Fonts

## Project Structure

```
portfoliomanager/
├── app/
│   ├── globals.css          # Global styles and design system
│   ├── layout.js            # Root layout
│   └── page.js              # Main application page
├── components/
│   ├── AIRecommendations.js # AI-powered recommendations
│   ├── AllocationChart.js   # Portfolio allocation chart
│   ├── Dashboard.js         # Main dashboard
│   ├── DiversificationAnalysis.js
│   ├── DividendTracker.js   # Dividend income tracking
│   ├── FileUpload.js        # File import interface
│   ├── HoldingsTable.js     # Holdings table
│   ├── PerformanceMetrics.js
│   ├── RiskMetrics.js       # Risk assessment
│   └── TaxOptimization.js   # Tax strategies
├── context/
│   └── PortfolioContext.js  # Portfolio state management
├── utils/
│   ├── fileParser.js        # CSV/Excel parsing
│   ├── llmService.js        # OpenAI integration
│   ├── portfolioCalculations.js
│   └── sampleData.js        # Demo portfolio data
└── package.json
```

## Features in Detail

### Portfolio Calculations
- Total value, cost basis, and gain/loss
- Return percentages (total, average, best/worst)
- Volatility (standard deviation)
- Diversification score (0-100)
- Risk score (0-100)
- Concentration risk analysis

### Tax Optimization
- Tax loss harvesting opportunities
- Short-term vs. long-term capital gains
- Holding period tracking
- Estimated tax savings calculations

### Dividend Tracking
- Identification of dividend-paying holdings
- Annual and monthly income projections
- Dividend yield calculations
- Dividend growth strategies

### Risk Analysis
- Overall portfolio risk score
- Volatility metrics
- Concentration risk assessment
- Risk mitigation strategies

## Data Privacy

- **Client-Side Processing**: All portfolio data is processed locally in your browser
- **No Server Storage**: Your portfolio data is never sent to external servers (except OpenAI for AI features)
- **LocalStorage**: Portfolio data is saved in your browser for convenience
- **Secure API Keys**: OpenAI API key is stored locally and never transmitted to our servers

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Charts powered by [Chart.js](https://www.chartjs.org/)
- File parsing by [PapaParse](https://www.papaparse.com/) and [SheetJS](https://sheetjs.com/)
- AI recommendations by [OpenAI](https://openai.com/)

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Note**: This application is for informational purposes only and should not be considered financial advice. Always consult with a qualified financial advisor before making investment decisions.
