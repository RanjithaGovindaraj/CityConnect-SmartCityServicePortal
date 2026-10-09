import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialRole?: UserRole;
  users: User[];
  onRegisterUser?: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'citizen',
  users,
  onRegisterUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wardNo, setWardNo] = useState('Ward 24 (RS Puram)');
  const [forgotSent, setForgotSent] = useState(false);

  // FIX: This hook must be declared before the conditional return
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);

  // FIXED: All hooks are now called before this return
  if (!isOpen) return null;

  const handleDemoLogin = async (role: UserRole) => {
    setIsAuthProcessing(true);

    try {
      const demoEmail =
        role === 'citizen'
          ? 'citizen@coimbatore.gov.in'
          : role === 'employee'
            ? 'employee@coimbatore.gov.in'
            : 'admin@coimbatore.gov.in';

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoEmail,
          password: 'password123',
          role,
        }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem('cityconnect_jwt_token', data.token);
      }

      if (data.user) {
        onLoginSuccess(data.user);
      } else {
        const found = users.find((u) => u.role === role);

        if (found) {
          onLoginSuccess(found);
        }
      }

      onClose();
    } catch (err) {
      const found = users.find((u) => u.role === role);

      if (found) {
        onLoginSuccess(found);
      }

      onClose();
    } finally {
      setIsAuthProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'forgot') {
      setForgotSent(true);
      setTimeout(() => {
        setForgotSent(false);
        setActiveTab('login');
      }, 3000);
      return;
    }

    setIsAuthProcessing(true);

    const enteredEmail = email.trim().toLowerCase();
    const defaultDemoEmail =
      selectedRole === 'citizen'
        ? 'citizen@coimbatore.gov.in'
        : selectedRole === 'employee'
          ? 'employee@coimbatore.gov.in'
          : 'admin@coimbatore.gov.in';

    const targetEmail = enteredEmail || defaultDemoEmail;

    try {
      if (activeTab === 'register') {
        const registeredUser: User = {
          id: `usr-${Date.now()}`,
          name: name.trim() || 'Registered Citizen',
          email: targetEmail,
          phone: phone.trim() || '9842212345',
          role: 'citizen',
          wardNo: wardNo || 'Ward 24 (RS Puram)',
          active: true,
        };

        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: registeredUser.name,
              email: registeredUser.email,
              phone: registeredUser.phone,
              password,
              wardNo: registeredUser.wardNo,
            }),
          });

          const data = await res.json();
          if (data.token) {
            localStorage.setItem('cityconnect_jwt_token', data.token);
          }

          const finalUser = data.user || registeredUser;
          if (onRegisterUser) onRegisterUser(finalUser);
          onLoginSuccess(finalUser);
        } catch (err) {
          if (onRegisterUser) onRegisterUser(registeredUser);
          onLoginSuccess(registeredUser);
        }
      } else {
        // LOGIN FLOW
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: targetEmail,
              password,
              role: selectedRole,
            }),
          });

          const data = await res.json();
          if (data.token) {
            localStorage.setItem('cityconnect_jwt_token', data.token);
          }

          if (data.user && data.user.email) {
            onLoginSuccess(data.user);
            onClose();
            return;
          }
        } catch (err) {
          console.warn('API Login offline, attempting local login matching:', err);
        }

        // Match by exact email if entered
        if (enteredEmail) {
          const foundByEmail = users.find((u) => u.email.toLowerCase() === enteredEmail);
          if (foundByEmail) {
            onLoginSuccess(foundByEmail);
            onClose();
            return;
          }
        }

        // Check if matching demo email
        const foundDemo = users.find(
          (u) =>
            u.role === selectedRole &&
            (u.email.toLowerCase() === targetEmail.toLowerCase() ||
              targetEmail.includes('coimbatore.gov.in'))
        );

        if (foundDemo) {
          onLoginSuccess(foundDemo);
        } else {
          const fallbackUser: User = {
            id: `usr-${Date.now()}`,
            name: enteredEmail ? enteredEmail.split('@')[0] : 'User',
            email: targetEmail,
            phone: '9842212345',
            role: selectedRole,
            wardNo: 'Ward 24 (RS Puram)',
            active: true,
          };
          if (onRegisterUser) onRegisterUser(fallbackUser);
          onLoginSuccess(fallbackUser);
        }
      }
      onClose();
    } finally {
      setIsAuthProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/90 overflow-hidden my-8">

        {/* Header */}
        <div className="bg-[#0B2144] text-white p-5 flex items-center justify-between border-b border-blue-900/60">
          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <i className="fa-solid fa-shield-halved text-lg"></i>
            </div>

            <div>
              <h3 className="font-bold text-base text-white font-poppins">
                {activeTab === 'login'
                  ? 'CityConnect Portal Login'
                  : activeTab === 'register'
                    ? 'Citizen Registration'
                    : 'Reset Password'}
              </h3>

              <p className="text-xs text-slate-300">
                Coimbatore Smart City Authentication
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* 1-Click Demo Login Shortcuts */}
        {activeTab === 'login' && (
          <div className="p-4 bg-slate-50 border-b border-slate-200">

            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Instant Demo Logins</span>
              <span className="text-[10px] text-blue-600 font-semibold">
                Select Role
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">

              {/* Citizen */}
              <button
                type="button"
                onClick={() => handleDemoLogin('citizen')}
                className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition text-center"
              >
                <i className="fa-solid fa-user text-blue-600 block mb-1"></i>
                Citizen
              </button>

              {/* Employee */}
              <button
                type="button"
                onClick={() => handleDemoLogin('employee')}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition text-center"
              >
                <i className="fa-solid fa-user-gear text-amber-600 block mb-1"></i>
                Employee
              </button>

              {/* Admin */}
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold transition text-center"
              >
                <i className="fa-solid fa-user-shield text-teal-600 block mb-1"></i>
                Admin
              </button>

            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Target Role */}
          {activeTab === 'login' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Role
              </label>

              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                {(['citizen', 'employee', 'admin'] as UserRole[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setSelectedRole(r)}
                    className={`py-1.5 text-xs font-bold rounded-lg capitalize transition ${selectedRole === r
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Registration Fields */}
          {activeTab === 'register' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Karthik Subramanian"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98422 12345"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
                />
              </div>

              {/* Ward Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Coimbatore Ward Location
                </label>

                <select
                  value={wardNo}
                  onChange={(e) => setWardNo(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium bg-white"
                >
                  <option value="Ward 24 (RS Puram)">
                    Ward 24 (RS Puram)
                  </option>

                  <option value="Ward 32 (Gandhipuram)">
                    Ward 32 (Gandhipuram)
                  </option>

                  <option value="Ward 58 (Singanallur)">
                    Ward 58 (Singanallur)
                  </option>

                  <option value="Ward 12 (Town Hall)">
                    Ward 12 (Town Hall)
                  </option>

                  <option value="Ward 72 (Peelamedu)">
                    Ward 72 (Peelamedu)
                  </option>
                </select>
              </div>
            </>
          )}

          {/* Email */}
          {forgotSent ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-emerald-600 text-base"></i>
              Password reset link sent to registered email/phone!
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address / Mobile Number
              </label>

              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  selectedRole === 'citizen'
                    ? 'citizen@coimbatore.gov.in'
                    : selectedRole === 'employee'
                      ? 'employee@coimbatore.gov.in'
                      : 'admin@coimbatore.gov.in'
                }
                className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
              />

              <span className="text-[10px] text-slate-400 mt-1 block">
                Leave blank to use default {selectedRole} demo account
              </span>
            </div>
          )}

          {/* Password */}
          {activeTab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">

                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                >
                  Forgot Password?
                </button>

              </div>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAuthProcessing}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {isAuthProcessing ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                Authenticating...
              </>
            ) : activeTab === 'login' ? (
              `Login as ${selectedRole.toUpperCase()}`
            ) : activeTab === 'register' ? (
              'Register Citizen Account'
            ) : (
              'Send Reset Link'
            )}
          </button>

          {/* Footer Links */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">

            {activeTab === 'login' ? (
              <>
                <span>New to CityConnect?</span>

                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="font-bold text-blue-600 hover:text-blue-700"
                >
                  Create Register Link
                </button>
              </>
            ) : (
              <>
                <span>Already have an account?</span>

                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="font-bold text-blue-600 hover:text-blue-700"
                >
                  Back to Login
                </button>
              </>
            )}

          </div>

        </form>
      </div>
    </div>
  );
};