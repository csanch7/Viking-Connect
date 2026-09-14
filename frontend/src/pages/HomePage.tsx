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
        <div className="home-hero-content">
          <p className="home-kicker">
            St. Laurence Alumni Networking & Mentorship
          </p>
          <h1 id="home-title">Viking Connect</h1>
          <p className="home-hero-copy">
            One private community where every Viking can find mentors, meet
            peers, share experience, and turn a familiar connection into a
            useful next conversation.
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

        <div className="home-hero-stage" aria-hidden="true">
          <div className="home-hero-network">
            <svg viewBox="0 0 320 460" xmlns="http://www.w3.org/2000/svg">
              <g>
                <line pathLength={1} x1="40" y1="34" x2="128" y2="18" />
                <line pathLength={1} x1="128" y1="18" x2="208" y2="58" />
                <line pathLength={1} x1="208" y1="58" x2="278" y2="28" />
                <line pathLength={1} x1="278" y1="28" x2="300" y2="112" />
                <line pathLength={1} x1="40" y1="34" x2="62" y2="142" />
                <line pathLength={1} x1="62" y1="142" x2="168" y2="168" />
                <line pathLength={1} x1="168" y1="168" x2="208" y2="58" />
                <line pathLength={1} x1="168" y1="168" x2="248" y2="192" />
                <line pathLength={1} x1="248" y1="192" x2="298" y2="262" />
                <line pathLength={1} x1="300" y1="112" x2="298" y2="262" />
                <line pathLength={1} x1="62" y1="142" x2="22" y2="232" />
                <line pathLength={1} x1="22" y1="232" x2="112" y2="300" />
                <line pathLength={1} x1="112" y1="300" x2="168" y2="168" />
                <line pathLength={1} x1="298" y1="262" x2="268" y2="340" />
                <line pathLength={1} x1="112" y1="300" x2="42" y2="382" />
                <line pathLength={1} x1="42" y1="382" x2="190" y2="402" />
                <line pathLength={1} x1="190" y1="402" x2="268" y2="340" />
                <line pathLength={1} x1="268" y1="340" x2="300" y2="422" />
              </g>
              <g>
                <circle
                  className="home-hero-node-halo"
                  cx="208"
                  cy="58"
                  r="10.5"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node-halo"
                  cx="300"
                  cy="112"
                  r="11"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node-halo"
                  cx="298"
                  cy="262"
                  r="10"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node-halo"
                  cx="190"
                  cy="402"
                  r="11"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node"
                  cx="40"
                  cy="34"
                  r="2.5"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node"
                  cx="128"
                  cy="18"
                  r="2"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node--hub"
                  cx="208"
                  cy="58"
                  r="4.5"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node"
                  cx="278"
                  cy="28"
                  r="2"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node--hub"
                  cx="300"
                  cy="112"
                  r="5"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node"
                  cx="62"
                  cy="142"
                  r="2.5"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node--mid"
                  cx="168"
                  cy="168"
                  r="3"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node"
                  cx="248"
                  cy="192"
                  r="2"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node--mid"
                  cx="22"
                  cy="232"
                  r="3"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node--hub"
                  cx="298"
                  cy="262"
                  r="4"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node"
                  cx="112"
                  cy="300"
                  r="2.5"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node--mid"
                  cx="268"
                  cy="340"
                  r="3"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node"
                  cx="42"
                  cy="382"
                  r="2"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node--hub"
                  cx="190"
                  cy="402"
                  r="5"
                  pathLength={1}
                />
                <circle
                  className="home-hero-node"
                  cx="300"
                  cy="422"
                  r="2"
                  pathLength={1}
                />
              </g>
            </svg>
          </div>

          <div className="home-hero-card home-hero-card--primary">
            <p className="home-hero-card-kicker">Directory preview</p>
            <div className="home-hero-card-avatar">J</div>
            <p className="home-hero-card-name">Jordan M.</p>
            <p className="home-hero-card-meta">St. Laurence class of 2014</p>
            <div className="home-hero-card-tags">
              <span className="home-hero-card-tag">Interview prep</span>
              <span className="home-hero-card-tag">Career pivots</span>
            </div>
            <hr className="home-hero-card-divider" />
            <div className="home-hero-card-footer">
              <span>View full profile</span>
              <span aria-hidden="true">&rarr;</span>
            </div>
          </div>

          <div className="home-hero-card home-hero-card--secondary">
            <p className="home-hero-card-kicker home-hero-card-kicker--dark">
              New connection
            </p>
            <div className="home-hero-card-avatars">
              <span>P</span>
              <span>J</span>
            </div>
            <strong>Priya S. &rarr; Jordan M.</strong>
            <p>Matched on career pivots</p>
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
            <strong>Find a connection</strong>
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
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div className="home-footer-identity">
            <img
              className="home-footer-emblem"
              src="/favicon.svg"
              alt=""
              aria-hidden="true"
            />
            <div>
              <strong>Viking Connect</strong>
              <p>St. Laurence Alumni Networking &amp; Mentorship</p>
            </div>
          </div>

          <div className="home-footer-sponsor">
            <p>Brought to you by</p>
            <a href="https://www.vikingventuresgroup.org" target="_blank" rel="noopener noreferrer">
              <img src="/viking-ventures-logo.png" alt="Viking Ventures" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default HomePage
