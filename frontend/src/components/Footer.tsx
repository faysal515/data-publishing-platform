import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-8 text-center">
      © {new Date().getFullYear()} All rights reserved.
    </footer>
  );
}
