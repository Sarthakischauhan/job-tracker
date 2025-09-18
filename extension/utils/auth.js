// Authentication utilities for the job tracker extension

// check if supabase credentials are present
export async function userSupabaseCredPresent() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['supabaseUrl', 'supabaseKey'], (result) => {
        const { supabaseUrl, supabaseKey } = result;

        if (!supabaseKey || !supabaseUrl){
            resolve({supabaseKey:'', supabaseUrl:''})
        } else {
            resolve({supabaseKey:supabaseKey, supabaseUrl:supabaseUrl})
        }
      });
    });
}


// Check if user is logged in
export async function isUserLoggedIn() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['userSession'], (result) => {
      const session = result.userSession;
      if (session && session.user && session.access_token) {
        // Check if token is still valid (basic check)
        const now = Date.now();
        if (session.expires_at && now < session.expires_at) {
          resolve(true);
        } else {
          // Token expired, clear session
          chrome.storage.sync.remove(['userSession']);
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  });
}

// Login user with email and password
export async function loginUser(email, password) {
  try {
    // Get Supabase URL and key from storage
    const { supabaseKey, supabaseUrl } = await userSupabaseCredPresent()
     
    // Make login request to Supabase
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Login failed');
    }

    const data = await response.json();
    
    // Store user session
    const session = {
      user: data.user,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000) // Convert to milliseconds
    };

    await new Promise((resolve) => {
      chrome.storage.sync.set({ userSession: session }, resolve);
    });

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// Logout user
export async function logoutUser() {
  return new Promise((resolve) => {
    chrome.storage.sync.remove(['userSession'], () => {
      resolve(true);
    });
  });
}

// Get current user
export async function getCurrentUser() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['userSession'], (result) => {
      const session = result.userSession;
      if (session && session.user) {
        resolve(session.user);
      } else {
        resolve(null);
      }
    });
  });
}

// Get access token for API calls
export async function getAccessToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['userSession'], (result) => {
      const session = result.userSession;
      if (session && session.access_token) {
        resolve(session.access_token);
      } else {
        resolve(null);
      }
    });
  });
}
