import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} Website OS V2. All rights reserved.</p>
        <nav aria-label="Footer navigation">
          <ul className="flex justify-center space-x-6 mt-2">
            <li>
              <a href="/privacy" className="hover:underline">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:underline">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
