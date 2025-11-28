// Error boundary to catch and display a fallback UI on runtime errors
import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  // Optionally log errors or report to monitoring here
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="alert alert-danger">Something went wrong</div>
        </div>
      )
    }
    return this.props.children
  }
}
