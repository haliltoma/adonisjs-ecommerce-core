import { Head, Link } from '@inertiajs/react'

interface Props {
  error?: string
}

export default function NotFound({ error }: Props) {
  return (
    <>
      <Head title="Page Not Found" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative inline-block">
              <span className="text-[180px] font-black text-slate-200 leading-none select-none">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Page Not Found
          </h1>

          <p className="text-slate-600 mb-8 text-lg">
            Sorry, we couldn't find the page you're looking for. Perhaps you've
            mistyped the URL or the page has been moved.
          </p>

          {error && (
            <p className="text-sm text-slate-500 mb-6 bg-slate-100 px-4 py-2 rounded-lg inline-block">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </button>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-4">
              Here are some helpful links:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                href="/products"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Browse Products
              </Link>
              <span className="text-slate-300">|</span>
              <Link
                href="/categories"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Categories
              </Link>
              <span className="text-slate-300">|</span>
              <Link
                href="/contact"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
