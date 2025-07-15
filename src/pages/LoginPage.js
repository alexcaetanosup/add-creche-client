import React, { useState } from 'react';

const LoginPage = ({ supabase, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            setError(error.message);
        } else if (data.user) {
            // A prop 'onLogin' não existe mais no App.js atual,
            // pois o listener de autenticação cuida disso automaticamente.
            // Podemos remover a chamada para onLogin.
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Sistema de Cobranças</h1>
                <p>Por favor, faça o login para continuar.</p>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;