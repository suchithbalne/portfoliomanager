# Portfolio Manager - Agent Development Guidelines

## Overview

This document defines the coding standards, security protocols, and best practices for developing and maintaining the Portfolio Manager application. All AI agents and developers working on this codebase must adhere to these guidelines.

---

## Table of Contents

1. [Code Organization](#code-organization)
2. [Coding Standards](#coding-standards)
3. [Security Protocols](#security-protocols)
4. [Data Privacy](#data-privacy)
5. [File Handling](#file-handling)
6. [Component Development](#component-development)
7. [State Management](#state-management)
8. [Error Handling](#error-handling)
9. [Testing Requirements](#testing-requirements)
10. [Performance Guidelines](#performance-guidelines)

---

## Code Organization

### Directory Structure

```
portfoliomanager/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and design system
│   ├── layout.js          # Root layout
│   └── page.js            # Main application page
├── components/            # React components
│   ├── AIRecommendations.js
│   ├── AllocationChart.js
│   ├── Dashboard.js
│   ├── DiversificationAnalysis.js
│   ├── DividendTracker.js
│   ├── FileUpload.js
│   ├── HoldingsTable.js
│   ├── PerformanceMetrics.js
│   ├── RiskMetrics.js
│   └── TaxOptimization.js
├── context/               # React Context providers
│   └── PortfolioContext.js
├── utils/                 # Utility functions
│   ├── fileParser.js
│   ├── llmService.js
│   └── portfolioCalculations.js
├── resources/             # User data files (gitignored)
└── .agent/                # Agent configuration
    └── DEVELOPMENT_GUIDELINES.md
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `FileUpload.js`, `DashboardMetrics.js`)
- **Utilities**: camelCase (e.g., `fileParser.js`, `portfolioCalculations.js`)
- **Contexts**: PascalCase with "Context" suffix (e.g., `PortfolioContext.js`)
- **Styles**: kebab-case for CSS files (e.g., `globals.css`)

---

## Coding Standards

### JavaScript/React Guidelines

#### 1. Use Modern JavaScript (ES6+)

```javascript
// ✅ GOOD: Use arrow functions
const calculateTotal = (holdings) => {
  return holdings.reduce((sum, h) => sum + h.marketValue, 0);
};

// ❌ BAD: Avoid function declarations in components
function calculateTotal(holdings) {
  return holdings.reduce((sum, h) => sum + h.marketValue, 0);
}
```

#### 2. Component Structure

```javascript
'use client'; // Always specify client/server component

import { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

/**
 * ComponentName - Brief description
 * 
 * @param {Object} props - Component props
 * @param {Array} props.holdings - Portfolio holdings array
 * @returns {JSX.Element}
 */
export default function ComponentName({ holdings }) {
  // 1. Hooks first
  const [state, setState] = useState(null);
  const { importHoldings } = usePortfolio();
  
  // 2. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 3. Computed values
  const total = calculateTotal(holdings);
  
  // 4. Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

#### 3. Prop Validation

```javascript
// Always destructure props for clarity
export default function MyComponent({ data, onUpdate, isLoading = false }) {
  // Component logic
}

// Document expected prop types in JSDoc
/**
 * @param {Array<Object>} holdings - Array of portfolio holdings
 * @param {Function} onUpdate - Callback when data updates
 * @param {boolean} [isLoading=false] - Loading state
 */
```

#### 4. Naming Conventions

```javascript
// ✅ GOOD: Descriptive, clear names
const calculateTotalValue = (holdings) => { /*...*/ };
const isUserAuthenticated = () => { /*...*/ };
const handleFileUpload = (file) => { /*...*/ };

// ❌ BAD: Unclear, abbreviated names
const calc = (h) => { /*...*/ };
const chk = () => { /*...*/ };
const hfu = (f) => { /*...*/ };
```

#### 5. Constants

```javascript
// Define constants at the top of the file
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FILE_TYPES = ['.csv', '.xlsx', '.xls'];
const API_ENDPOINTS = {
  OPENAI: 'https://api.openai.com/v1/chat/completions',
};
```

---

## Security Protocols

### 1. API Key Management

**CRITICAL**: Never commit API keys to version control.

```javascript
// ✅ GOOD: Store API keys in browser localStorage only
export const getApiKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('openai_api_key');
  }
  return null;
};

// ❌ BAD: Never hardcode API keys
const API_KEY = 'sk-1234567890abcdef'; // NEVER DO THIS
```

#### API Key Security Checklist

- [ ] API keys stored in `localStorage` only, never in code
- [ ] Keys never transmitted to backend servers
- [ ] User informed that keys are stored locally
- [ ] Option to remove/clear API keys provided
- [ ] No API keys in git history

### 2. Input Validation

```javascript
// ✅ GOOD: Validate and sanitize all user inputs
const cleanNumericValue = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  
  // Remove potentially dangerous characters
  const cleaned = String(value).replace(/[\$\+\%\,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// ❌ BAD: Direct use of user input
const value = parseFloat(userInput); // Could be NaN or malicious
```

### 3. File Upload Security

```javascript
// ✅ GOOD: Validate file types and sizes
export const validateFile = (file) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  
  if (file.size > MAX_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }
  
  if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
    throw new Error('Invalid file type. Only CSV and Excel files are allowed.');
  }
  
  return true;
};
```

### 4. XSS Prevention

```javascript
// ✅ GOOD: Never use dangerouslySetInnerHTML unless absolutely necessary
// If you must use it, sanitize the content first
<div
  dangerouslySetInnerHTML={{
    __html: sanitizeHTML(content) // Use a sanitization library
  }}
/>

// ✅ BETTER: Use React's built-in escaping
<div>{content}</div>
```

---

## Data Privacy

### Principles

1. **Client-Side Processing**: All portfolio data must be processed in the browser
2. **No Server Storage**: Never send portfolio data to backend servers
3. **LocalStorage Only**: Use browser localStorage for persistence
4. **User Control**: Users must be able to clear all data

### Implementation

```javascript
// ✅ GOOD: Clear data privacy boundaries
export const PortfolioProvider = ({ children }) => {
  // Load from localStorage (client-side only)
  useEffect(() => {
    const savedHoldings = localStorage.getItem('portfolio_holdings');
    if (savedHoldings) {
      setHoldings(JSON.parse(savedHoldings));
    }
  }, []);
  
  // Clear all user data
  const clearPortfolio = () => {
    setHoldings([]);
    localStorage.removeItem('portfolio_holdings');
    localStorage.removeItem('portfolio_name');
    // Clear any other user data
  };
  
  return (
    <PortfolioContext.Provider value={{ holdings, clearPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
};
```

### Data Retention Policy

- Portfolio data: Stored in `localStorage` until user clears it
- API keys: Stored in `localStorage` until user removes them
- No analytics or tracking cookies
- No data sent to third parties (except OpenAI API when explicitly requested)

---

## File Handling

### CSV/Excel Parsing

```javascript
// ✅ GOOD: Robust file parsing with error handling
export const parsePortfolioFile = async (file) => {
  try {
    // Validate file first
    validateFile(file);
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    let data;
    if (fileExtension === 'csv') {
      data = await parseCSV(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      data = await parseExcel(file);
    } else {
      throw new Error('Unsupported file format');
    }
    
    // Validate parsed data
    validatePortfolioData(data);
    
    return data;
  } catch (error) {
    // Log error for debugging (never log sensitive data)
    console.error('File parsing error:', error.message);
    throw error;
  }
};
```

### Broker Format Support

When adding support for a new broker format:

1. **Analyze the format**: Examine sample CSV/Excel files
2. **Map fields**: Create field mapping for the broker
3. **Add detection logic**: Identify broker format automatically
4. **Test thoroughly**: Use real broker exports for testing
5. **Document**: Add broker to README and user documentation

```javascript
// Example: Adding new broker support
const normalizeBrokerData = (row, brokerType) => {
  switch (brokerType) {
    case 'fidelity':
      return {
        symbol: row.Symbol,
        name: row.Description,
        quantity: cleanNumericValue(row.Quantity),
        currentPrice: cleanNumericValue(row['Last Price']),
        // ... other fields
      };
    
    case 'robinhood':
      return {
        symbol: row.ticker,
        name: row.name,
        quantity: cleanNumericValue(row.shares),
        // ... other fields
      };
    
    default:
      return normalizeGenericFormat(row);
  }
};
```

---

## Component Development

### Component Guidelines

#### 1. Single Responsibility

Each component should have one clear purpose.

```javascript
// ✅ GOOD: Focused component
export default function HoldingsTable({ holdings }) {
  // Only handles displaying holdings in a table
}

// ❌ BAD: Component doing too much
export default function PortfolioManager({ holdings }) {
  // Handles file upload, display, calculations, and API calls
}
```

#### 2. Prop Drilling vs Context

```javascript
// ✅ GOOD: Use Context for global state
const { holdings, importHoldings } = usePortfolio();

// ❌ BAD: Passing props through many levels
<Parent holdings={holdings}>
  <Child holdings={holdings}>
    <GrandChild holdings={holdings} />
  </Child>
</Parent>
```

#### 3. Performance Optimization

```javascript
// ✅ GOOD: Memoize expensive calculations
const totalValue = useMemo(() => {
  return calculateTotalValue(holdings);
}, [holdings]);

// ✅ GOOD: Memoize callbacks
const handleUpdate = useCallback((newData) => {
  updatePortfolio(newData);
}, [updatePortfolio]);
```

---

## State Management

### Context API Usage

```javascript
// ✅ GOOD: Well-structured context
export const PortfolioProvider = ({ children }) => {
  const [holdings, setHoldings] = useState([]);
  
  // Provide only necessary functions
  const value = {
    holdings,
    importHoldings: (newHoldings) => setHoldings(newHoldings),
    clearPortfolio: () => setHoldings([]),
    hasPortfolio: holdings.length > 0,
  };
  
  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};
```

### State Update Patterns

```javascript
// ✅ GOOD: Immutable state updates
setHoldings(prev => [...prev, newHolding]);
setHoldings(prev => prev.filter(h => h.symbol !== symbol));
setHoldings(prev => prev.map(h => h.symbol === symbol ? { ...h, ...updates } : h));

// ❌ BAD: Mutating state directly
holdings.push(newHolding); // Never mutate state
setHoldings(holdings); // This won't trigger re-render
```

---

## Error Handling

### Error Handling Strategy

```javascript
// ✅ GOOD: Comprehensive error handling
const handleFileUpload = async (file) => {
  setIsLoading(true);
  setError(null);
  
  try {
    const data = await parsePortfolioFile(file);
    importHoldings(data);
  } catch (err) {
    // User-friendly error messages
    const userMessage = err.message || 'Failed to process file. Please try again.';
    setError(userMessage);
    
    // Log for debugging (never log sensitive data)
    console.error('Upload error:', err);
  } finally {
    setIsLoading(false);
  }
};
```

### Error Messages

```javascript
// ✅ GOOD: Clear, actionable error messages
throw new Error('No valid holdings found. Please ensure your file has Symbol and Quantity columns.');

// ❌ BAD: Vague error messages
throw new Error('Invalid data');
```

---

## Testing Requirements

### Manual Testing Checklist

Before committing code, verify:

- [ ] File upload works with Fidelity CSV
- [ ] File upload works with Excel files
- [ ] Dashboard displays all metrics correctly
- [ ] Charts render without errors
- [ ] Calculations are accurate
- [ ] Error handling works (try invalid files)
- [ ] Responsive design works on mobile
- [ ] No console errors in browser
- [ ] LocalStorage persistence works
- [ ] Clear portfolio functionality works

### Test Data

Always test with:
1. **Real broker exports**: Use actual Fidelity/Robinhood files
2. **Edge cases**: Empty files, single holding, 100+ holdings
3. **Invalid data**: Malformed CSV, missing columns
4. **Large files**: Test performance with large portfolios

---

## Performance Guidelines

### Optimization Rules

#### 1. Avoid Unnecessary Re-renders

```javascript
// ✅ GOOD: Memoize components that don't need frequent updates
const MemoizedChart = React.memo(AllocationChart);

// ✅ GOOD: Use useMemo for expensive calculations
const metrics = useMemo(() => ({
  totalValue: calculateTotalValue(holdings),
  totalReturn: calculateTotalReturn(holdings),
  riskScore: calculateRiskScore(holdings),
}), [holdings]);
```

#### 2. Lazy Loading

```javascript
// ✅ GOOD: Lazy load heavy components
const AIRecommendations = lazy(() => import('./AIRecommendations'));

<Suspense fallback={<div>Loading...</div>}>
  <AIRecommendations />
</Suspense>
```

#### 3. Debounce User Input

```javascript
// ✅ GOOD: Debounce search/filter inputs
const debouncedSearch = useMemo(
  () => debounce((value) => setSearchTerm(value), 300),
  []
);
```

---

## Git Workflow

### Commit Messages

Follow conventional commits format:

```
feat: Add support for Robinhood CSV format
fix: Correct gain/loss calculation for fractional shares
docs: Update README with new broker instructions
refactor: Simplify file parser logic
security: Add file size validation
```

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `security/*`: Security updates

### Pre-Commit Checklist

- [ ] Code follows style guidelines
- [ ] No console.log statements (except intentional logging)
- [ ] No commented-out code
- [ ] No API keys or sensitive data
- [ ] All imports are used
- [ ] No linting errors
- [ ] Manual testing completed

---

## Security Audit Checklist

Before deploying:

- [ ] No API keys in code or git history
- [ ] All user inputs are validated
- [ ] File uploads are validated (type, size)
- [ ] No SQL injection vulnerabilities (N/A - no database)
- [ ] No XSS vulnerabilities
- [ ] HTTPS enforced in production
- [ ] Dependencies are up to date
- [ ] No known security vulnerabilities in dependencies

---

## Documentation Requirements

### Code Documentation

```javascript
/**
 * Calculate the total value of all holdings in the portfolio
 * 
 * @param {Array<Object>} holdings - Array of portfolio holdings
 * @param {string} holdings[].symbol - Stock symbol
 * @param {number} holdings[].quantity - Number of shares
 * @param {number} holdings[].currentPrice - Current price per share
 * @returns {number} Total portfolio value in dollars
 * 
 * @example
 * const total = calculateTotalValue([
 *   { symbol: 'AAPL', quantity: 10, currentPrice: 150 },
 *   { symbol: 'GOOGL', quantity: 5, currentPrice: 2800 }
 * ]);
 * // Returns: 15500
 */
export const calculateTotalValue = (holdings) => {
  return holdings.reduce((total, holding) => {
    return total + (holding.quantity * holding.currentPrice);
  }, 0);
};
```

### README Updates

When adding features, update:
- Feature list
- Usage instructions
- Screenshots (if UI changes)
- Broker support list

---

## Deployment Guidelines

### Production Checklist

- [ ] Build succeeds without errors: `npm run build`
- [ ] No console errors in production build
- [ ] Environment variables configured
- [ ] Analytics/monitoring configured (if applicable)
- [ ] Error tracking configured (if applicable)
- [ ] Performance tested with production build
- [ ] Security headers configured
- [ ] HTTPS enabled

### Environment Variables

```bash
# .env.local (never commit this file)
NEXT_PUBLIC_APP_VERSION=1.0.0
# Add other public env vars here
```

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check for dependency updates
- Review open issues
- Test with latest broker export formats

**Monthly:**
- Security audit
- Performance review
- Update documentation

**Quarterly:**
- Major dependency updates
- Feature roadmap review
- User feedback analysis

---

## Contact & Support

For questions or clarifications on these guidelines:
- Review existing code for examples
- Check Next.js documentation
- Consult React best practices

---

**Last Updated**: January 2026
**Version**: 1.0.0
