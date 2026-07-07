import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Mail, Shield, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/shared/Logo';
import { validateInviteToken, acceptInvite } from '../api/index';

export const AcceptInvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { activateAccount } = useAuth();

  // Invite data fetched from backend
  const [inviteData, setInviteData] = useState(null);
  const [tokenStatus, setTokenStatus] = useState('loading'); // loading | valid | invalid
  const [tokenError, setTokenError] = useState('');

  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ─── Validate token on mount ───────────────────────────────────────────────
  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await validateInviteToken(token);
        setInviteData(res.data.data);
        setTokenStatus('valid');
      } catch (err) {
        const msg = err.response?.data?.error || 'This invite link is invalid or has expired.';
        const code = err.response?.data?.code;
        if (code === 'ALREADY_ACCEPTED') {
          setTokenError('This invite has already been accepted. Please log in.');
        } else {
          setTokenError(msg);
        }
        setTokenStatus('invalid');
      }
    };
    checkToken();
  }, [token]);

  // ─── Client-side validation ────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!password) errors.password = 'Password is required';
    else if (password.length < 8) errors.password = 'Must be at least 8 characters';
    else if (!/[A-Z]/.test(password)) errors.password = 'Must contain at least one uppercase letter';
    else if (!/[0-9]/.test(password)) errors.password = 'Must contain at least one number';

    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    return errors;
  };

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await acceptInvite(token, password);
      const { token: jwt, user } = res.data.data;
      activateAccount(jwt, user);
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to activate account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Role badge helper ─────────────────────────────────────────────────────
  const RoleBadge = ({ role }) => (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
      ${role === 'admin'
        ? 'bg-[#EDE9FC] text-[#6D4AC8]'
        : 'bg-[#E6F7F5] text-[#007A68]'}`}>
      <Shield size={12} />
      {role === 'admin' ? 'Administrator' : 'User'}
    </span>
  );

  // ─── Render: loading ───────────────────────────────────────────────────────
  if (tokenStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F9F8]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-[#00B097]" />
          <p className="text-[#64748B] text-sm">Validating invite link…</p>
        </div>
      </div>
    );
  }

  // ─── Render: invalid token ─────────────────────────────────────────────────
  if (tokenStatus === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F9F8] p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-[#0D1514] mb-2">Invite Link Invalid</h1>
          <p className="text-[#64748B] text-sm mb-6 leading-relaxed">{tokenError}</p>
          <Link
            to="/login"
            className="inline-block bg-[#00B097] text-white px-6 py-3 rounded-xl font-semibold text-sm
                       hover:bg-[#009B85] transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // ─── Render: valid — show form ─────────────────────────────────────────────
  return (
    <div className="min-h-screen flex w-full bg-[#F2F9F8]">
      {/* Left: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white relative">
        <div className="w-full max-w-md p-8 z-10">
          {/* Logo (mobile) */}
          <div className="text-center mb-8 lg:hidden flex justify-center">
            <Logo className="w-12 h-12" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 bg-[#E6F7F5] rounded-full mx-auto mb-4">
              <Lock size={24} className="text-[#00B097]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0D1514] mb-1">Set Your Password</h1>
            <p className="text-[#64748B] text-sm">Complete your account setup below</p>
          </div>

          {/* Locked identity fields */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 mb-6 space-y-3">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">Your Account Details</p>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg shrink-0">
                <User size={14} className="text-[#94A3B8]" />
              </div>
              <div>
                <p className="text-xs text-[#94A3B8]">Full Name</p>
                <p className="text-sm font-medium text-[#334155]">{inviteData?.fullName}</p>
              </div>
              <Lock size={12} className="text-[#CBD5E1] ml-auto" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg shrink-0">
                <Mail size={14} className="text-[#94A3B8]" />
              </div>
              <div>
                <p className="text-xs text-[#94A3B8]">Email</p>
                <p className="text-sm font-medium text-[#334155]">{inviteData?.email}</p>
              </div>
              <Lock size={12} className="text-[#CBD5E1] ml-auto" />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-white border border-[#E2E8F0] rounded-lg shrink-0">
                <Shield size={14} className="text-[#94A3B8]" />
              </div>
              <div>
                <p className="text-xs text-[#94A3B8] mb-0.5">Role</p>
                <RoleBadge role={inviteData?.role} />
              </div>
              <Lock size={12} className="text-[#CBD5E1] ml-auto" />
            </div>
          </div>

          {/* Password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none transition-all
                    ${fieldErrors.password
                      ? 'border-red-400 focus:border-red-500 bg-red-50'
                      : 'border-[#E2E8F0] focus:border-[#00B097] focus:ring-2 focus:ring-[#00B097]/10'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1.5">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: '' })); }}
                  placeholder="Repeat your password"
                  className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none transition-all
                    ${fieldErrors.confirmPassword
                      ? 'border-red-400 focus:border-red-500 bg-red-50'
                      : 'border-[#E2E8F0] focus:border-[#00B097] focus:ring-2 focus:ring-[#00B097]/10'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={11} /> {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Global form error */}
            {formError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#00B097] hover:bg-[#009B85] disabled:opacity-60 disabled:cursor-not-allowed
                         text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Activating…</> : 'Activate Account'}
            </button>
          </form>

          <p className="text-center text-[#94A3B8] text-xs mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00B097] hover:underline font-medium">Sign in</Link>
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
             <Logo className="w-28 h-28" />
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
