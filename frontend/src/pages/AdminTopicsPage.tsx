import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import ConfirmationDialog from '../components/ConfirmationDialog'
import LoadingPage from '../components/LoadingPage'
import {
  activeTopicsQueryKey,
  topicsQueryKey,
  useTopicsQuery,
} from '../hooks/useDirectoryQueries'
import topicService from '../services/topicService'
import type { Topic } from '../../../shared/contracts'

function AdminTopicsPage() {
  const [topicText, setTopicText] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [topicStatusMessage, setTopicStatusMessage] = useState('')
  const [topicUpdateError, setTopicUpdateError] = useState<{
    id: string
    message: string
  } | null>(null)
  const [confirmationTopic, setConfirmationTopic] = useState<string | null>(
    null,
  )
  const [confirmationError, setConfirmationError] = useState('')
  const queryClient = useQueryClient()
  const topicsQuery = useTopicsQuery()
  const topics = topicsQuery.data ?? []

  const addTopicMutation = useMutation({
    mutationFn: topicService.addTopic,
    onSuccess: (createdTopic) => {
      queryClient.setQueryData<Topic[]>(topicsQueryKey, (currentTopics = []) =>
        [...currentTopics, createdTopic].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      )
      void queryClient.invalidateQueries({ queryKey: activeTopicsQueryKey })
      setTopicText('')
      setError('')
      setMessage(`${createdTopic.name} was added to the topic library.`)
      setConfirmationTopic(null)
      setConfirmationError('')
    },
  })

  const updateTopicMutation = useMutation({
    mutationFn: (id: string) => topicService.updateTopic(id),
    onMutate: (id) => {
      setTopicStatusMessage('')
      setTopicUpdateError((currentError) =>
        currentError?.id === id ? null : currentError,
      )
    },
    onSuccess: (isActive, id) => {
      const updatedTopic = topics.find((topic) => topic.id === id)

      queryClient.setQueryData<Topic[]>(topicsQueryKey, (currentTopics = []) =>
        currentTopics.map((topic) =>
          topic.id === id ? { ...topic, is_active: isActive } : topic,
        ),
      )
      void queryClient.invalidateQueries({ queryKey: activeTopicsQueryKey })
      setTopicUpdateError(null)
      setTopicStatusMessage(
        `${updatedTopic?.name ?? 'Topic'} is now ${
          isActive
            ? 'available in registration and filters'
            : 'hidden from registration and filters'
        }.`,
      )
    },
    onError: (_mutationError, id) => {
      const topicName = topics.find((topic) => topic.id === id)?.name ?? 'topic'
      setTopicUpdateError({
        id,
        message: `We could not update ${topicName}. Try again.`,
      })
    },
  })

  if (topicsQuery.isPending) {
    return <LoadingPage />
  }

  function addTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const topic = topicText.trim()

    setMessage('')

    if (!topic) {
      setError('Enter a topic name.')
      return
    }

    if (
      topics.some(
        (existingTopic) =>
          existingTopic.name.toLowerCase() === topic.toLowerCase(),
      )
    ) {
      setError('That topic is already in the library.')
      return
    }

    setError('')
    setConfirmationError('')
    setConfirmationTopic(topic)
  }

  async function confirmAddTopic() {
    if (!confirmationTopic) return

    try {
      await addTopicMutation.mutateAsync(confirmationTopic)
    } catch {
      setConfirmationError('We could not add this topic. Please try again.')
    }
  }

  function cancelAddTopic() {
    setConfirmationTopic(null)
    setConfirmationError('')
  }

  return (
    <main className="admin-page admin-topics-page">
      <section
        className="admin-hero admin-topics-hero"
        aria-labelledby="topics-page-title"
      >
        <Link className="admin-back-link" to="/admin">
          <span aria-hidden="true">←</span>
          Back to admin page
        </Link>
        <p className="admin-kicker">Program settings</p>
        <h1 id="topics-page-title">Topic library</h1>
        <p>
          Review the interests members can select for their profiles and use to
          find relevant mentorship connections.
        </p>
      </section>

      {topicsQuery.isError ? (
        <section className="admin-topics-error" aria-labelledby="topics-error">
          <span className="admin-topics-error-icon" aria-hidden="true">
            !
          </span>
          <div>
            <h2 id="topics-error">Topics could not be loaded</h2>
            <p>
              There was a problem reaching the topic library. Try loading it
              again.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void topicsQuery.refetch()}
            disabled={topicsQuery.isFetching}
          >
            {topicsQuery.isFetching ? 'Trying again…' : 'Try again'}
          </button>
        </section>
      ) : (
        <div className="admin-topics-layout">
          <section
            className="admin-topics-panel"
            aria-labelledby="topic-list-title"
          >
            <header className="admin-topics-panel-header">
              <div>
                <span className="admin-card-kicker">Current collection</span>
                <h2 id="topic-list-title">Available topics</h2>
              </div>
              <span
                className="admin-topics-count"
                aria-label={`${topics.length} ${topics.length === 1 ? 'topic' : 'topics'}`}
              >
                {topics.length}
              </span>
            </header>

            <form className="admin-topic-form" onSubmit={addTopic}>
              <label className="admin-topic-form-label" htmlFor="add-topic">
                <span>Add a topic</span>
                <small>Use a concise interest or area of expertise.</small>
              </label>
              <div className="admin-topic-form-controls">
                <input
                  id="add-topic"
                  type="text"
                  value={topicText}
                  onChange={(event) => setTopicText(event.target.value)}
                  maxLength={80}
                  aria-describedby={
                    error
                      ? 'add-topic-error'
                      : message
                        ? 'add-topic-status'
                        : undefined
                  }
                  disabled={addTopicMutation.isPending}
                  required
                />
                <button type="submit" disabled={addTopicMutation.isPending}>
                  {addTopicMutation.isPending ? 'Adding…' : 'Add topic'}
                </button>
              </div>
              {error && (
                <p
                  className="admin-topic-form-message admin-topic-form-message--error"
                  id="add-topic-error"
                  role="alert"
                >
                  {error}
                </p>
              )}
              {message && (
                <p
                  className="admin-topic-form-message admin-topic-form-message--success"
                  id="add-topic-status"
                  role="status"
                >
                  {message}
                </p>
              )}
            </form>

            {topics.length > 0 ? (
              <ol className="admin-topic-list" aria-label="Available topics">
                {topics.map((topic) => {
                  const isUpdating =
                    updateTopicMutation.isPending &&
                    updateTopicMutation.variables === topic.id
                  const updateError =
                    topicUpdateError?.id === topic.id
                      ? topicUpdateError.message
                      : null

                  return (
                    <li
                      className={`admin-topic-row${topic.is_active ? '' : ' admin-topic-row--inactive'}`}
                      key={topic.id}
                      aria-busy={isUpdating}
                    >
                      <span className="admin-topic-marker" aria-hidden="true" />
                      <div className="admin-topic-copy">
                        <h3>{topic.name}</h3>
                        {updateError && (
                          <p className="admin-topic-update-error" role="alert">
                            {updateError}
                          </p>
                        )}
                      </div>
                      <button
                        className="admin-topic-status"
                        type="button"
                        aria-pressed={topic.is_active}
                        aria-label={`${topic.name} availability`}
                        disabled={updateTopicMutation.isPending}
                        onClick={() => updateTopicMutation.mutate(topic.id)}
                      >
                        {isUpdating
                          ? 'Updating…'
                          : topic.is_active
                            ? 'Active'
                            : 'Inactive'}
                      </button>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <div className="admin-topics-empty" aria-live="polite">
                <span aria-hidden="true">＋</span>
                <h3>No topics available</h3>
                <p>Add the first topic using the form above.</p>
              </div>
            )}
          </section>

          <aside className="admin-topics-context" aria-labelledby="topics-use">
            <span className="admin-card-kicker">Across Viking Connect</span>
            <h2 id="topics-use">How topics are used</h2>
            <p>
              A focused topic library keeps profiles consistent and makes mentor
              discovery easier to scan.
            </p>
            <ul>
              <li>
                <span aria-hidden="true">1</span>
                Selected during registration
              </li>
              <li>
                <span aria-hidden="true">2</span>
                Displayed on member profiles
              </li>
              <li>
                <span aria-hidden="true">3</span>
                Used to filter the directories
              </li>
            </ul>
          </aside>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {topicStatusMessage}
      </p>

      <ConfirmationDialog
        open={Boolean(confirmationTopic)}
        title="Add this topic?"
        confirmLabel="Confirm topic"
        pendingLabel="Adding topic…"
        pending={addTopicMutation.isPending}
        error={confirmationError}
        icon="+"
        tone="neutral"
        onCancel={cancelAddTopic}
        onConfirm={() => void confirmAddTopic()}
      >
        {confirmationTopic && (
          <p>
            <strong>{confirmationTopic}</strong> will become available in
            registration, member profiles, and directory filters.
          </p>
        )}
      </ConfirmationDialog>
    </main>
  )
}

export default AdminTopicsPage
