import React from 'react';
import { useNavigate } from 'react-router-dom';

const HaaLOLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0b1120] text-white font-sans min-h-screen relative overflow-hidden">

      {/* NAVIGATION */}
      <header className="flex justify-between items-center px-6 py-6 sticky top-0 z-50 bg-[#0b1120]">
        <div className="flex items-center">
          <img src="/lovable-uploads/a701720a-8e2b-44a2-8f6d-bac14450d615.png" alt="HaaLO IQ Logo" className="h-16 w-auto" />
        </div>
        <nav className="hidden md:flex space-x-6">
          <a href="#features" className="hover:text-blue-400">Features</a>
          <a href="#pricing" className="hover:text-blue-400">Pricing</a>
          <a href="#why" className="hover:text-blue-400">Why HaaLO</a>
          <button onClick={() => navigate('/auth')} className="hover:text-blue-400">Login</button>
          <button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white font-semibold">Try Free</button>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="text-center px-6 py-32 relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Payroll was never broken.<br />It just never thought like this.
            </h1>
            <p className="text-xl text-gray-300 mb-10">AI-native. Modular. Audited. Effortless.</p>
            <div className="flex flex-col md:flex-row gap-4">
              <button onClick={() => navigate('/auth')} className="bg-green-400 hover:bg-green-300 text-black font-semibold px-8 py-4 rounded">Launch a Demo</button>
              <button onClick={() => navigate('/auth')} className="border border-white px-8 py-4 rounded hover:bg-white hover:text-black font-semibold">Talk to Sales</button>
            </div>
          </div>

          {/* Right Neural Network */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg h-96">
              <img 
                src="/lovable-uploads/c77bf91c-cb1b-4803-a77a-8111e81fb2b8.png" 
                alt="Neural Network Visualization" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ASK HAALO ANYTHING */}
      <section className="text-center px-6 py-24 bg-[#0f172a] relative z-10">
        <h2 className="text-4xl font-bold mb-4">Ask HaaLO Anything</h2>
        <p className="text-gray-300 mb-8">Payroll, benefits, onboarding, compliance—type it in, and watch what happens.</p>
        <div className="max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Run payroll for 120 employees across 3 states"
            className="w-full px-6 py-4 rounded text-black text-lg shadow-lg"
          />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="px-6 py-24 bg-[#1e293b]">
        <h2 className="text-4xl font-bold text-center mb-16">Why HaaLO is Different</h2>
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto text-left">
          <div>
            <h3 className="text-2xl font-semibold mb-2">Modular by Design</h3>
            <p className="text-gray-300">Add only what you need: Benefits, PEO layers, contractor workflows—even tips-based payroll.</p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-2">Native Intelligence</h3>
            <p className="text-gray-300">Rules engines, audit layers, and tax changes are pre-coded and self-updating.</p>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-2">Startup Speed, Enterprise Power</h3>
            <p className="text-gray-300">From 1 to 10,000 employees without switching platforms. Ever.</p>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="px-6 py-24 bg-[#0f172a]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <p className="text-white text-xl italic">"Saved $301K in payroll errors in 90 days."</p>
            <span className="text-blue-400 block mt-2">– TalentBridge</span>
          </div>
          <div>
            <p className="text-white text-xl italic">"We stopped dreading payroll day."</p>
            <span className="text-blue-400 block mt-2">– Clinic365</span>
          </div>
          <div>
            <p className="text-white text-xl italic">"From 11 systems to 1. And it thinks faster than our team."</p>
            <span className="text-blue-400 block mt-2">– TekNex</span>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 text-center bg-gradient-to-r from-cyan-700 to-blue-900">
        <h2 className="text-4xl font-bold mb-6">Your payroll just got promoted.</h2>
        <p className="text-gray-200 text-lg mb-8">This is payroll if it were invented in 2025—because it was.</p>
        <div className="space-x-4">
          <button onClick={() => navigate('/auth')} className="bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-300">Start Free</button>
          <button onClick={() => navigate('/auth')} className="border border-white px-6 py-3 rounded text-white hover:bg-white hover:text-black font-semibold">Book a Call</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 bg-black text-center text-gray-400 text-sm">
        <div className="mb-4">
          <a href="#" className="mx-3 hover:text-white">Privacy</a> | 
          <a href="#" className="mx-3 hover:text-white">Terms</a> | 
          <a href="#" className="mx-3 hover:text-white">LinkedIn</a>
        </div>
        <p>© HaaLO IQ. Built for minds that build businesses.</p>
      </footer>
    </div>
  );
};

export default HaaLOLanding;