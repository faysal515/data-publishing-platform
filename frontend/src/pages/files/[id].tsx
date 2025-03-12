import { GetServerSideProps } from "next";
import { fontClassName } from "../../config/fonts";
import { marked } from "marked";
import Link from "next/link";
import type { Job } from "../../types/job";
import SEO from "../../components/SEO";

export default function JobDetails() {
  return (
    <div className={fontClassName}>
      <SEO />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-base font-semibold text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          ← Back to list
        </Link>

        <h1 className="text-3xl font-bold mb-6">Dataset Details</h1>
        <main>{/* Dataset details content will go here */}</main>
      </div>
    </div>
  );
}
