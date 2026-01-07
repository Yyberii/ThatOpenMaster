import * as React from 'react';

interface ErrorModalContextType {
  show: (message: string) => void;
}

export const ErrorModalContext = React.createContext<ErrorModalContextType | undefined>(undefined);

export function useErrorModal() {
  const context = React.useContext(ErrorModalContext);
  if (!context) {
    throw new Error('useErrorModal must be used within ErrorModalProvider');
  }
  return context;
}

export function ErrorModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  const show = (msg: string) => {
    setMessage(msg);
    setIsOpen(true);
  };

  React.useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (!isOpen && dialogRef.current) {
      dialogRef.current.close();
    }
  }, [isOpen]);

  return (
    <ErrorModalContext.Provider value={{ show }}>
      {children}
      <dialog
        ref={dialogRef}
        style={{
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClose={() => setIsOpen(false)}
      >
        <div
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            rowGap: 20,
            alignItems: 'center',
            minWidth: '300px',
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{ fontSize: 50, color: 'red' }}
          >
            error
          </span>
          <p style={{ textAlign: 'center', color: 'royalblue' }}>{message}</p>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgb(200, 50, 50)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>
      </dialog>
    </ErrorModalContext.Provider>
  );
}