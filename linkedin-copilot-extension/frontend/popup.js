console.log('Popup script loaded');

// Function to handle the OAuth callback
function handleCallback() {
    console.log('Handling callback');
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    console.log('URL params:', { token, error });

    const statusDiv = document.getElementById('status');
    
    if (error) {
        statusDiv.textContent = `Error: ${error}`;
        statusDiv.className = 'status error';
        return;
    }

    if (token) {
        // Store the token in chrome.storage
        chrome.storage.local.set({ 'authToken': token }, function() {
            console.log('Token stored successfully');
            statusDiv.textContent = 'Successfully logged in!';
            statusDiv.className = 'status success';
            
            // Update UI for logged in state
            updateUIForLoggedInState();
            
            // Close the popup after 2 seconds
            setTimeout(() => {
                window.close();
            }, 2000);
        });
    }
}

// Function to initiate Google OAuth login
function initiateLogin() {
    console.log('Initiating login');
    const authUrl = 'http://localhost:3000/api/auth/google';
    console.log('Opening URL:', authUrl);
    
    chrome.tabs.create({ url: authUrl }, (tab) => {
        console.log('New tab created:', tab);
        
        // Listen for the callback
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
            if (tabId === tab.id && changeInfo.status === 'complete') {
                // Check if this is our callback URL
                if (tab.url && tab.url.startsWith('http://localhost:3000/api/auth/google/callback')) {
                    // Remove the listener
                    chrome.tabs.onUpdated.removeListener(listener);
                    
                    // Get the token from the URL
                    const url = new URL(tab.url);
                    const token = url.searchParams.get('token');
                    
                    if (token) {
                        // Store the token
                        chrome.storage.local.set({ 'authToken': token }, function() {
                            // Close the OAuth tab
                            chrome.tabs.remove(tabId);
                            
                            // Update the popup
                            updateUIForLoggedInState();
                        });
                    }
                }
            }
        });
    });
}

// Function to handle logout
function handleLogout() {
    console.log('Logging out');
    chrome.storage.local.remove(['authToken'], function() {
        console.log('Token removed');
        // Force reload the popup to ensure clean state
        window.location.reload();
    });
}

// Function to update UI for logged in state
function updateUIForLoggedInState() {
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const userInfo = document.getElementById('userInfo');
    const statusDiv = document.getElementById('status');
    
    loginButton.style.display = 'none';
    logoutButton.style.display = 'block';
    userInfo.style.display = 'block';
    statusDiv.textContent = 'Loading user info...';
    statusDiv.className = 'status';
    
    // Fetch user info
    chrome.storage.local.get(['authToken'], function(result) {
        if (result.authToken) {
            console.log('Making request with token:', result.authToken);
            fetch('http://localhost:3000/api/auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${result.authToken}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(async response => {
                console.log('Response status:', response.status);
                const text = await response.text();
                console.log('Response text:', text);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
                }
                
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('Failed to parse JSON:', e);
                    throw new Error('Invalid JSON response');
                }
            })
            .then(user => {
                console.log('User data:', user);
                document.getElementById('userName').textContent = user.name;
                document.getElementById('userEmail').textContent = user.email;
                statusDiv.textContent = 'Logged in';
                statusDiv.className = 'status success';
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
                statusDiv.textContent = 'Error loading user info';
                statusDiv.className = 'status error';
            });
        } else {
            console.log('No auth token found');
            statusDiv.textContent = 'No auth token found';
            statusDiv.className = 'status error';
        }
    });
}

// Function to update UI for logged out state
function updateUIForLoggedOutState() {
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const userInfo = document.getElementById('userInfo');
    const statusDiv = document.getElementById('status');
    
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
    userInfo.style.display = 'none';
    statusDiv.textContent = 'Logged out';
    statusDiv.className = 'status';
}

// Initialize popup
document.addEventListener('DOMContentLoaded', function() {
    // Add click handler for login button
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    
    console.log('Login button element:', loginButton);
    console.log('Logout button element:', logoutButton);
    
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            console.log('Login button clicked');
            initiateLogin();
        });
    } else {
        console.error('Login button not found!');
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log('Logout button clicked');
            handleLogout();
        });
    } else {
        console.error('Logout button not found!');
    }

    // Check if we have a token in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    console.log('Token from URL:', token);

    if (token) {
        console.log('Found token in URL, storing it...');
        chrome.storage.local.set({ 'authToken': token }, function() {
            console.log('Token stored from URL');
            // Clear the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            // Update UI for logged in state
            updateUIForLoggedInState();
        });
    } else {
        // Check if user is already logged in
        chrome.storage.local.get(['authToken'], function(result) {
            console.log('Checking auth token:', result);
            if (result.authToken) {
                updateUIForLoggedInState();
            } else {
                updateUIForLoggedOutState();
            }
        });
    }
}); 