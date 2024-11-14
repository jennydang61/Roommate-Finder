import React, { useState } from 'react';
import botProfile from './images/botProfile.png';
import './createAccount.css';

function CreateAccount() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload
    console.log('User Details:', { name, email, password });

    // validate inputs
    if (!name || !email || !password) {
      alert('All fields are required!');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    alert('Account created successfully!');
  };

  return (
    <main className="create-account-container">
      <div className="content-wrapper">
        <header className="logo-wrapper">
          <h1 className="logo">LOGO</h1>
        </header>
        <section className="main-content">
          <div className="content-columns">
            <div className="image-column">
              <img className="bot-profile" src={botProfile} alt="Bot Profile" />
            </div>

            <div className="form-column">
              <div className="form-content">
                <h2 className="form-title">Create account</h2>
                <form onSubmit={handleSubmit}>

                  {/* name input */}
                  <div>
                    <label htmlFor="fullName" className="input-label">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      className="input-field"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* email input */}
                  <div>
                    <label htmlFor="emailAddress" className="input-label">Email Address</label>
                    <input
                      type="email"
                      id="emailAddress"
                      className="input-field"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  {/* password input */}
                  <div>
                    <label htmlFor="password" className="input-label">Password</label>
                    <input
                      type="password"
                      id="password"
                      className="input-field"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <button type="submit" className="sign-up-button">
                    Sign Up
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default CreateAccount;