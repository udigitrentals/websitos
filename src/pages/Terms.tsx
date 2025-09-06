import React from "react";

export default function Terms() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-warrior text-white text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold">Terms of Service</h1>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto py-16 px-6 space-y-6 text-slate-700">
        <h2 className="text-xl font-bold">1. Introduction</h2>
        <p>By using Website OS V2, you agree to these terms...</p>

        <h2 className="text-xl font-bold">2. Usage</h2>
        <p>You may not misuse or abuse the platform...</p>

        <h2 className="text-xl font-bold">3. Liability</h2>
        <p>Website OS is not liable for damages caused by misuse...</p>
      </section>
    </div>
  );
}
