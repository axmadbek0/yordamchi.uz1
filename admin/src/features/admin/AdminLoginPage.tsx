/**
 * Super-Admin Login Page
 * Minimal, professional — no school number field
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Shield, Eye, EyeOff, ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email maydoni majburiy.');
      return;
    }
    if (!password) {
      setError('Parol maydoni majburiy.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login('super_admin', 0, email.trim(), password);
      if (success) {
        navigate('/admin/dashboard');
      } else {
        setError('Email yoki parol xato! Iltimos, tekshirib qayta kiriting.');
      }
    } catch {
      setError('Tizimga ulanishda xatolik yuz berdi. Iltimos qayta urining.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-bg relative">
      {/* Go Back */}
      <div className="p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-deep font-semibold hover:text-primary transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Bosh sahifaga qaytish
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo & brand */}
          <div className="flex flex-col items-center gap-2 mb-6 text-center">
            <div className="bg-deep text-white rounded-2xl p-3.5 shadow-lg shadow-deep/25">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-deep font-serif">
              YORDAMCHI<span className="text-coral">.MED</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-deep text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
              <Shield className="w-3 h-3" />
              SUPER-ADMIN
            </span>
          </div>

          <Card variant="white" className="p-8 shadow-xl border border-primary/5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-coral/10 text-coral border border-coral/20 p-4 rounded-xl flex items-start gap-3 text-sm font-semibold"
                >
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Email */}
              <Input
                label="Email"
                type="email"
                placeholder="Emailingizni kiriting"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Password with eye toggle */}
              <div className="relative">
                <Input
                  label="Parol"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[44px] text-primary/70 hover:text-primary cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button variant="primary" size="lg" fullWidth type="submit" disabled={isLoading} className="mt-4 !bg-deep hover:!bg-deep/90">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Tekshirilmoqda...
                  </span>
                ) : (
                  'Kirish'
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted">
        © 2026 Yordamchi.med — Super-Admin boshqaruv paneli
      </footer>
    </div>
  );
}
