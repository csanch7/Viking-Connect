import axios from 'axios'
import { useState, type SubmitEvent } from 'react'
import emailService from '../../services/emailService'
import type { EmailRequest } from '../../../../shared/contracts'

interface ApiErrorResponse {
  message?: string
}

function ContactUsForm() {
  const [sender, setSender] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const emailRequest: EmailRequest = {
      sender: sender.trim(),
      subject: subject.trim(),
      body: body.trim(),
    }

    if (!emailRequest.sender || !emailRequest.subject || !emailRequest.body) {
      setError('Email, subject, and message are required')
      return
    }

    setIsSubmitting(true)
    setError('')
    setMessage('')

    try {
      const response = await emailService.sendContactUsEmail(emailRequest)
      setMessage(response.message)
      setSender('')
      setSubject('')
      setBody('')
    } catch (caughtError) {
      setError(
        axios.isAxiosError<ApiErrorResponse>(caughtError)
          ? (caughtError.response?.data.message ?? 'Unable to send message')
          : 'Unable to send message',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {error && (
        <p className="contact-form-alert" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="contact-form-success" role="status">
          {message}
        </p>
      )}
      <label className="contact-form-field" htmlFor="contact-email">
        <span>Email</span>
        <input
          id="contact-email"
          type="email"
          value={sender}
          onChange={(event) => setSender(event.target.value)}
          autoComplete="email"
          maxLength={254}
          required
        />
      </label>
      <label className="contact-form-field" htmlFor="contact-subject">
        <span className="contact-form-label-row">
          <span>Subject</span>
          <small>{subject.length}/120</small>
        </span>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          maxLength={120}
          required
        />
      </label>
      <label className="contact-form-field" htmlFor="contact-message">
        <span className="contact-form-label-row">
          <span>Message</span>
          <small>{body.length}/5000</small>
        </span>
        <textarea
          id="contact-message"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={6}
          maxLength={5000}
          required
        />
      </label>
      <button
        className="contact-form-submit"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : 'Send message'}
      </button>
    </form>
  )
}

export default ContactUsForm
