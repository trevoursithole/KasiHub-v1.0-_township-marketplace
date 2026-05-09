import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((icon, title, body, duration = 3000) => {
    setToast({ icon, title, body, visible: true })
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast(t => t ? { ...t, visible: false } : null), duration)
  }, [])

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      {toast && (
        <div className={`toast ${toast.visible ? 'visible' : ''}`}>
          <span style={{ fontSize: 20 }}>{toast.icon}</span>
          <div>
            <div className="toast-title">{toast.title}</div>
            {toast.body && <div className="toast-body">{toast.body}</div>}
          </div>
        </div>
      )}
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
