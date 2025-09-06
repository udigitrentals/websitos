import React from "react";

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-aurora animate-aurora text-white text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold">About Website OS V2</h1>
        <p className="mt-4 text-lg text-amber-100 max-w-2xl mx-auto">
          Cultivating digital ecosystems with speed ⚡, compliance 🔒, and beauty 🎨.
        </p>
      </section>

      {/* Body */}
      <section className="max-w-4xl mx-auto py-16 px-6 space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
        <p className="text-slate-600 leading-relaxed">
          Website OS V2 is built for builders, creators, and organizations who want to launch fast,
          stay compliant, and resonate with culture.
        </p>

        <h2 className="text-2xl font-bold text-slate-900">Our Vision</h2>
        <p className="text-slate-600 leading-relaxed">
          To be the covenant OS that empowers cultural ecosystems worldwide with fairness, beauty,
          and resilience.
        </p>
      </section>
    </div>
  );
}
