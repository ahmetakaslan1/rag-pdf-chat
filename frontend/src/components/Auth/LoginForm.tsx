import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, Lock, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 glass-panel rounded-2xl border border-color flex flex-col gap-6 animate-slide-up">
      <div className="text-center space-y-2">
        <div className="inline-flex bg-primary/15 p-3 rounded-full text-primary">
          <Sparkles size={24} />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">Giriş Yap</h2>
        <p className="text-sm text-muted">RAG AI Chat sistemine güvenli giriş</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 text-error rounded-xl text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-xs font-semibold text-text-secondary">E-POSTA ADRESİ</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10"
              placeholder="isim@adres.com"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 relative">
          <label className="text-xs font-semibold text-text-secondary">ŞİFRE</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10"
              style={{ paddingRight: '2.75rem' }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary transition-all"
              tabIndex={-1}
              title={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 rounded-xl font-semibold mt-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Giriş Yap'}
        </button>
      </form>

      <div className="text-center text-sm text-text-secondary flex flex-col gap-4">
        <div>
          Hesabınız yok mu?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Kayıt Olun
          </Link>
        </div>
        <div className="border-t border-color pt-4">
          <Link to="/" className="text-muted hover:text-text-primary transition-colors text-xs font-semibold uppercase tracking-wider">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
};
