import { Head, Link } from '@inertiajs/react'

interface Props {
  error?: string
}

export default function ServerError({ error }: Props) {
  return (
    <>
      <Head title="Server Error" />

      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          {/* 500 Illustration */}
          <div className="mb-8">
            <div className="relative inline-block">
              <span className="text-[180px] font-black text-red-100 leading-none select-none">
                500
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-xl animate-pulse">
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
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Something Went Wrong
          </h1>

          <p className="text-slate-600 mb-8 text-lg">
            We're sorry, but something unexpected happened. Our team has been
            notified and we're working to fix the issue.
          </p>

          {error && process.env.NODE_ENV !== 'production' && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-mono text-red-700 break-all">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>

            <Link
              href="/"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Home
            </Link>
          </div>

          {/* Status Info */}
          <div className="mt-12 pt-8 border-t border-red-200">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
              <span className="text-sm text-slate-600">
                Error reported to our team
              </span>
            </div>
          </div>

          {/* Contact Support */}
          <p className="mt-8 text-sm text-slate-500">
            If the problem persists, please{' '}
            <Link
              href="/contact"
              className="text-indigo-600 hover:text-indigo-800 underline"
            >
              contact our support team
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  )
}
