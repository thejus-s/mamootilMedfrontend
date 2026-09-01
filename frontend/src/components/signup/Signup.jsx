// src/components/signup/Signup.jsx
import React, { useState } from 'react';
import styles from './Signup.module.css';
import Select from "react-select";
import { components } from "react-select";
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { toast } from 'react-hot-toast';


const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        city: '',
        state: '',
        address: '',
        phone: '',
        pincode: '',
        store_name: '',
        agreeToTerms: false
    });

    const DropdownIndicator = (props) => (
        <components.DropdownIndicator {...props}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="#6c757d"
                viewBox="0 0 16 16"
            >
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
            </svg>
        </components.DropdownIndicator>
    );

    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: "white",
            borderColor: state.isFocused ? "#2e7d32" : "#ced4da",
            borderWidth: "1px",
            borderRadius: "8px",
            minHeight: "42px",
            paddingLeft: "10px",
            paddingRight: "10px",
            boxShadow: state.isFocused ? "0 0 0 1px #2e7d32" : "none",
            "&:hover": {
                borderColor: "none",
            },
            cursor: "pointer",
        }),

        valueContainer: (base) => ({
            ...base,
            padding: "0 8px",
        }),

        input: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
        }),

        placeholder: (base) => ({
            ...base,
            color: "#6c757d",
        }),

        singleValue: (base) => ({
            ...base,
            color: "#000",
        }),

        dropdownIndicator: (base) => ({
            ...base,
            paddingRight: "8px",
        }),

        indicatorSeparator: () => ({
            display: "none",
        }),

        menu: (base) => ({
            ...base,
            borderRadius: "8px",
            zIndex: 9999,
        }),

        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "#4F46E5"
                : state.isFocused
                    ? "#EEF2FF"
                    : "white",
            color: state.isSelected ? "white" : "#000",
            cursor: "pointer",
            padding: "10px",
            fontSize: "14px",
        }),
    };


    const indianStates = [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
        "Andaman and Nicobar Islands",
        "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi",
        "Jammu and Kashmir",
        "Ladakh",
        "Lakshadweep",
        "Puducherry"
    ];


    const [validation, setValidation] = useState({
        email: { isValid: false, error: '', touched: false },
        password: { isValid: false, error: '', touched: false }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    // Email validation
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim()) {
            return { isValid: false, error: 'Email is required' };
        }

        if (!emailRegex.test(email)) {
            return { isValid: false, error: 'Please enter a valid email address' };
        }

        return { isValid: true, error: '' };
    };

    // Password validation
    const validatePassword = (password) => {
        const rules = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        if (!password) {
            return {
                isValid: false,
                error: 'Password is required',
                rules
            };
        }

        const isValid = Object.values(rules).every(rule => rule);
        const error = isValid ? '' : 'Password must contain an uppercase,lowercase,numbers and special charcters ';

        return { isValid, error, rules };
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: fieldValue
        }));

        // Real-time validation for email and password only
        if (['email', 'password'].includes(name) && (validation[name].touched || formSubmitted)) {
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

    const handleBlur = (e) => {
        const { name, value } = e.target;

        // Only validate email and password on blur
        if (['email', 'password'].includes(name)) {
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
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);

        // Validate only email and password
        const emailValidation = validateEmail(formData.email);
        const passwordValidation = validatePassword(formData.password);

        setValidation({
            email: { ...emailValidation, touched: true },
            password: { ...passwordValidation, touched: true }
        });

        // Check if email and password are valid
        if (emailValidation.isValid && passwordValidation.isValid) {
            setIsLoading(true);

            try {
                const response = await api.post('signup/', formData);

                console.log('Signup successful:', response.data);
                toast.success('Account created successfully! Redirecting to login...');
                navigate('/');

            } catch (error) {
                console.error('Signup error:', error.response?.data || error.message);
                toast.error('Signup failed. Please try again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            // Scroll to first error (email or password)
            const firstErrorField = emailValidation.isValid ? 'password' : 'email';
            const element = document.getElementById(firstErrorField);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
        }
    };

    const isFormValid = validation.email.isValid && validation.password.isValid;
    const passwordRules = validation.password.rules || {
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
    };

    return (
        <div className={styles.container}>
            <div className={styles.signupCard}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>🏥</span>
                        <h1 className={styles.logoText}>MamootilMedicals</h1>
                    </div>
                    <h2 className={styles.title}>Create Pharmacy Account</h2>
                    <p className={styles.subtitle}>Register your pharmacy store</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {/* Personal Information Section */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Personal Information</h3>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="first_name">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your first name"
                                    className={styles.input}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="last_name">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your last name"
                                    className={styles.input}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="username">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Choose a username"
                                    className={styles.input}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="email">
                                    Email Address *
                                    {validation.email.touched && validation.email.isValid && (
                                        <span className={styles.success}>✓</span>
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
                                        placeholder="Enter your email"
                                        className={`${styles.input} ${validation.email.touched
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
                                    <div className={styles.error}>{validation.email.error}</div>
                                )}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="password">
                                Password *
                                {validation.password.touched && validation.password.isValid && (
                                    <span className={styles.success}>✓</span>
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
                                    placeholder="Create a strong password"
                                    className={`${styles.input} ${validation.password.touched
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
                                <div className={styles.error}>{validation.password.error}</div>
                            )}
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Contact Information</h3>
                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="phone">
                                    Phone Number
                                </label>
                                <div className={styles.inputContainer}>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                        className={styles.input}
                                        disabled={isLoading}
                                    />
                                    <span className={styles.inputIcon}>📱</span>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="pincode">
                                    Pincode
                                </label>
                                <input
                                    type="text"
                                    id="pincode"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    placeholder="Enter pincode"
                                    className={styles.input}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="address">
                                Address
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Enter your complete address"
                                className={styles.textarea}
                                disabled={isLoading}
                                rows="3"
                            />
                        </div>

                        <div className={styles.row}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="city">
                                    City
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="Enter your city"
                                    className={styles.input}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="state">
                                    State
                                </label>
                                <Select
                                    id="state"
                                    name="state"
                                    isSearchable
                                    placeholder="Select State"
                                    styles={customSelectStyles}
                                    components={{ DropdownIndicator }}
                                    value={
                                        formData.state
                                            ? { label: formData.state, value: formData.state }
                                            : null
                                    }
                                    onChange={(selected) =>
                                        handleInputChange({
                                            target: { name: "state", value: selected.value }
                                        })
                                    }
                                    options={indianStates.map(s => ({ label: s, value: s }))}
                                    isDisabled={isLoading}
                                />



                            </div>
                        </div>
                    </div>

                    {/* Pharmacy Information Section */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Pharmacy Information</h3>
                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="store_name">
                                Pharmacy/Store Name
                            </label>
                            <input
                                type="text"
                                id="store_name"
                                name="store_name"
                                value={formData.store_name}
                                onChange={handleInputChange}
                                placeholder="Enter your pharmacy/store name"
                                className={styles.input}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className={styles.section}>
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleInputChange}
                                    className={styles.checkbox}
                                    disabled={isLoading}
                                />
                                <span>
                                    I agree to the <a href="/terms" className={styles.termsLink}>Terms and Conditions</a> and{' '}
                                    <a href="/privacy" className={styles.termsLink}>Privacy Policy</a>
                                </span>
                            </label>
                        </div>
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
                                Creating Account...
                            </>
                        ) : (
                            'Create Pharmacy Account'
                        )}
                    </button>

                    {/* Login Link */}
                    <div className={styles.loginLink}>
                        Already have an account? <a href="/" className={styles.link}>Sign In</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;