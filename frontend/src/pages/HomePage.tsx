import { Link } from 'react-router-dom'
import ContactUsForm from '../components/home/ContactUsForm'

const outcomes = [
  {
    label: 'Career clarity',
    title: 'Real answers from alumni who have been there',
    text: 'Direct guidance on interviews, first roles, professional expectations, and the moves alumni wish they made earlier.',
  },
  {
    label: 'Practical skills',
    title: 'Build the habits that turn ambition into offers',
    text: 'Mentors help with LinkedIn presence, how to get a job, interview prep, and how to advance your career.',
  },
  {
    label: 'Warm access',
    title: 'Introductions to industry leaders and hiring managers',
    text: 'Advance your career by connecting with senior executives and thought leaders.',
  },
]

const testimonials = [
  {
    name: 'Aoibhe Landers ’25',
    quote:
      'I’m interested in a career in wealth management and have already made three solid industry connections.',
  },
  {
    name: 'Anthony Rios ’16',
    quote:
      'The STL network has provided me with endless amounts of advice and opportunities, helping me land a position in a growing technology segment.',
  },
  {
    name: 'Mike Stankus ’76',
    quote:
      'Viking Connect has enabled me to connect and network with distinguished alumni whom I had known of, but never had the opportunity to meet personally.',
  },
]

interface HomePageProps {
  isAuthenticated?: boolean
}

function HomePage({ isAuthenticated = false }: HomePageProps) {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-content">
          <div className="home-hero-message">
            <h1 id="home-title">
              <span>Viking</span>
              <span>Connect</span>
            </h1>
            <p className="home-hero-statement">
              One school. More ways forward.
            </p>
            <p className="home-hero-copy">
              Viking Connect is the St. Laurence networking and mentoring
              community, bringing together graduating students, alumni, and
              friends of the school to build relationships, share career
              guidance, and create opportunities for fellow Vikings.
            </p>
            <div className="home-hero-actions">
              {isAuthenticated ? (
                <>
                  <Link className="home-primary-link" to="/directory">
                    Explore the directory
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

          <div className="home-hero-mark" aria-hidden="true">
            <img src="/favicon.svg" alt="" />
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
          <h2>Your network is one of your greatest assets.</h2>
          <p>
            Viking Connect helps Saint Laurence alumni unlock the collective
            experience, expertise, and generosity of our global alumni
            community. Through networking, mentorship, and collaboration,
            members gain valuable insights, develop lasting relationships, and
            create opportunities for themselves and others.
          </p>
        </div>

        <div
          className="home-testimonial-panel"
          aria-label="Alumni testimonials"
        >
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name}>
              <blockquote>
                <p>“{testimonial.quote}”</p>
              </blockquote>
              <figcaption>{testimonial.name}</figcaption>
            </figure>
          ))}
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
            <a
              href="https://www.vikingventuresgroup.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/viking-ventures-logo.png" alt="Viking Ventures" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default HomePage
