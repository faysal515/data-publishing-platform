import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="w-full border-b border-black/[.08] dark:border-white/[.145]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="">
                <h3 className="text-lg font-semibold">
                  Dataset Publishing Platform
                </h3>
              </div>
            </Link>
          </div>

          <div className="flex space-x-8">
            <Link
              href="/"
              className={`${
                router.pathname === "/"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-gray-500 hover:text-foreground"
              } px-1 py-2 text-sm font-medium`}
            >
              Home
            </Link>
            <Link
              href="/datasets"
              className={`${
                router.pathname === "/datasets"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-gray-500 hover:text-foreground"
              } px-1 py-2 text-sm font-medium`}
            >
              Datasets
            </Link>
            <Link
              href="/dashboard"
              className={`${
                router.pathname === "/dashboard"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-gray-500 hover:text-foreground"
              } px-1 py-2 text-sm font-medium`}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
