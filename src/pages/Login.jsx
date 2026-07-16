// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp, Mail, Lock, Eye, EyeOff,
  ArrowRight, ExternalLink, Home
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    }
  };

  // 🆕 Common input style — forced equal
  const inputStyle = {
    width: '100%',
    padding: '14px 14px 14px 44px',
    fontSize: '15px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '12px',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    color: '#1f2937',
  };

  const inputFocusStyle = {
    borderColor: '#9333ea',
    boxShadow: '0 0 0 3px rgba(147, 51, 234, 0.1)',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4 relative">

      {/* Top-Right: Public Enquiry Link */}
      <a
        href="/enquiry"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 right-6 z-10 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border border-white/30 shadow-lg group"
      >
        <Home size={16} />
        <span className="hidden sm:inline">New Enquiry?</span>
        <span className="sm:hidden">Enquiry</span>
        <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </a>

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <TrendingUp className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white">VRN INC.</h1>
          <p className="text-primary-200 mt-1">Sales CRM Portal</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-6">Please sign in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* 🆕 Email — Forced Styling */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '18px',
                    height: '18px',
                    color: '#9ca3af',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vrn.com"
                  required
                  disabled={loading}
                  style={inputStyle}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* 🆕 Password — Forced Styling */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '18px',
                    height: '18px',
                    color: '#9ca3af',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={(e) => Object.assign(e.target.style, { ...inputFocusStyle, paddingRight: '44px' })}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '700',
                color: 'white',
                background: 'linear-gradient(to right, #9333ea, #6366f1)',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 10px 15px -3px rgba(147, 51, 234, 0.3)',
                transition: 'all 0.2s',
                marginTop: '8px',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.background = 'linear-gradient(to right, #7e22ce, #4f46e5)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.background = 'linear-gradient(to right, #9333ea, #6366f1)';
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-500 font-semibold uppercase tracking-wider">
                Or
              </span>
            </div>
          </div>

          {/* Public Enquiry CTA */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-2xl">🏡</span>
              <p className="text-sm font-bold text-gray-800">
                Are you a customer?
              </p>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Submit your property enquiry directly, no login needed
            </p>
            <a
              href="/enquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-md group"
            >
              Open Enquiry Form
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            © 2026 VRN INC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;