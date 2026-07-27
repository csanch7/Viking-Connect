function LoadingPage() {
  return (
    <main className="loading-page" aria-live="polite" aria-busy="true">
      <span className="loading-spinner" aria-hidden="true" />
      <p>Gathering your information...</p>
    </main>
  )
}

export default LoadingPage
