import { Link } from 'react-router-dom'
import ContactUsForm from '../components/home/ContactUsForm'

const outcomes = [
  {
    label: 'Career clarity',
    title: 'Real answers from alumni who have been there',
    text: 'Students get direct guidance on interviews, first roles, professional expectations, and the moves alumni wish they made earlier.',
  },
  {
    label: 'Practical skills',
    title: 'Build the habits that turn ambition into offers',
    text: 'Mentors help with LinkedIn presence, networking, offer conversations, and the small professional details that are hard to learn alone.',
  },
  {
    label: 'Warm access',
    title: 'Connections that feel earned, not transactional',
    text: 'The St. Laurence connection creates trust quickly, helping students begin thoughtful conversations with alumni.',
  },
]

const mentorSignals = [
  'Interview preparation',
  'LinkedIn profile review',
  'Networking strategy',
  'Salary negotiation',
  'Industry perspective',
]

interface HomePageProps {
  isAuthenticated?: boolean
}

function HomePage({ isAuthenticated = false }: HomePageProps) {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        {/* <div className="home-hero-art" aria-hidden="true"> */}
        <div className="disabled" aria-hidden="true">
          <div className="home-signal-card home-signal-card--primary">
            <span>Find mentors</span>
            <strong>Explore alumni in finance</strong>
            <p>
              Interview preparation, first-role strategy, career perspective
            </p>
          </div>
          <div className="home-signal-line" />
        </div>

        <div className="home-hero-content">
          <p className="home-kicker">St. Laurence alumni mentorship</p>
          <h1 id="home-title">Turn school pride into career momentum.</h1>
          <p className="home-hero-copy">
            A private alumni network for students and recent graduates who want
            honest career advice, useful professional skills, and warm
            connections from people who understand where they started.
          </p>
          <div className="home-hero-actions">
            {isAuthenticated ? (
              <>
                <Link className="home-primary-link" to="/directory">
                  Go to directory
                </Link>
                <Link className="home-secondary-link" to="/profile">
                  View your profile
                </Link>
              </>
            ) : (
              <>
                <Link className="home-primary-link" to="/register">
                  Create your profile
                </Link>
                <Link className="home-secondary-link" to="/login">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="home-proof" aria-label="How the program works">
        <div>
          <span className="home-block-header">Step 1</span>
          <Link to="/register">
            <strong>Sign up</strong>
          </Link>

          <p>Create a profile that explains your background and goals</p>
        </div>
        <div>
          <span className="home-block-header">Step 2</span>
          <strong>Get approved</strong>
          <p>An administrator reviews every request before access is granted</p>
        </div>
        <div>
          <span className="home-block-header">Step 3</span>
          <Link to="/directory">
            <strong>Find a mentor</strong>
          </Link>
          <p>Reach out via email or LinkedIn</p>
        </div>
      </section>

      <section className="home-section home-section--split">
        <div className="home-section-copy">
          <p className="home-kicker">What students need now</p>
          <h2>Career confidence is built through better conversations.</h2>
          <p>
            Students are not looking for generic advice. They want someone who
            can tell them how hiring really works, where to focus their energy,
            and how to turn uncertainty into a next step.
          </p>
        </div>

        <div className="home-insight-panel" aria-label="Student concerns">
          <div>
            <span className="home-block-header">Most urgent</span>
            <strong>Career anxiety</strong>
            <p>Learn about the pros and cons of different career paths</p>
          </div>
          <div>
            <span className="home-block-header">Most useful</span>
            <strong>Insider knowledge</strong>
            <p>Make connections that open doors</p>
          </div>
          <div>
            <span className="home-block-header">Most lasting</span>
            <strong>Identity and belonging</strong>
            <p>Have someone help you navigate different career phases</p>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <p className="home-kicker">How alumni help</p>
          <h2>A focused network for the moments that shape a career.</h2>
        </div>

        <div className="home-outcome-grid">
          {outcomes.map((outcome) => (
            <article className="home-outcome-card" key={outcome.label}>
              <span className="home-block-header">{outcome.label}</span>
              <h3>{outcome.title}</h3>
              <p>{outcome.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-network">
        <div>
          <p className="home-kicker">Built for action</p>
          <h2>From mentor discovery to a useful conversation.</h2>
          <p>
            The directory helps students find relevant alumni, review their
            experience, and contact them through approved program details.
          </p>
        </div>
        <ul aria-label="Mentorship support areas">
          {mentorSignals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      </section>

      <section className="home-final-cta" aria-labelledby="home-final-title">
        <p className="home-kicker">Start with the network you already share</p>
        <h2 id="home-final-title">
          Build the next St. Laurence success story.
        </h2>
        <div className="home-hero-actions">
          {isAuthenticated ? (
            <>
              <Link className="home-primary-link" to="/directory">
                Go to directory
              </Link>
              <Link className="home-secondary-link" to="/profile">
                Manage profile
              </Link>
            </>
          ) : (
            <>
              <Link className="home-primary-link" to="/register">
                Join the program
              </Link>
              <Link className="home-secondary-link" to="/login">
                I already have an account
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="home-contact" aria-labelledby="home-contact-title">
        <div className="home-contact-copy">
          <p className="home-kicker">Contact us</p>
          <h2 id="home-contact-title">Have a question about the program?</h2>
          <p>
            Send the mentorship team a message and we will get back to you as
            soon as possible.
          </p>
        </div>
        <div className="home-contact-card">
          <ContactUsForm />
        </div>
      </section>
    </main>
  )
}

export default HomePage
