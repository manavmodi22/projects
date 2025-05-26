const API_BASE_URL = 'http://localhost:3000/api';

// Function to get the auth token from storage
async function getAuthToken() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['authToken'], function(result) {
            resolve(result.authToken);
        });
    });
}

// Function to make an authenticated API call
async function authenticatedFetch(endpoint, options = {}) {
    const token = await getAuthToken();
    
    if (!token) {
        throw new Error('Not authenticated');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }

    return response.json();
}

// API functions
export const api = {
    // Posts
    async createPost(postData) {
        return authenticatedFetch('/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    },

    async getPosts() {
        return authenticatedFetch('/posts');
    },

    // User
    async getCurrentUser() {
        return authenticatedFetch('/auth/me');
    },

    // Auth
    async logout() {
        chrome.storage.local.remove(['authToken']);
    }
}; 