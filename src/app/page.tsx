export default function HomePage() {
    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: '#000',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                fontFamily: 'system-ui, sans-serif',
            }}
        >
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>SecPilot</h1>
            <p style={{ fontSize: '1.2rem', textAlign: 'center', maxWidth: '600px' }}>
                AI-Powered Email Security Software - Advanced threat protection for businesses
            </p>
            <div style={{ marginTop: '2rem' }}>
                <a
                    href='/login'
                    style={{
                        backgroundColor: '#22c55e',
                        color: 'white',
                        padding: '12px 24px',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        marginRight: '1rem',
                    }}
                >
                    Login
                </a>
                <a
                    href='/register'
                    style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        padding: '12px 24px',
                        textDecoration: 'none',
                        border: '1px solid #374151',
                        borderRadius: '6px',
                    }}
                >
                    Register
                </a>
            </div>
        </div>
    );
}
