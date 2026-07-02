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
    <div className="min-h-screen flex w-full bg-[#F2F9F8]">
      {/* Left Column (Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-white">
        <div className="w-full max-w-md p-8 z-10">
          <div className="text-center mb-8 lg:hidden">
            <span className="font-sans text-primary font-bold text-2xl tracking-wider">[ ASF ]</span>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary mt-2">Sign in to your account</h1>
            <p className="text-text-secondary mt-2">Welcome back! Please enter your details.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-status-notImplementedBg border border-status-notImplemented rounded-lg text-sm text-status-notImplemented">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 mt-2 shadow-lg shadow-primary/25"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-primary-hover transition-colors font-semibold">
              Sign up
            </Link>
          </p>
        </div>

        {/* The Zig-Zag Divider */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-12 translate-x-full z-20 pointer-events-none hidden lg:block"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='256' viewBox='0 0 48 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L25 25 L8 50 L40 85 L15 125 L48 160 L10 200 L30 230 L0 256 Z' fill='%23ffffff'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-y',
            backgroundPosition: 'left center',
          }}
        />
      </div>

      {/* Right Column (Branding) */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-12 relative overflow-hidden">
        {/* Background Blobs for Glassmorphism depth */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary-dark/20 blur-[120px] pointer-events-none" />
        
        <div className="max-w-lg text-center relative z-10">
          <div className="mb-10 flex justify-center">
             <span className="font-sans text-primary font-bold text-7xl tracking-widest">[ ASF ]</span>
          </div>
          <h2 className="text-4xl font-bold text-text-primary mb-6">AI Security Framework</h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            A comprehensive solution for managing and tracking your AI security controls, capabilities, and compliance evidence. Ensure your AI deployments are secure, compliant, and transparent.
          </p>
        </div>
      </div>
    </div>
  );
};
