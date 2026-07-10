import { Link } from 'react-router-dom'

function VerificationPage() {
  return (
    <main className="verification-page">
      <section className="verification-card" aria-labelledby="verification-title">
        <div className="verification-icon" aria-hidden="true">
          ✓
        </div>
        <p className="verification-kicker">Registration received</p>
        <h1 id="verification-title">Your account is pending review</h1>
        <p>
          Thank you for your interest in the STL Mentorship Program. One of the
          admins will review your registration and grant account access soon.
        </p>
        <Link className="verification-link" to="/">
          <span aria-hidden="true">←</span>
          Back to sign in
        </Link>
      </section>
    </main>
  )
}

export default VerificationPage
