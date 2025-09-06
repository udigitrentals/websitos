import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center bg-aurora animate-aurora text-white px-6">
        <div className="absolute inset-0 bg-aurora opacity-80 animate-aurora"></div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
            Cultivate Your <span className="text-amber-300">Digital Ecosystem</span> <br />
            with <span className="text-pink-400">Website OS V2</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-amber-100 leading-relaxed">
            Launch faster ⚡ · Stay trusted 🔒 · Grow beautifully 🎨 <br />
            The covenant OS that integrates speed, compliance, and culture.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/contact" className="btn-primary">
              Get a Demo
            </a>
            <a href="/about" className="btn-gold">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Ecosystem Cycle */}
      <section className="py-20 bg-slate-50 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800">The Ecosystem Cycle</h2>
        <p className="mt-4 text-slate-600">Seed → Grow → Prune → Reconcile</p>
        <div className="mt-10">
          <img
            src="/images/ecosystem-cycle.png"
            alt="Ecosystem Cycle"
            className="mx-auto max-w-lg rounded-xl shadow-md"
          />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 px-6">
          <div className="p-6 bg-slate-800/60 rounded-2xl shadow-lg hover:scale-105 transition">
            <h3 className="text-xl font-bold">⚡ Speed & Resilience</h3>
            <p className="mt-2 text-slate-300">
              Launch in half the time with built-in playbooks and automated pruning.
            </p>
          </div>
          <div className="p-6 bg-slate-800/60 rounded-2xl shadow-lg hover:scale-105 transition">
            <h3 className="text-xl font-bold">🎨 Beauty by Default</h3>
            <p className="mt-2 text-slate-300">
              Covenant color tokens ensure consistent aesthetics across dashboards and sites.
            </p>
          </div>
          <div className="p-6 bg-slate-800/60 rounded-2xl shadow-lg hover:scale-105 transition">
            <h3 className="text-xl font-bold">🔒 Trust by Design</h3>
            <p className="mt-2 text-slate-300">
              Consent Mode + GA4 built in for compliance-first ecosystems.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-b from-indigo-900 via-slate-900 to-black text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Cultivate Your Digital Ecosystem?
        </h2>
        <p className="mb-8 text-slate-300">Start today — early access spots are filling fast.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/contact" className="btn-primary">
            Contact Us
          </a>
          <a href="/about" className="btn-gold">
            Explore Features
          </a>
        </div>
      </section>
    </div>
  );
}
