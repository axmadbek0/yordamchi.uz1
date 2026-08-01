/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Heart, Eye, EyeOff, ShieldAlert, ArrowLeft } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'parent' | 'teacher'>('parent');
  const [schoolNumber, setSchoolNumber] = useState('12');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill — seed bilan bir xil parol
  const fillCredentials = (type: 'parent' | 'teacher') => {
    if (type === 'parent') {
      setRole('parent');
      setSchoolNumber('12');
      setUsername('12_001');
      setPassword('123456');
    } else {
      setRole('teacher');
      setSchoolNumber('12');
      setUsername('umumi');
      setPassword('123456');
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!schoolNumber || isNaN(Number(schoolNumber))) {
      setError('Maktab raqami to‘g‘ri kiritilishi shart (faqat raqam).');
      return;
    }
    if (!username) {
      setError('Login maydoni majburiy.');
      return;
    }
    if (!password) {
      setError('Parol maydoni majburiy.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(role, Number(schoolNumber), username, password);
      if (result.ok) {
        // Backend dagi haqiqiy rol bo'yicha yo'naltirish (UI dagi role faqat UX)
        const stored = localStorage.getItem('yordamchi_auth_user');
        const parsed = stored ? (JSON.parse(stored) as { role?: string }) : null;
        const actualRole = parsed?.role || role;

        if (actualRole === 'parent') {
          navigate('/parent/reports');
        } else {
          navigate('/teacher/class');
        }
      } else {
        setError(result.error || 'Login yoki parol xato! Iltimos, tekshirib qayta kiriting.');
      }
    } catch {
      setError('Tizimga ulanishda xatolik yuz berdi. Iltimos qayta urining.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-bg relative">
      {/* Go Back button */}
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-deep font-semibold hover:text-primary transition-all text-sm">
          <ArrowLeft className="w-4 h-4" />
          Bosh sahifaga qaytish
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo brand */}
          <div className="flex flex-col items-center gap-2 mb-6 text-center">
            <div className="bg-primary text-white rounded-full p-3 shadow-lg shadow-primary/25">
              <Heart className="w-8 h-8 animate-pulse" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-black text-deep font-serif">
              YORDAMCHI <span className="text-red-500 text-sm lowercase">med</span>
            </h1>
            <p className="text-sm text-muted">
              Ijtimoiy himoya va maktab-internat hamkorlik tizimi
            </p>
          </div>

          <Card variant="white" className="p-8 shadow-xl border border-primary/5">
            {/* Role segmented toggle */}
            <div className="flex bg-bg rounded-full p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setRole('parent');
                  setError('');
                }}
                className={`flex-1 py-3 text-base font-bold rounded-full transition-all cursor-pointer ${
                  role === 'parent' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-deep'
                }`}
              >
                Ota-ona roli
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('teacher');
                  setError('');
                }}
                className={`flex-1 py-3 text-base font-bold rounded-full transition-all cursor-pointer ${
                  role === 'teacher' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-deep'
                }`}
              >
                O‘qituvchi roli
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Form errors */}
              {error && (
                <div className="bg-coral/10 text-coral border border-coral/20 p-4 rounded-xl flex items-start gap-3 text-sm font-semibold">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* School code */}
              <Input
                label="Maktab raqami"
                type="number"
                placeholder="Masalan: 12"
                value={schoolNumber}
                onChange={(e) => setSchoolNumber(e.target.value)}
                required
              />

              {/* Login */}
              <Input
                label="Login"
                type="text"
                placeholder={role === 'parent' ? 'Masalan: 12_001' : 'Masalan: umumi'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              {/* Password wrapper with eye toggle */}
              <div className="relative">
                <Input
                  label="Parol"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
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

              {/* Quick credentials helper for test */}
              <div className="bg-bg/50 rounded-xl p-3 border border-primary/10 mt-2">
                <p className="text-[11px] font-bold text-deep uppercase tracking-wider mb-2">Tezkor kirish (Sinov uchun):</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fillCredentials('parent')}
                    className="flex-1 text-[11px] font-semibold bg-white border border-primary/10 hover:bg-primary/5 py-1 px-2 rounded-lg text-primary transition-all cursor-pointer"
                  >
                    Ota-ona loginini to‘ldirish
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('teacher')}
                    className="flex-1 text-[11px] font-semibold bg-white border border-primary/10 hover:bg-primary/5 py-1 px-2 rounded-lg text-coral transition-all cursor-pointer"
                  >
                    O‘qituvchi loginini to‘ldirish
                  </button>
                </div>
              </div>

              <Button variant="primary" size="lg" fullWidth type="submit" disabled={isLoading} className="mt-4">
                {isLoading ? 'Yuklanmoqda...' : 'Kirish'}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted">
        © 2026 Yordamchi med. Maxsus ehtiyojli bolalar va ularning ota-onalari uchun yordamchi platforma.
      </footer>
    </div>
  );
}
