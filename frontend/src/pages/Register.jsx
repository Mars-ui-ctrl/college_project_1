import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useModal } from '../contexts/ModalContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showAlert } = useModal();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return;

    // Email format validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await showAlert('Please enter a valid email address.', 'Invalid Email');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(username, email, password);
      navigate('/'); // redirect to dashboard
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-heading font-extrabold text-xl text-white mb-1">Create Account</h2>
        <p className="text-slate-400 text-xs">Join Research Nexus today</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">USERNAME</label>
          <input
            type="text"
            required
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-brand-primary text-sm text-slate-100 placeholder:text-slate-600 transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">EMAIL ADDRESS</label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-brand-primary text-sm text-slate-100 placeholder:text-slate-600 transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">PASSWORD</label>
          <input
            type="password"
            required
            autoComplete="new-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:outline-none focus:border-brand-primary text-sm text-slate-100 placeholder:text-slate-650 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !username || !email || !password}
          className="w-full py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-xl font-heading text-sm font-bold shadow-lg shadow-brand-primary/20 hover:opacity-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-secondary hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
