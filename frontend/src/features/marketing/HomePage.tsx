/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Heart,
  Users,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  School,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import oligofreniyaImg from '../../images/Oligofreniya.jpg';

export function HomePage() {
  const navigate = useNavigate();
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactPhone) {
      setFormSubmitted(true);
      setTimeout(() => {
        setContactName('');
        setContactPhone('');
        setContactMessage('');
        setFormSubmitted(false);
        setShowSuccessAlert(true);
        // Clear after 6 seconds
        setTimeout(() => setShowSuccessAlert(false), 6000);
      }, 1000);
    }
  };

  const steps = [
    { number: '01', title: 'Maktablarni Ulanishi', desc: 'Ixtisoslashtirilgan maktab-internatlar platformamizda ro‘yxatdan o‘tadi.' },
    { number: '02', title: 'O‘quvchilarni Kiritish', desc: 'O‘qituvchilar o‘z sinfidagi bolalarni kiritishadi, tizim ota-ona uchun maxsus login-parol beradi.' },
    { number: '03', title: 'Kunlik Holat va AI Tahlil', desc: 'O‘qituvchi kun yakunida bolaning kayfiyati, salomatligini kiritadi. AI buni ota-ona uchun sodda tavsiyalarga o‘giradi.' },
    { number: '04', title: 'Doimiy Hamkorlik', desc: 'Ota-onalar farzandining rivojlanishini grafiklarda ko‘rib, AI maxsus maslahatchi bilan suhbatlashadi.' }
  ];

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-coral" />,
      title: "AI Tahlil va Maslahatlar",
      desc: "Klinik murakkab jurnallarni ota-onalar tushunadigan samimiy, xavotirsiz va amaliy uy sharoitidagi mashg‘ulot tavsiyalariga aylantiradi."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-primary" />,
      title: "Rivojlanish Dinamikasi",
      desc: "Haftalik va oylik grafiklar yordamida farzandingizning emotsional va jismoniy holatidagi o‘zgarishlarni vaqt kesimida kuzatib boring."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-coral" />,
      title: "Ixtisoslashgan AI Suhbat",
      desc: "Daun sindromi, aqli zaiflik va boshqa maxsus ehtiyojli bolalar tarbiyasi bo‘yicha istalgan vaqtda pedagogik va psixologik yordam oling."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "Xavfsiz va Yopiq Tizim",
      desc: "Kundalik.com tizimi kabi, ota-onalar o‘zlari ro‘yxatdan o‘tmaydi. Faqat maktab tomonidan berilgan tasdiqlangan login orqali kirish mumkin."
    }
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white rounded-full p-2 flex items-center justify-center shadow-md shadow-primary/20">
              <Heart className="w-6 h-6" fill="currentColor" />
            </div>
            <span className="text-xl font-black text-deep tracking-tight font-serif">
              YORDAMCHI<span className="text-coral">.UZ</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-deep">
            <a href="#about" className="hover:text-primary transition-all">Biz haqimizda</a>
            <a href="#features" className="hover:text-primary transition-all">Imkoniyatlar</a>
            <a href="#how-it-works" className="hover:text-primary transition-all">Qanday ishlaydi?</a>
            <a href="#pricing" className="hover:text-primary transition-all">Tariflar</a>
            <a href="#contact" className="hover:text-primary transition-all">Aloqa</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Kirish
              </Button>
            </Link>
            <a href="#contact">
              <Button variant="primary" size="sm" className="hidden sm:inline-flex">
                Ulanish
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-primary/10 shadow-sm self-start">
                <Badge variant="coral">Yangi Davr</Badge>
                <span className="text-xs font-bold text-deep">Ijtimoiy Himoyadagi Bolalar uchun Professional Platforma</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-deep tracking-tight leading-tight font-serif">
                Maxsus ehtiyojli bolalar tarbiyasida <span className="text-primary underline decoration-coral decoration-4">eng ishonchli</span> ko‘prik
              </h1>
              <p className="text-lg text-muted max-w-2xl leading-relaxed">
                Maktab-internatlar va ota-onalar o‘rtasidagi hamkorlikni osonlashtiring. Sun’iy intellekt tahlili yordamida farzandingizning kunlik holatini oson tushuning, qulay vizual hisobotlar va amaliy tavsiyalar oling.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Link to="/login">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                    Tizimga Kirish <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="#contact">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Maktabni ulash
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-6 mt-4 text-sm text-deep font-semibold">
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5 text-primary" />
                  <span>30+ Maktab-internatlar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-coral" />
                  <span>2,000+ Ota-onalar</span>
                </div>
              </div>
            </div>

            {/* Visual element representing 3D Image */}
            <div className="lg:col-span-5 relative" style={{ perspective: '1000px' }}>
              <motion.div
                initial={{ rotateX: 15, rotateY: -15, scale: 0.9, opacity: 0 }}
                animate={{ rotateX: 10, rotateY: -10, scale: 1, opacity: 1 }}
                whileHover={{ rotateX: 5, rotateY: -5, scale: 1.02 }}
                transition={{ duration: 0.8, type: 'spring' }}
                className="bg-white rounded-[2rem] p-3 border border-primary/20 shadow-2xl relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img 
                  src={oligofreniyaImg} 
                  alt="Maxsus ta'lim" 
                  className="w-full h-auto rounded-3xl object-cover shadow-inner"
                />
                
                <motion.div 
                  initial={{ translateZ: 0 }}
                  animate={{ translateZ: 50 }}
                  className="absolute -bottom-6 -left-6 bg-deep text-white rounded-2xl p-4 shadow-lg flex items-center gap-3 border border-white/10"
                >
                  <Clock className="w-8 h-8 text-coral animate-pulse" />
                  <div>
                    <p className="text-xs text-white/70 font-medium">Tezkor aloqa</p>
                    <p className="text-sm font-bold">Har kuni 24/7 faol</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-16">
            <Badge variant="primary" className="self-center">Biz haqimizda</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-deep font-serif">
              Platformaning maqsadi va ijtimoiy missiyamiz
            </h2>
            <p className="text-lg text-muted leading-relaxed">
              Yordamchi.uz maxsus pedagogik ta’lim tizimini raqamlashtirish va imkoniyati cheklangan bolalarning ota-onalariga daldalanish maqsadida tashkil etilgan. Biz murakkab klinik tahlillarni ota-onalarga iliq va tushunarli tarzda taqdim etib, uy va maktab o‘rtasida uzluksiz hamkorlikni ta’minlaymiz.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="blue" className="flex flex-col gap-4 text-center items-center p-8">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-deep font-serif">Ota-onalar uchun</h3>
              <p className="text-sm text-muted">
                Farzandining har kungi holatini ruhan qiynalmasdan, xavotirsiz va sodda vizual grafiklarda kuzatish, AI yordamida har kunga mos pedagogik maslahatlar olish.
              </p>
            </Card>

            <Card variant="blue" className="flex flex-col gap-4 text-center items-center p-8">
              <div className="w-12 h-12 rounded-full bg-coral text-white flex items-center justify-center">
                <School className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-deep font-serif">O‘qituvchilar uchun</h3>
              <p className="text-sm text-muted">
                O‘quvchilar kunlik holat jurnallarini soniyalar ichida shakllantirish, avtomatik ota-onaga hisobot va xavfsiz login-parollarni generatsiya qilish imkoniyati.
              </p>
            </Card>

            <Card variant="blue" className="flex flex-col gap-4 text-center items-center p-8">
              <div className="w-12 h-12 rounded-full bg-deep text-white flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-deep font-serif">Maktab Ma’muriyati uchun</h3>
              <p className="text-sm text-muted">
                Sinflar faoliyatini nazorat qilish, o‘qituvchilar hisobotlarining dinamikasini kuzatish va maktab-internat ijtimoiy nufuzini raqamli ko‘tarish.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-16">
            <Badge variant="coral" className="self-center">Imkoniyatlar</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-deep font-serif">
              Tizimning barcha aqlli afzalliklari
            </h2>
            <p className="text-base text-muted">
              Har bir element maxsus ehtiyojli bolalar parvarishining nozik jihatlarini hisobga olgan holda yaratilgan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, i) => (
              <Card key={i} className="flex flex-col gap-4 items-start p-6">
                <div className="p-3 bg-bg rounded-xl">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-deep leading-tight">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {feat.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-deep text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-16">
            <Badge variant="coral" className="self-center">Qanday ishlaydi?</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif">
              Tizimni ishga tushirish 4 oddiy qadamda
            </h2>
            <p className="text-base text-white/75">
              Murakkab texnik sozlashlarsiz, tezkor va foydalanishga juda qulay boshqaruv.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex flex-col gap-3">
                <div className="text-5xl font-black text-coral/30 tracking-tight font-serif">
                  {step.number}
                </div>
                <h4 className="text-lg font-bold text-white">
                  {step.title}
                </h4>
                <p className="text-sm text-white/70 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto flex flex-col gap-4 mb-16">
            <Badge variant="primary" className="self-center">Tariflar</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-deep font-serif">
              Hamyonbop va bepul ulanish imkoniyatlari
            </h2>
            <p className="text-base text-muted">
              Davlat maktab-internatlari uchun alohida imtiyozlar va bepul sinov rejalari mavjud.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan 1 */}
            <Card variant="white" className="flex flex-col justify-between p-8 border-t-4 border-t-primary/40">
              <div className="flex flex-col gap-4">
                <h4 className="text-lg font-bold text-deep">Maktab-Sinov</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-deep">Bepul</span>
                  <span className="text-sm text-muted">/ 1 oy</span>
                </div>
                <p className="text-xs text-muted">
                  Yangi maktab-internatlar platforma bilan tanishishi uchun mo‘ljallangan sinov muddati.
                </p>
                <ul className="text-xs text-deep font-medium flex flex-col gap-2 mt-4">
                  <li>• 1 ta o‘quvchilar sinfi</li>
                  <li>• 30 tagacha o‘quvchi kiritish</li>
                  <li>• Standard AI kunlik tahlillar</li>
                  <li>• SMS jo‘natish (cheklov bilan)</li>
                </ul>
              </div>
              <Button variant="outline" size="md" className="mt-8" onClick={() => navigate('/login')}>
                Boshlash
              </Button>
            </Card>

            {/* Plan 2 - Popular */}
            <Card variant="blue" className="flex flex-col justify-between p-8 border-2 border-primary relative">
              <div className="absolute top-4 right-4">
                <Badge variant="coral">Tavsiya</Badge>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-lg font-bold text-deep">Ixtisoslashtirilgan Maktab</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-deep">Yillik</span>
                  <span className="text-sm text-muted">/ Shartnoma</span>
                </div>
                <p className="text-xs text-muted">
                  Barcha davlat va xususiy ixtisoslashtirilgan maktab-internatlar uchun to‘liq paket.
                </p>
                <ul className="text-xs text-deep font-bold flex flex-col gap-2 mt-4">
                  <li>• Cheksiz sinflar va o‘quvchilar</li>
                  <li>• AI doimiy tahlil va tavsiyalar</li>
                  <li>• Ota-onalar bilan 24/7 AI maslahatchi</li>
                  <li>• SMS va chop etish tizimi integratsiyasi</li>
                  <li>• Texnik xizmat va ma’murlar mashg‘uloti</li>
                </ul>
              </div>
              <a href="#contact" className="w-full">
                <Button variant="primary" size="md" className="mt-8 w-full">
                  Shartnoma tuzish
                </Button>
              </a>
            </Card>

            {/* Plan 3 */}
            <Card variant="white" className="flex flex-col justify-between p-8 border-t-4 border-t-coral/40">
              <div className="flex flex-col gap-4">
                <h4 className="text-lg font-bold text-deep font-serif">Oila Rejasi</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-deep">Ota-ona uchun</span>
                </div>
                <p className="text-xs text-muted">
                  Maktab tizimga ulangan bo‘lsa, barcha ota-onalar uchun foydalanish mutlaqo BEPUL bo‘ladi.
                </p>
                <ul className="text-xs text-deep font-medium flex flex-col gap-2 mt-4">
                  <li>• Farzand holatini 24/7 kuzatish</li>
                  <li>• AI Report grafik tahlillari</li>
                  <li>• AI pedagog-maslahatchi bilan cheksiz chat</li>
                  <li>• Bildirishnomalar va tavsiyalar</li>
                </ul>
              </div>
              <Button variant="secondary" size="md" className="mt-8" onClick={() => navigate('/login')}>
                Kirish
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="flex flex-col gap-6 justify-center">
              <Badge variant="coral" className="self-start">Aloqa</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-deep font-serif">
                Maktab-internatingizni ulamoqchimisiz?
              </h2>
              <p className="text-base text-muted leading-relaxed">
                Biz bilan hoziroq bog‘laning va maktabingiz faoliyatini raqamlashtiring. Mutaxassislarimiz platformani o‘rnatish, o‘qituvchilarni o‘qitish va ota-onalar bilan aloqa o‘rnatishda to‘liq yordam berishadi.
              </p>

              <div className="flex flex-col gap-4 mt-4 text-sm text-deep font-semibold">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full text-primary shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>+998 71 200 45 67</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full text-coral shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>info@yordamchi.uz</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full text-primary shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>Toshkent shahri, Amir Temur shoh ko‘chasi, 12-uy</span>
                </div>
              </div>
            </div>

            <Card variant="white" className="p-8">
              <h3 className="text-xl font-bold text-deep mb-4 font-serif">Ulanish uchun so‘rov yuborish</h3>
              
              {showSuccessAlert && (
                <div className="mb-4 bg-emerald-50 text-emerald-800 border border-emerald-200 p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-start gap-2">
                  <span>✅</span>
                  <span>Sizning so‘rovingiz muvaffaqiyatli qabul qilindi! Tez orada mutaxassislarimiz bog‘lanishadi.</span>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-semibold text-deep pl-1">Ism sharifingiz</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Masalan: To‘rayev Baxtiyor"
                    className="w-full px-4 py-3 bg-bg/50 border border-primary/10 rounded-xl focus:border-primary focus:outline-none text-base text-ink"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-deep pl-1">Telefon raqamingiz</label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Masalan: +998 90 123 45 67"
                    className="w-full px-4 py-3 bg-bg/50 border border-primary/10 rounded-xl focus:border-primary focus:outline-none text-base text-ink"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-deep pl-1">Maktab haqida / Izoh</label>
                  <textarea
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Masalan: Chilonzordagi 12-sonli maktab direktori, sinflarni ulash bo‘yicha..."
                    className="w-full px-4 py-3 bg-bg/50 border border-primary/10 rounded-xl focus:border-primary focus:outline-none text-base text-ink resize-none"
                  />
                </div>
                <Button variant="coral" size="lg" fullWidth type="submit" className="mt-2">
                  So‘rovni Yuborish
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep text-white/80 py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white rounded-full p-1.5">
              <Heart className="w-5 h-5" fill="currentColor" />
            </div>
            <span className="text-lg font-black text-white tracking-tight font-serif">
              YORDAMCHI<span className="text-coral">.UZ</span>
            </span>
          </div>
          <p>© 2026 Yordamchi.uz — barcha huquqlar himoyalangan. Maxsus ehtiyojli bolalar va oilalar yordamchisi.</p>
          <div className="flex items-center gap-6">
            <a href="#about" className="hover:text-white transition-all">Biz haqimizda</a>
            <a href="#features" className="hover:text-white transition-all">Siyosat</a>
            <a href="#contact" className="hover:text-white transition-all">Yordam</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
