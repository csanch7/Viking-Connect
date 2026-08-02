import { useEffect, useId, useRef, type ReactNode } from 'react'

interface ConfirmationDialogProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  pendingLabel: string
  pending: boolean
  error?: string
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmationDialog({
  open,
  title,
  children,
  confirmLabel,
  pendingLabel,
  pending,
  error,
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="confirmation-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault()
        if (!pending) onCancel()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) onCancel()
      }}
    >
      <div className="confirmation-dialog-content">
        <div className="confirmation-dialog-icon" aria-hidden="true">
          !
        </div>
        <div>
          <h2 id={titleId}>{title}</h2>
          <div id={descriptionId} className="confirmation-dialog-description">
            {children}
          </div>
        </div>
      </div>

      {error && (
        <p className="confirmation-dialog-error" role="alert">
          {error}
        </p>
      )}

      <div className="confirmation-dialog-actions">
        <button
          className="confirmation-dialog-cancel"
          type="button"
          onClick={onCancel}
          disabled={pending}
          autoFocus
        >
          Cancel
        </button>
        <button
          className="confirmation-dialog-confirm"
          type="button"
          onClick={onConfirm}
          disabled={pending}
        >
          {pending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

export default ConfirmationDialog
