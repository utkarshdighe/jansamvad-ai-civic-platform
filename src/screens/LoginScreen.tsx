import { useState } from 'react';
import {
  Building2, User, Shield, HardHat, Megaphone, ArrowRight, Mail, Lock, UserPlus,
  LogIn, AlertCircle, CheckCircle2, Phone,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { validateEmail, validateMobile } from '@/lib/auth';

type Mode = 'signin' | 'signup';

interface FieldErrors {
  name?: string;
  mobile?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export default function LoginScreen() {
  const { signIn, signUp, toast } = useStore();
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>('signin');

  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');

  const [suName, setSuName] = useState('');
  const [suMobile, setSuMobile] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!siEmail.trim() || !siPassword) {
      setError(t('auth.errEmailPass'));
      return;
    }
    const result = await signIn(siEmail.trim(), siPassword);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast(t('auth.signedInAs', { name: result.user.name }), 'success');
  };

  const validateSignUp = (): boolean => {
    const errs: FieldErrors = {};
    if (!suName.trim()) {
      errs.name = t('auth.errNameReq');
    } else if (suName.trim().length < 2) {
      errs.name = t('auth.errNameMin');
    }
    if (!suMobile.trim()) {
      errs.mobile = t('auth.errMobileReq');
    } else if (!validateMobile(suMobile.trim())) {
      errs.mobile = t('auth.errMobileInvalid');
    }
    if (!suEmail.trim()) {
      errs.email = t('auth.errEmailReq');
    } else if (!validateEmail(suEmail.trim())) {
      errs.email = t('auth.errEmailInvalid');
    }
    if (!suPassword) {
      errs.password = t('auth.errPassReq');
    } else if (suPassword.length < 8) {
      errs.password = t('auth.errPassMin');
    }
    if (!suConfirm) {
      errs.confirm = t('auth.errConfirmReq');
    } else if (suPassword !== suConfirm) {
      errs.confirm = t('auth.errPassMatch');
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});
    if (!validateSignUp()) return;
    const result = await signUp(suName.trim(), suEmail.trim(), suPassword, 'citizen', suMobile.trim());
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(t('auth.successCreate'));
    setSuName('');
    setSuMobile('');
    setSuEmail('');
    setSuPassword('');
    setSuConfirm('');
    setMode('signin');
    setSiEmail(suEmail.trim());
    toast(t('auth.accountCreated'), 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('app.name')}</h1>
              <p className="text-sm text-gray-500">{t('app.tagline')}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            {t('app.desc')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
            <button
              onClick={() => switchMode('signin')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LogIn className="w-4 h-4" /> {t('auth.signin')}
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus className="w-4 h-4" /> {t('auth.signup')}
            </button>
          </div>

          {/* Error / Success banners */}
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm text-emerald-700">{success}</p>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{t('auth.email')}</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={siEmail}
                    onChange={(e) => setSiEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">{t('auth.password')}</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={siPassword}
                    onChange={(e) => setSiPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-medium text-sm hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
              >
                {t('auth.signin')} <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-sm text-gray-500">
                {t('auth.noAccount')}{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-blue-600 font-medium hover:underline">
                  {t('auth.signup')}
                </button>
              </p>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">{t('auth.fullNameReq')}</label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={suName}
                    onChange={(e) => setSuName(e.target.value)}
                    placeholder={t('auth.namePlaceholder')}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      fieldErrors.name ? 'border-rose-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {fieldErrors.name && <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">{t('auth.mobileReq')}</label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={suMobile}
                    onChange={(e) => setSuMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder={t('auth.mobilePlaceholder')}
                    maxLength={10}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      fieldErrors.mobile ? 'border-rose-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {fieldErrors.mobile && <p className="mt-1 text-xs text-rose-600">{fieldErrors.mobile}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">{t('auth.emailReq')}</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={suEmail}
                    onChange={(e) => setSuEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      fieldErrors.email ? 'border-rose-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {fieldErrors.email && <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">{t('auth.passwordReq')}</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={suPassword}
                    onChange={(e) => setSuPassword(e.target.value)}
                    placeholder={t('auth.passwordMin')}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      fieldErrors.password ? 'border-rose-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {fieldErrors.password && <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">{t('auth.confirmReq')}</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={suConfirm}
                    onChange={(e) => setSuConfirm(e.target.value)}
                    placeholder={t('auth.confirmPlaceholder')}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      fieldErrors.confirm ? 'border-rose-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {fieldErrors.confirm && <p className="mt-1 text-xs text-rose-600">{fieldErrors.confirm}</p>}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-medium text-sm hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
              >
                {t('auth.signup')} <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-sm text-gray-500">
                {t('auth.haveAccount')}{' '}
                <button type="button" onClick={() => switchMode('signin')} className="text-blue-600 font-medium hover:underline">
                  {t('auth.signin')}
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          {t('app.prototype')}
        </p>
      </div>
    </div>
  );
}
