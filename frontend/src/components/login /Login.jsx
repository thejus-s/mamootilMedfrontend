// Login.jsx
import React, { useState } from 'react';
import styles from './Login.module.css';
import api from '../../api';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    // rememberMe: false
  });

  const [validation, setValidation] = useState({
    email: {
      isValid: false,
      error: '',
      touched: false
    },
    password: {
      isValid: false,
      error: '',
      touched: false
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Email validation rules
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    return { isValid: true, error: '' };
  };

  // Password validation - only required check
  const validatePassword = (password) => {
    if (!password) {
      return { 
        isValid: false, 
        error: 'Password is required'
      };
    }
    
    return { isValid: true, error: '' };
  };

  // Real-time validation on input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Only validate if field has been touched or form has been submitted
    if (validation[name].touched || formSubmitted) {
      let validationResult;
      
      if (name === 'email') {
        validationResult = validateEmail(fieldValue);
      } else if (name === 'password') {
        validationResult = validatePassword(fieldValue);
      }

      setValidation(prev => ({
        ...prev,
        [name]: {
          ...prev[name],
          ...validationResult,
          touched: true
        }
      }));
    }
  };

  // Mark field as touched on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    let validationResult;
    if (name === 'email') {
      validationResult = validateEmail(value);
    } else if (name === 'password') {
      validationResult = validatePassword(value);
    }

    setValidation(prev => ({
      ...prev,
      [name]: {
        ...validationResult,
        touched: true
      }
    }));
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Validate all fields
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);

    setValidation({
      email: { ...emailValidation, touched: true },
      password: { ...passwordValidation, touched: true }
    });

    // Check if form is valid
    if (emailValidation.isValid && passwordValidation.isValid) {
      setIsLoading(true);

      api.post("login/",formData)
      .then((res) => {
        if (res.status == 200){
          if (res.data.error) {
              toast.error(res.data.error);
          } else {
              localStorage.setItem("access_token", res.data.access_token);
              localStorage.setItem("refresh_token", res.data.refresh_token);
              toast.success("Login Successful!");
              window.location.href = "/sales-entry";
          }
        }
      })
      .catch((error) => {
            const errorMsg = error.response?.data?.error || "Invalid Username or Password";
            toast.error(errorMsg);
            console.error(error);
        })
      .finally(() => {
            setIsLoading(false)
        })

    }
  };

  // Check if form is valid
  const isFormValid = validation.email.isValid && validation.password.isValid;

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>💊</span>
            <h1 className={styles.logoText}>MamootilMedicals</h1>
          </div>
          <h2 className={styles.title}>Secure Login</h2>
          <p className={styles.subtitle}>Access your pharmaceutical dashboard</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              Email Address
              {validation.email.touched && validation.email.isValid && (
                <span className={styles.success}>
                  <span className={styles.successIcon}>✓</span>
                </span>
              )}
            </label>
            <div className={styles.inputContainer}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your work email"
                className={`${styles.input} ${
                  validation.email.touched
                    ? validation.email.isValid
                      ? styles.inputValid
                      : styles.inputError
                    : ''
                }`}
                disabled={isLoading}
              />
              <span className={styles.inputIcon}>📧</span>
            </div>
            {validation.email.touched && validation.email.error && (
              <div className={styles.error}>
                <span className={styles.errorIcon}>⚠️</span>
                {validation.email.error}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">
              Password
              {validation.password.touched && validation.password.isValid && (
                <span className={styles.success}>
                  <span className={styles.successIcon}>✓</span>
                  
                </span>
              )}
            </label>
            <div className={styles.inputContainer}>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={`${styles.input} ${
                  validation.password.touched
                    ? validation.password.isValid
                      ? styles.inputValid
                      : styles.inputError
                    : ''
                }`}
                disabled={isLoading}
              />
              <span className={styles.inputIcon}>🔒</span>
            </div>
            {validation.password.touched && validation.password.error && (
              <div className={styles.error}>
                <span className={styles.errorIcon}>⚠️</span>
                {validation.password.error}
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className={styles.rememberForgot}>
            <a href="/forgot-password" className={styles.forgotLink}>
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || (!isFormValid && formSubmitted)}
          >
            {isLoading ? (
              <>
                <span className={styles.loadingSpinner}></span>
                Signing in...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <p>
            New to MamootilMedicals?{' '}
            <a href="/signup">Request Access</a>
          </p>
          {/* <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
            For security compliance: All login attempts are logged and monitored
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Login;