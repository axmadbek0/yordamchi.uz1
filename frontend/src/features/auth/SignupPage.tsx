import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../lib/auth';
import { Card } from '../../components/ui/Card';
import { Heart, ArrowLeft, ShieldAlert } from 'lucide-react';

export function SignupPage() {
  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Tarmoqda xatolik yuz berdi');
      }

      // Automatically login the user
      localStorage.setItem('yordamchi_token', data.token);
      setToken(data.token);
      setUser(data.user);
      
      if (data.user.role === 'PARENT') {
        navigate('/parent/reports');
      } else {
        navigate('/teacher/class');
      }
    } catch (e: any) {
      setError(e.message || 'Tizimga ulanishda xatolik yuz berdi.');
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
              Ro'yxatdan o'tish
            </p>
          </div>

          <Card variant="white" className="p-8 shadow-xl border border-primary/5 flex flex-col items-center">
            <h2 className="text-xl font-bold text-deep mb-6">Tizimga Google orqali kiring</h2>

            {/* Form errors */}
            {error && (
              <div className="w-full mb-4 bg-coral/10 text-coral border border-coral/20 p-4 rounded-xl flex items-start gap-3 text-sm font-semibold">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {isLoading && <p className="mb-4 text-primary font-bold">Yuklanmoqda...</p>}

            <div className="w-full flex justify-center mt-2 mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setError('Google bilan kirishda xatolik yuz berdi');
                }}
                useOneTap
              />
            </div>
            
            <p className="text-sm text-muted mt-4 text-center">
              Akkountingiz bormi?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Kirish
              </Link>
            </p>
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
