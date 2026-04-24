import { useEffect, useMemo, useState } from 'react';

const API_URL = '/api';

const initialForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  location: '',
  skills: ''
};

const authFromStorage = () => {
  const token = localStorage.getItem('jobPortalToken');
  const user = localStorage.getItem('jobPortalUser');

  if (!token || !user) {
    return { token: '', user: null };
  }

  try {
    return { token, user: JSON.parse(user) };
  } catch {
    localStorage.removeItem('jobPortalToken');
    localStorage.removeItem('jobPortalUser');
    return { token: '', user: null };
  }
};

function App() {
  const storedAuth = useMemo(authFromStorage, []);
  const [page, setPage] = useState('home');
  const [token, setToken] = useState(storedAuth.token);
  const [user, setUser] = useState(storedAuth.user);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState('signin');
  const [form, setForm] = useState(initialForm);

  const appliedJobIds = useMemo(
    () => new Set(applications.map((application) => application.job?._id)),
    [applications]
  );

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (token) {
      loadDashboard(token);
    } else {
      setApplications([]);
    }
  }, [token]);

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong.');
    }

    return data;
  };

  const loadJobs = async () => {
    try {
      setError('');
      const data = await request('/jobs');
      setJobs(data.jobs);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const loadDashboard = async (activeToken = token) => {
    try {
      setError('');
      const response = await fetch(`${API_URL}/applications/me`, {
        headers: {
          Authorization: `Bearer ${activeToken}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load dashboard.');
      }

      setUser(data.user);
      setApplications(data.applications);
      localStorage.setItem('jobPortalUser', JSON.stringify(data.user));
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  const handleFieldChange = (event) => {
    setForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value
    }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setNotice('');

    try {
      const path = authMode === 'signin' ? '/auth/signin' : '/auth/signup';
      const payload =
        authMode === 'signin'
          ? { email: form.email, password: form.password }
          : form;
      const data = await request(path, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      localStorage.setItem('jobPortalToken', data.token);
      localStorage.setItem('jobPortalUser', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      setForm(initialForm);
      setPage('dashboard');
      setNotice(
        authMode === 'signin'
          ? 'Signed in successfully.'
          : 'Account created successfully.'
      );
    } catch (authError) {
      setError(authError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!token) {
      setAuthMode('signin');
      setPage('signin');
      setNotice('Sign in to apply for jobs.');
      return;
    }

    setIsLoading(true);
    setError('');
    setNotice('');

    try {
      await request('/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId })
      });
      await loadDashboard();
      setNotice('Application submitted.');
    } catch (applyError) {
      setError(applyError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('jobPortalToken');
    localStorage.removeItem('jobPortalUser');
    setToken('');
    setUser(null);
    setApplications([]);
    setPage('home');
    setNotice('Signed out.');
  };

  const goToAuth = (mode) => {
    setAuthMode(mode);
    setPage(mode);
    setError('');
    setNotice('');
  };

  return (
    <div className="app-shell">
      <Header
        activePage={page}
        isSignedIn={Boolean(token)}
        onNavigate={setPage}
        onSignIn={() => goToAuth('signin')}
        onSignUp={() => goToAuth('signup')}
        onSignOut={handleSignOut}
      />

      <main>
        {(notice || error) && (
          <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
            {error || notice}
          </div>
        )}

        {page === 'home' && (
          <HomePage
            jobs={jobs}
            appliedJobIds={appliedJobIds}
            isLoading={isLoading}
            isSignedIn={Boolean(token)}
            onApply={handleApply}
          />
        )}

        {(page === 'signin' || page === 'signup') && (
          <AuthPage
            mode={authMode}
            form={form}
            isLoading={isLoading}
            onChange={handleFieldChange}
            onSubmit={handleAuthSubmit}
            onSwitch={goToAuth}
          />
        )}

        {page === 'dashboard' && (
          <DashboardPage
            user={user}
            applications={applications}
            onBrowseJobs={() => setPage('home')}
            onRequireSignIn={() => goToAuth('signin')}
          />
        )}
      </main>
    </div>
  );
}

function Header({
  activePage,
  isSignedIn,
  onNavigate,
  onSignIn,
  onSignUp,
  onSignOut
}) {
  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={() => onNavigate('home')}>
        <span className="brand-mark">T</span>
        <span>TalentTrack</span>
      </button>

      <nav className="site-nav" aria-label="Primary navigation">
        <button
          className={activePage === 'home' ? 'active' : ''}
          type="button"
          onClick={() => onNavigate('home')}
        >
          Home
        </button>
        <button
          className={activePage === 'dashboard' ? 'active' : ''}
          type="button"
          onClick={() => onNavigate('dashboard')}
        >
          Dashboard
        </button>
        {isSignedIn ? (
          <button className="outline-button" type="button" onClick={onSignOut}>
            Sign out
          </button>
        ) : (
          <>
            <button
              className={activePage === 'signin' ? 'active' : ''}
              type="button"
              onClick={onSignIn}
            >
              Sign in
            </button>
            <button className="primary-button small" type="button" onClick={onSignUp}>
              Sign up
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

function HomePage({ jobs, appliedJobIds, isLoading, isSignedIn, onApply }) {
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Job applications made simple</p>
          <h1>TalentTrack</h1>
          <p>
            Browse curated software roles, apply in one click, and track every
            application from a single dashboard.
          </p>
          <div className="hero-stats" aria-label="Portal statistics">
            <span>
              <strong>{jobs.length}</strong>
              Open roles
            </span>
            <span>
              <strong>24h</strong>
              Review window
            </span>
            <span>
              <strong>MERN</strong>
              Stack ready
            </span>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1100&q=80"
            alt=""
          />
        </div>
      </section>

      <section className="jobs-section">
        <div className="section-heading">
          <p className="eyebrow">Apply today</p>
          <h2>Recommended Jobs</h2>
        </div>

        <div className="job-grid">
          {jobs.map((job) => {
            const applied = appliedJobIds.has(job._id);
            return (
              <article className="job-card" key={job._id}>
                <div className="job-card-header">
                  <div>
                    <p className="company">{job.company}</p>
                    <h3>{job.title}</h3>
                  </div>
                  <span className="job-type">{job.type}</span>
                </div>
                <p className="job-description">{job.description}</p>
                <div className="job-meta">
                  <span>{job.location}</span>
                  <span>{job.salary}</span>
                </div>
                <div className="skills-row">
                  {job.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
                <button
                  className={applied ? 'applied-button' : 'primary-button'}
                  type="button"
                  disabled={applied || isLoading}
                  onClick={() => onApply(job._id)}
                >
                  {applied ? 'Applied' : isSignedIn ? 'Apply now' : 'Sign in to apply'}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

function AuthPage({ mode, form, isLoading, onChange, onSubmit, onSwitch }) {
  const isSignup = mode === 'signup';

  return (
    <section className="auth-layout">
      <div className="auth-panel">
        <p className="eyebrow">{isSignup ? 'Create profile' : 'Welcome back'}</p>
        <h1>{isSignup ? 'Sign up' : 'Sign in'}</h1>
        <form className="auth-form" onSubmit={onSubmit}>
          {isSignup && (
            <label>
              Full name
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Anika Sharma"
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Minimum 6 characters"
              minLength="6"
              required
            />
          </label>
          {isSignup && (
            <>
              <label>
                Phone
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+91 98765 43210"
                />
              </label>
              <label>
                Location
                <input
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  placeholder="Chennai, India"
                />
              </label>
              <label>
                Skills
                <input
                  name="skills"
                  value={form.skills}
                  onChange={onChange}
                  placeholder="React, Node.js, MongoDB"
                />
              </label>
            </>
          )}
          <button className="primary-button wide" type="submit" disabled={isLoading}>
            {isLoading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          {isSignup ? 'Already have an account?' : 'New to TalentTrack?'}
          <button
            type="button"
            onClick={() => onSwitch(isSignup ? 'signin' : 'signup')}
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
      <div className="auth-aside" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80"
          alt=""
        />
      </div>
    </section>
  );
}

function DashboardPage({ user, applications, onBrowseJobs, onRequireSignIn }) {
  if (!user) {
    return (
      <section className="empty-state">
        <h1>Dashboard</h1>
        <p>Sign in to see your profile and applied jobs.</p>
        <button className="primary-button" type="button" onClick={onRequireSignIn}>
          Sign in
        </button>
      </section>
    );
  }

  return (
    <section className="dashboard-layout">
      <aside className="profile-panel">
        <div className="avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <dl>
          <div>
            <dt>Phone</dt>
            <dd>{user.phone || 'Not added'}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{user.location || 'Not added'}</dd>
          </div>
          <div>
            <dt>Applied jobs</dt>
            <dd>{applications.length}</dd>
          </div>
        </dl>
        <div className="skills-row profile-skills">
          {(user.skills?.length ? user.skills : ['Profile pending']).map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </aside>

      <div className="applications-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h2>Applied Jobs</h2>
          </div>
          <button className="outline-button" type="button" onClick={onBrowseJobs}>
            Browse jobs
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state compact">
            <h3>No applications yet</h3>
            <p>Find a role on the home page and submit your first application.</p>
            <button className="primary-button" type="button" onClick={onBrowseJobs}>
              Browse jobs
            </button>
          </div>
        ) : (
          <div className="application-list">
            {applications.map((application) => (
              <article className="application-item" key={application._id}>
                <div>
                  <p className="company">{application.job?.company}</p>
                  <h3>{application.job?.title}</h3>
                  <p>
                    {application.job?.location} · {application.job?.type}
                  </p>
                </div>
                <div className="application-status">
                  <span>{application.status}</span>
                  <time dateTime={application.createdAt}>
                    {new Date(application.createdAt).toLocaleDateString()}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default App;
