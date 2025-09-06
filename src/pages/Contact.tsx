import React from "react";

export default function Contact() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-sage text-white text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold">Contact Us</h1>
        <p className="mt-4 text-lg max-w-2xl mx-auto text-amber-100">
          We’d love to hear from you. Reach out for demos, questions, or partnerships.
        </p>
      </section>

      {/* Form */}
      <section className="max-w-2xl mx-auto py-16 px-6">
        <form className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
          <div>
            <label className="block text-slate-700 font-semibold">Name</label>
            <input
              type="text"
              className="w-full mt-2 p-3 border rounded-md focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold">Email</label>
            <input
              type="email"
              className="w-full mt-2 p-3 border rounded-md focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold">Message</label>
            <textarea
              className="w-full mt-2 p-3 border rounded-md focus:ring-2 focus:ring-amber-400"
              rows={5}
            ></textarea>
          </div>
          <button type="submit" className="btn-primary w-full">
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
}
