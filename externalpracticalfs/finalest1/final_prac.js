const { createRoot } = ReactDOM;

function App() {
    const username = 'alex_09';
    return (
    <div className="App">
        <h1>My Apps</h1>
        <p>My Apps</p>
        <UserProfile username={username} />
    </div>
    );
}

function NavBar({username}) {
    return (
        <nav>
            <h2>Welcome, {username}!</h2>
            <ul>
                <li>Home</li>
                <li>Settings</li>
            </ul>
        </nav>
    );
}

function UserProfile({username}) {
    return (
        <div className ='profile'>
            <p>Welcome, {username}!</p>
        </div>

    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);