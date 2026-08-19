import { Link } from 'react-router-dom'

function VerificationPage() {
  return (
    <main className="verification-page">
      <section
        className="verification-card"
        aria-labelledby="verification-title"
      >
        <div className="verification-icon" aria-hidden="true">
          ✓
        </div>
        <p className="verification-kicker">Viking Connect registration</p>
        <h1 id="verification-title">Your account is pending review</h1>
        <p>
          A program administrator will review your connection to the St.
          Laurence community and the profile information you submitted. We will
          email you when your account is approved.
        </p>
        <div className="verification-next-step">
          <strong>What happens next</strong>
          <p>
            You do not need to submit another registration. If you have a
            question while you wait, use the contact form on the home page.
          </p>
        </div>
        <div className="verification-actions">
          <Link className="verification-primary-link" to="/">
            Return home
          </Link>
        </div>
      </section>
    </main>
  )
}

export default VerificationPage
