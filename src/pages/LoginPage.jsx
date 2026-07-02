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
      <div className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/40 shadow-glass rounded-2xl p-8">
        <div className="text-center mb-8">
          <span className="font-sans text-primary font-bold text-2xl tracking-wider">[ ASF ]</span>
          <h1 className="text-xl  text-text-primary mt-2">Sign in to your account</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-status-notImplementedBg border border-status-notImplemented rounded text-sm text-status-notImplemented">
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
              className="w-full bg-white/70 backdrop-blur-sm border border-white/50 rounded-lg px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,176,151,0.2)] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/70 backdrop-blur-sm border border-white/50 rounded-lg px-3 py-2.5 text-text-primary focus:outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,176,151,0.2)] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-text-onPrimary font-semibold py-2.5 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-text-muted text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:text-primary-hover transition-colors font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
