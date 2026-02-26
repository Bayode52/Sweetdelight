'use client'
import React from 'react'

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    constructor(props: any) {
        super(props)
        this.state = { hasError: false }
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center p-8">
                        <div className="text-6xl mb-4">🍰</div>
                        <h2 className="text-2xl font-bold text-[#4A3222] mb-2">
                            Oops! Something went wrong
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#D97757] text-white px-6 py-3 rounded-full font-bold hover:bg-[#C26245] transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}
