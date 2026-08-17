import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import MenteeDirectoryComponent from '../components/user/MenteeDirectoryComponent'
import MentorDirectoryComponent from '../components/user/MentorDirectoryComponent'

type DirectoryView = 'mentors' | 'mentees'

function DirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedView = searchParams.get('view')
  const currentView: DirectoryView =
    requestedView === 'mentees' ? 'mentees' : 'mentors'

  useEffect(() => {
    if (requestedView === 'mentors' || requestedView === 'mentees') return

    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams)
        nextParams.set('view', 'mentors')
        return nextParams
      },
      { replace: true },
    )
  }, [requestedView, setSearchParams])

  function changeView(view: DirectoryView) {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams)
      nextParams.set('view', view)
      return nextParams
    })
  }

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
            onClick={() => changeView('mentors')}
          >
            Mentors
          </button>
          <button
            type="button"
            aria-pressed={currentView === 'mentees'}
            onClick={() => changeView('mentees')}
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
