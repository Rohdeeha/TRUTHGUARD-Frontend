// Inside your Login Submit function in src/pages/LoginPage.tsx:

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const response = await fetch('https://truthguard-api-sut7.onrender.com/api/auth/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // CRITICAL: Store token using the key expected by api.ts
            localStorage.setItem('fact_checker_token', data.access || data.token);
            
            // Redirect to Situation Room Dashboard
            navigate('/dashboard');
        } else {
            console.error('Login failed:', data.detail);
        }
    } catch (err) {
        console.error('Network error during login:', err);
    }
};