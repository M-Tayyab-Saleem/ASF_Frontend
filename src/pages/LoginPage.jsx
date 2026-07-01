import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-surface-1 border border-border rounded-lg p-8">
        <div className="text-center mb-8">
          <span className="font-mono text-gold font-bold text-2xl tracking-wider">[ ASF ]</span>
          <h1 className="text-xl font-light text-text-primary mt-2">Sign in to your account</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#8A5A5A]/10 border border-[#8A5A5A]/30 rounded text-sm text-[#8A5A5A]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-gold transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-border rounded px-3 py-2 text-text-primary focus:outline-none focus:border-gold transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-black font-medium py-2 rounded hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-text-muted text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-gold hover:text-gold-light transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
