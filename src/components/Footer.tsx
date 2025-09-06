import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 py-10 mt-10 border-t border-slate-700">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
        {/* Brand / About */}
        <div>
          <h2 className="text-2xl font-bold text-amber-400">Website OS V2</h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Cultivating cultural ecosystems with speed ⚡, compliance 🔒, and beauty 🎨 built in.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="hover:text-amber-400 transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-amber-400 transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-amber-400 transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-amber-400 transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Stay Updated</h3>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:flex-1 px-4 py-2 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button type="submit" className="btn-gold w-full sm:w-auto px-6 py-2">
              Subscribe
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-500">No spam. Cancel anytime.</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 border-t border-slate-700 pt-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Website OS V2. All rights reserved.
      </div>
    </footer>
  );
}
