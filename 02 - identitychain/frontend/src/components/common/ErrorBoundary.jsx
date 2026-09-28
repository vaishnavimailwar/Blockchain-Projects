import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Surface the real error in the browser console so it's easy to copy/paste for debugging.
    console.error('IDENTITYCHAIN render error:', error, info)
    this.setState({ info })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-graphite-950 p-8">
          <div className="panel max-w-2xl w-full p-6">
            <div className="flex items-center gap-2 text-accent-red mb-3">
              <AlertTriangle size={18} />
              <span className="heading font-semibold text-lg">This page hit an error</span>
            </div>
            <p className="text-graphite-500 text-[13px] mb-4">
              Something in this page crashed instead of rendering. The exact error is below &mdash; open your
              browser DevTools console (F12) for the full stack trace, and check that the backend
              (uvicorn on port 8000) is running.
            </p>
            <pre className="mono text-[12px] text-accent-red bg-graphite-900 border border-graphite-700 rounded-md p-3 whitespace-pre-wrap break-words">
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-3.5 py-2 rounded-md text-[13px] bg-accent-cyan text-white font-medium"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
