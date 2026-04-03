function Toast({ message, type }) {
  return (
    <div className={`toast toast-${type}`} role="alert">
      {message}
    </div>
  )
}

export default Toast
