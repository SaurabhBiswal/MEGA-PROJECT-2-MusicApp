import React, { useState } from 'react';
import '../styles/ForgotPassword.css';

const ForgotPassword = ({ onBackToLogin }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Reset, 3: Success
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [tokenVerified, setTokenVerified] = useState(false);

  // Request password reset - FIXED
  const handleRequestReset = async () => {
    if (!email) {
      setMessage({ text: 'Please enter your email address', type: 'error' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // ✅ FIXED: Use query parameter instead of JSON body
      const response = await fetch(`https://mega-project-2-musicapp-production.up.railway.app/api/auth/forgot-password?email=${encodeURIComponent(email)}`, {
        method: 'POST'
        // No headers needed for query params
      });

      const result = await response.json();

      if (result.status === 'success') {
        // For demo purposes, show the token
        if (result.data && result.data.token) {
          setResetToken(result.data.token);
          setMessage({
            text: `Password reset token generated. For demo: ${result.data.token.substring(0, 20)}...`,
            type: 'success'
          });
          console.log('🔑 Full reset token:', result.data.token);
          console.log('📧 Email:', email);
        } else {
          setMessage({
            text: 'Password reset instructions sent. Check your email.',
            type: 'success'
          });
        }
        
        // Move to reset step
        setTimeout(() => {
          setStep(2);
          setMessage({ text: 'Enter the reset token and new password', type: 'info' });
        }, 2000);
      } else {
        setMessage({ text: result.message || 'Failed to send reset instructions', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verify reset token - FIXED
  const handleVerifyToken = async () => {
    if (!resetToken) {
      setMessage({ text: 'Please enter the reset token', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // ✅ FIXED: Use correct endpoint
      const response = await fetch(`https://mega-project-2-musicapp-production.up.railway.app/api/auth/verify-reset-token/${encodeURIComponent(resetToken)}`);
      const result = await response.json();

      if (result.status === 'success') {
        setTokenVerified(true);
        setMessage({ text: 'Token verified successfully', type: 'success' });
      } else {
        setMessage({ text: result.message || 'Invalid token', type: 'error' });
        setTokenVerified(false);
      }
    } catch (error) {
      setMessage({ text: 'Error verifying token', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Reset password - FIXED
  const handleResetPassword = async () => {
    // Validation
    if (!resetToken) {
      setMessage({ text: 'Reset token is required', type: 'error' });
      return;
    }

    if (!newPassword || !confirmPassword) {
      setMessage({ text: 'Please enter and confirm your new password', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // ✅ FIXED: Use query parameters
      const response = await fetch(
        `https://mega-project-2-musicapp-production.up.railway.app/api/auth/reset-password?token=${encodeURIComponent(resetToken)}&newPassword=${encodeURIComponent(newPassword)}&confirmPassword=${encodeURIComponent(confirmPassword)}`, 
        {
          method: 'POST'
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        setMessage({
          text: 'Password reset successfully! You can now login with your new password.',
          type: 'success'
        });
        setStep(3);
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          if (onBackToLogin) onBackToLogin();
        }, 3000);
      } else {
        setMessage({ text: result.message || 'Failed to reset password', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Copy token to clipboard (for demo)
  const copyTokenToClipboard = () => {
    if (resetToken) {
      navigator.clipboard.writeText(resetToken);
      setMessage({ text: 'Token copied to clipboard', type: 'success' });
    }
  };

  // Direct token input for testing
  const handleManualToken = (manualToken) => {
    setResetToken(manualToken);
    setMessage({ text: 'Demo token loaded', type: 'success' });
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h2>
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Reset Password'}
            {step === 3 && 'Success!'}
          </h2>
          <p className="forgot-password-subtitle">
            {step === 1 && 'Enter your email to receive a password reset link'}
            {step === 2 && 'Enter the reset token and your new password'}
            {step === 3 && 'Your password has been reset successfully'}
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`message-box message-${message.type}`}>
            <div className="message-icon">
              {message.type === 'success' && '✓'}
              {message.type === 'error' && '✗'}
              {message.type === 'info' && 'ℹ'}
            </div>
            <span>{message.text}</span>
          </div>
        )}

        {/* Debug buttons for testing */}
        {process.env.NODE_ENV === 'development' && step === 2 && (
          <div style={{ 
            background: '#f0f8ff', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '15px',
            border: '1px solid #d0e7ff'
          }}>
            <small style={{ color: '#0066cc', display: 'block', marginBottom: '5px' }}>
              <strong>🔧 Developer Tools:</strong>
            </small>
            <button 
              onClick={() => handleManualToken('demo-token-123')}
              style={{
                background: '#e6f3ff',
                border: '1px solid #99ccff',
                padding: '3px 8px',
                marginRight: '5px',
                fontSize: '12px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Load Demo Token
            </button>
            <button 
              onClick={() => navigator.clipboard.readText().then(text => setResetToken(text))}
              style={{
                background: '#fff0e6',
                border: '1px solid #ffcc99',
                padding: '3px 8px',
                fontSize: '12px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Paste from Clipboard
            </button>
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 1 && (
          <div className="forgot-password-step">
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                disabled={loading}
                className="forgot-input"
                autoFocus
              />
            </div>

            <button
              onClick={handleRequestReset}
              disabled={loading || !email}
              className="forgot-button primary"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending Reset Instructions...
                </>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </div>
        )}

        {/* Step 2: Reset Password */}
        {step === 2 && (
          <div className="forgot-password-step">
            <div className="input-group">
              <label htmlFor="resetToken">
                Reset Token
                {resetToken && (
                  <button
                    type="button"
                    onClick={copyTokenToClipboard}
                    className="copy-token-btn"
                    title="Copy to clipboard"
                    style={{ marginLeft: '10px' }}
                  >
                    📋 Copy Token
                  </button>
                )}
              </label>
              <input
                id="resetToken"
                type="text"
                value={resetToken}
                onChange={(e) => {
                  setResetToken(e.target.value);
                  setTokenVerified(false);
                }}
                placeholder="Enter the reset token from your email"
                disabled={loading}
                className="forgot-input"
                autoFocus
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={handleVerifyToken}
                  disabled={loading || !resetToken}
                  className="verify-token-btn"
                >
                  {loading ? 'Verifying...' : 'Verify Token'}
                </button>
                
                {tokenVerified && (
                  <span style={{ 
                    color: '#28a745', 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                disabled={loading || !tokenVerified}
                className="forgot-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                disabled={loading || !tokenVerified}
                className="forgot-input"
              />
            </div>

            <div className="password-requirements">
              <p>Password Requirements:</p>
              <ul>
                <li className={newPassword.length >= 6 ? 'met' : ''}>
                  At least 6 characters
                </li>
                <li className={newPassword === confirmPassword && newPassword ? 'met' : ''}>
                  Passwords match
                </li>
                <li className={tokenVerified ? 'met' : ''}>
                  Token verified
                </li>
              </ul>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading || !tokenVerified || !newPassword || !confirmPassword}
              className="forgot-button primary"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="success-step">
            <div className="success-icon">✓</div>
            <p className="success-message">
              Your password has been reset successfully!
            </p>
            <p className="redirect-message">
              Redirecting to login page in 3 seconds...
            </p>
            <button
              onClick={onBackToLogin}
              className="forgot-button secondary"
            >
              Go to Login Now
            </button>
          </div>
        )}

        {/* Back to Login */}
        <div className="forgot-password-footer">
          <button
            onClick={onBackToLogin}
            className="back-to-login-btn"
            disabled={loading}
          >
            ← Back to Login
          </button>
          {step === 2 && (
            <button
              onClick={() => {
                setStep(1);
                setResetToken('');
                setTokenVerified(false);
                setMessage({ text: '', type: '' });
              }}
              className="back-to-email-btn"
              disabled={loading}
            >
              ← Use Different Email
            </button>
          )}
        </div>

        {/* Demo Note */}
        <div className="demo-note">
          <small>
            <strong>💡 Demo Instructions:</strong><br/>
            1. Enter your registered email<br/>
            2. Check browser console for reset token<br/>
            3. Copy token and paste it in the form<br/>
            4. Verify token, then set new password
          </small>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

