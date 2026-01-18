'use client';

import { useRouter, usePathname } from 'next/navigation';
import { usePortfolio } from '../context/PortfolioContext';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    // Safely try to get portfolios, default to empty array if context not available
    let portfolios = [];
    try {
        const context = usePortfolio();
        portfolios = context.portfolios || [];
    } catch (error) {
        // Context not available, use default empty array
    }

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                background: 'rgba(10, 10, 15, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--glass-border)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
        >
            <div className="container" style={{ padding: '16px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Logo */}
                    <button
                        onClick={() => router.push('/welcome')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                        }}
                    >
                        <div style={{ fontSize: '2rem' }}>📊</div>
                        <div>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-blue) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                Portfolio Manager
                            </div>
                        </div>
                    </button>

                    {/* Navigation Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Welcome Link */}
                        <button
                            onClick={() => router.push('/welcome')}
                            className="btn btn-secondary"
                            style={{
                                background: pathname === '/welcome' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                border: pathname === '/welcome' ? '1px solid var(--primary-purple)' : '1px solid transparent',
                                color: pathname === '/welcome' ? 'var(--primary-purple)' : 'var(--text-secondary)',
                            }}
                        >
                            Welcome
                        </button>

                        {/* Dashboard Link - Only show if portfolios exist */}
                        {portfolios && portfolios.length > 0 && (
                            <button
                                onClick={() => router.push('/')}
                                className="btn btn-secondary"
                                style={{
                                    background: pathname === '/' ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                    border: pathname === '/' ? '1px solid var(--primary-purple)' : '1px solid transparent',
                                    color: pathname === '/' ? 'var(--primary-purple)' : 'var(--text-secondary)',
                                }}
                            >
                                Dashboard
                            </button>
                        )}

                        {/* Get Started Button - Only on welcome page */}
                        {pathname === '/welcome' && (
                            <button
                                onClick={() => router.push('/')}
                                className="btn btn-primary"
                                style={{
                                    background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-blue) 100%)',
                                    border: 'none',
                                    marginLeft: '8px',
                                }}
                            >
                                Get Started →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
