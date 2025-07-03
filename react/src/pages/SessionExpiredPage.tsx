import { useEffect } from "react";

export default function SessionExpiredPage() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <style>{`
        .spinner {
          border: 4px solid rgba(0, 0, 255, 0.2);
          border-top: 4px solid blue;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #f9fafb;
          font-size: 1.25rem;
          font-weight: 500;
          color: #374151;
          font-family: Arial, sans-serif;
        }
      `}</style>

      <div className="container">
        <div className="spinner" />
        Session expired. Redirecting to login...
      </div>
    </>
  );
}
