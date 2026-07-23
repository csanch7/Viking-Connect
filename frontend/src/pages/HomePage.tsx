import { Link } from 'react-router-dom'

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
        <div className="home-hero-art" aria-hidden="true">
          <div className="home-signal-card home-signal-card--primary">
            <span>Mentor directory</span>
            <strong>Explore alumni in finance</strong>
            <p>Interview preparation, first-role strategy, career perspective</p>
          </div>
          <div className="home-signal-card home-signal-card--secondary">
            <span>Student goal</span>
            <strong>Land a summer internship</strong>
            <p>Resume story, LinkedIn polish, questions for alumni</p>
          </div>
          <div className="home-signal-line" />
        </div>

        <div className="home-hero-content">
          <p className="home-kicker">St. Laurence alumni mentorship</p>
          <h1 id="home-title">
            Turn school pride into career momentum.
          </h1>
          <p className="home-hero-copy">
            A private alumni network for students and recent graduates who want
            honest career advice, useful professional skills, and warm
            connections from people who understand where they started.
          </p>
          <div className="home-hero-actions">
            {isAuthenticated ? (
              <>
                <Link className="home-primary-link" to="/dashboard">
                  Find mentors
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

      <section className="home-proof" aria-label="Program focus areas">
        <div>
          <span>01</span>
          <strong>Insider guidance</strong>
          <p>Conversations that answer what the job market actually feels like.</p>
        </div>
        <div>
          <span>02</span>
          <strong>Professional readiness</strong>
          <p>Interviewing, networking, LinkedIn, offers, and follow-through.</p>
        </div>
        <div>
          <span>03</span>
          <strong>Belonging</strong>
          <p>A shared St. Laurence background makes mentorship feel immediate.</p>
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
            <span>Most urgent</span>
            <strong>Career anxiety</strong>
            <p>What job fits me, and how do I even begin?</p>
          </div>
          <div>
            <span>Most useful</span>
            <strong>Insider knowledge</strong>
            <p>What did you do that actually opened doors?</p>
          </div>
          <div>
            <span>Most lasting</span>
            <strong>Identity and belonging</strong>
            <p>Someone from my school sees where I am headed.</p>
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
              <span>{outcome.label}</span>
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
              <Link className="home-primary-link" to="/dashboard">
                Go to dashboard
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
    </main>
  )
}

export default HomePage
