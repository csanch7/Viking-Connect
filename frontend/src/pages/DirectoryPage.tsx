import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import MenteeDirectoryComponent from '../components/user/MenteeDirectoryComponent'
import MentorDirectoryComponent from '../components/user/MentorDirectoryComponent'

type DirectoryView = 'mentors' | 'mentees'

function DirectoryPage() {
  const location = useLocation()
  const [currentView, setCurrentView] = useState<DirectoryView>(() =>
    location.state?.view === 'mentees' ? 'mentees' : 'mentors',
  )

  return (
    <main className="directory-page">
      <div className="directory-shell">
        <section className="directory-hero" aria-labelledby="directory-title">
          <h1 id="directory-title">Member directory</h1>
          <p>
            Explore the Viking Connect community and find people through shared
            interests, expertise, and college connections.
          </p>
        </section>

        <div
          className="directory-view-picker"
          role="group"
          aria-label="Choose directory"
        >
          <button
            type="button"
            aria-pressed={currentView === 'mentors'}
            onClick={() => setCurrentView('mentors')}
          >
            Mentors
          </button>
          <button
            type="button"
            aria-pressed={currentView === 'mentees'}
            onClick={() => setCurrentView('mentees')}
          >
            Mentees
          </button>
        </div>

        <p className="sr-only" aria-live="polite">
          Showing the {currentView} directory.
        </p>

        {currentView === 'mentors' ? (
          <MentorDirectoryComponent />
        ) : (
          <MenteeDirectoryComponent />
        )}
      </div>
    </main>
  )
}

export default DirectoryPage
