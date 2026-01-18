'use client';

import { useRouter } from 'next/navigation';

export default function WelcomePage() {
    const router = useRouter();

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(0, 0, 0, 0) 50%)' }}>
            {/* Hero Section */}
            <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
                <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Hero Content */}
                    <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                        <div
                            style={{
                                width: '160px',
                                height: '160px',
                                margin: '0 auto 48px',
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
                                border: '3px solid var(--primary-purple)',
                                borderRadius: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '6rem',
                                boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)',
                                animation: 'float 3s ease-in-out infinite',
                            }}
                        >
                            📊
                        </div>
                        <h1 style={{
                            marginBottom: '32px',
                            fontSize: '4rem',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-blue) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em',
                            lineHeight: '1.1',
                        }}>
                            Portfolio Manager
                        </h1>
                        <p style={{
                            fontSize: '1.75rem',
                            color: 'var(--text-secondary)',
                            maxWidth: '800px',
                            margin: '0 auto 64px',
                            lineHeight: '1.6',
                            fontWeight: '400',
                        }}>
                            Professional portfolio tracking and AI-powered investment insights
                        </p>

                        {/* CTA Button */}
                        <button
                            onClick={() => router.push('/')}
                            className="btn btn-primary"
                            style={{
                                fontSize: '1.25rem',
                                padding: '20px 48px',
                                background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-blue) 100%)',
                                border: 'none',
                                boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
                                transform: 'scale(1)',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 15px 50px rgba(139, 92, 246, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                e.currentTarget.style.boxShadow = '0 10px 40px rgba(139, 92, 246, 0.4)';
                            }}
                        >
                            Get Started →
                        </button>
                    </div>

                    {/* Key Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '32px',
                        maxWidth: '1000px',
                        margin: '0 auto 80px',
                    }}>
                        {[
                            { icon: '🎯', label: 'Real-time Analytics', value: 'Live Data', desc: 'Track performance instantly' },
                            { icon: '🤖', label: 'AI Insights', value: 'GPT-4 Powered', desc: 'Smart recommendations' },
                            { icon: '📈', label: 'Multi-Portfolio', value: 'Unlimited', desc: 'Manage all accounts' },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="glass-card"
                                style={{
                                    padding: '32px',
                                    textAlign: 'center',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                    animation: `slideUp 0.6s ease-out ${idx * 0.1}s both`,
                                    transition: 'all 0.3s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.borderColor = 'var(--primary-purple)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{stat.icon}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {stat.label}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-purple)', marginBottom: '8px' }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {stat.desc}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Features Grid */}
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        <h2 style={{
                            textAlign: 'center',
                            fontSize: '2.5rem',
                            marginBottom: '64px',
                            fontWeight: '700',
                        }}>
                            Everything You Need
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '32px',
                        }}>
                            {[
                                {
                                    icon: '📊',
                                    title: 'Comprehensive Analytics',
                                    description: 'Track performance, diversification, risk metrics, and tax optimization in real-time with institutional-grade calculations',
                                },
                                {
                                    icon: '🎯',
                                    title: 'AI-Powered Recommendations',
                                    description: 'Get personalized buy, sell, and hold suggestions powered by GPT-4, tailored to your investment goals and risk tolerance',
                                },
                                {
                                    icon: '💰',
                                    title: 'Tax Optimization',
                                    description: 'Identify tax-loss harvesting opportunities, optimize your capital gains strategy, and maximize after-tax returns',
                                },
                                {
                                    icon: '🔄',
                                    title: 'Multi-Portfolio Support',
                                    description: 'Manage unlimited portfolios across different brokers and account types with consolidated or individual views',
                                },
                                {
                                    icon: '📈',
                                    title: 'Risk Management',
                                    description: 'Monitor volatility, beta, Sharpe ratio, and concentration risk with advanced metrics and visual dashboards',
                                },
                                {
                                    icon: '🎨',
                                    title: 'Beautiful Interface',
                                    description: 'Modern, intuitive design with dark mode, glassmorphism effects, and smooth animations for a premium experience',
                                },
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="glass-card"
                                    style={{
                                        padding: '40px',
                                        textAlign: 'center',
                                        transition: 'all 0.3s ease',
                                        cursor: 'default',
                                        animation: `slideUp 0.6s ease-out ${0.2 + idx * 0.1}s both`,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{
                                        fontSize: '4rem',
                                        marginBottom: '24px',
                                        filter: 'drop-shadow(0 4px 8px rgba(139, 92, 246, 0.3))',
                                    }}>
                                        {feature.icon}
                                    </div>
                                    <h3 style={{
                                        fontSize: '1.5rem',
                                        marginBottom: '16px',
                                        fontWeight: '700',
                                    }}>
                                        {feature.title}
                                    </h3>
                                    <p style={{
                                        color: 'var(--text-secondary)',
                                        lineHeight: '1.7',
                                        fontSize: '1rem',
                                    }}>
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <div style={{ textAlign: 'center', marginTop: '100px' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '24px', fontWeight: '700' }}>
                            Ready to optimize your portfolio?
                        </h2>
                        <button
                            onClick={() => router.push('/')}
                            className="btn btn-primary"
                            style={{
                                fontSize: '1.25rem',
                                padding: '20px 48px',
                                background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-blue) 100%)',
                                border: 'none',
                                boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)',
                            }}
                        >
                            Get Started →
                        </button>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
