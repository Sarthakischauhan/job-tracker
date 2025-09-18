document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  // Import auth functions
  const { 
    isUserLoggedIn,
    loginUser, 
    logoutUser, 
    getCurrentUser, 
    userSupabaseCredPresent
  } = await import(chrome.runtime.getURL('utils/auth.js'));

  const submitBtn = document.getElementById("saveButton");
  const supabaseKeySection = document.getElementById("supabaseKeySection");
  const supabaseKeyInput = document.getElementById("supabaseKeyInput");
  const supabaseUrlInput = document.getElementById("supabaseUrlInput");
  const saveSupabaseKeyBtn = document.getElementById("saveSupabaseKeyBtn");
  const statusMsg = document.getElementById("statusMsg");

  const {supabaseKey, supabaseUrl }= await userSupabaseCredPresent();
  // Login/Logout elements
  const notLoggedInSection = document.getElementById("not-loggedin");
  const loggedInContent = document.getElementById("logged-in-content");
  const userEmailSpan = document.getElementById("user-email");
  const loginBtn = document.getElementById("saveCredentials");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginStatusMsg = document.getElementById("loginStatusMsg");
  const userEmailInput = document.getElementById("userEmail");
  const userPasswordInput = document.getElementById("userPassword"); 
  
  // Check login status and show appropriate UI
  const checkLoginStatus = async () => {
    const {supabaseKey, supabaseUrl} = await userSupabaseCredPresent();
    const isLoggedIn = await isUserLoggedIn();
 
    if (isLoggedIn) {
      // User is logged in - show job description form
      notLoggedInSection.style.display = 'none';
      loggedInContent.style.display = 'block';
      supabaseKeySection.style.display = 'none';
      submitBtn.disabled = false;
      
      // Get and display user email
      const user = await getCurrentUser();
      if (user && user.email) {
        userEmailSpan.textContent = user.email;
      }
    }
    else if (supabaseKey && supabaseUrl) {
      // Supabase credentials exist but user is not logged in - show login form
      notLoggedInSection.style.display = 'block';
      loggedInContent.style.display = 'none';
      supabaseKeySection.style.display = 'none';
      submitBtn.disabled = true;
    } 
    else {
      // No Supabase credentials - show setup form
      notLoggedInSection.style.display = 'none';
      loggedInContent.style.display = 'none';
      supabaseKeySection.style.display = 'block';
      submitBtn.disabled = true;
    }
  };

  // Initial check
  await checkLoginStatus();

  // Login button handler
  loginBtn.addEventListener('click', async () => {
    const email = userEmailInput.value.trim();
    const password = userPasswordInput.value.trim();
    
    if (!email || !password) {
      loginStatusMsg.textContent = "Please enter both email and password.";
      loginStatusMsg.style.display = "block";
      loginStatusMsg.style.color = "#f44336";
      return;
    }

    loginStatusMsg.textContent = "Logging in...";
    loginStatusMsg.style.display = "block";
    loginStatusMsg.style.color = "#fff";

    const result = await loginUser(email, password);
    
    if (result.success) {
      loginStatusMsg.textContent = "Login successful!";
      loginStatusMsg.style.color = "#4caf50";
      
      // Clear form
      userEmailInput.value = '';
      userPasswordInput.value = '';
      
      // Refresh UI
      await checkLoginStatus();
      
      setTimeout(() => {
        loginStatusMsg.style.display = "none";
      }, 1500);
    } else {
      loginStatusMsg.textContent = result.error || "Login failed. Please try again.";
      loginStatusMsg.style.color = "#f44336";
    }
  });

  // Logout button handler
  logoutBtn.addEventListener('click', async () => {
    await logoutUser();
    await checkLoginStatus();
  });

  // Save Supabase credentials handler
  saveSupabaseKeyBtn.addEventListener('click', () => {
    const key = supabaseKeyInput.value.trim();
    const url = supabaseUrlInput.value.trim();
    
    if (!key || !url) {
      statusMsg.textContent = "Please enter both Supabase URL and key.";
      statusMsg.style.display = "block";
      statusMsg.style.color = "#f44336";
      return;
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      statusMsg.textContent = "Please enter a valid Supabase URL.";
      statusMsg.style.display = "block";
      statusMsg.style.color = "#f44336";
      return;
    }
    
    chrome.storage.sync.set({ supabaseKey: key, supabaseUrl: url }, () => {
      statusMsg.textContent = "Supabase credentials saved!";
      statusMsg.style.display = "block";
      statusMsg.style.color = "#4caf50";
      
      // Clear form
      supabaseKeyInput.value = '';
      supabaseUrlInput.value = '';
      
      // Refresh UI to show login form
      setTimeout(async () => {
        statusMsg.style.display = "none";
        statusMsg.style.color = "";
        await checkLoginStatus();
      }, 1500);
    });
  });

  // On popup open, try to restore any saved form data
  const field = "description";
  chrome.storage.local.get(["jobFormDraft"], (result) => {
    if (result.jobFormDraft) {
      const draft = result.jobFormDraft;
      if (draft[field]) {
        document.getElementById(field).value = draft[field];
      }
    }
  });

  // Save form data on input change
  document.getElementById(field).addEventListener("focusout", () => {
    const draft = {};
    draft[field] = document.getElementById(field).value;
    chrome.storage.local.set({ jobFormDraft: draft });
  });

  chrome.storage.local.get(["jobDescriptionFromContext"], (result) => {
    if (result.jobDescriptionFromContext) {
      document.getElementById("description").value = result.jobDescriptionFromContext;

      // Clear the context value
      chrome.storage.local.remove("jobDescriptionFromContext");
    }
  });

  // Button click handler
  submitBtn.addEventListener("click", async () => {
    // Check if user is logged in before proceeding
    const isLoggedIn = await isUserLoggedIn();
    if (!isLoggedIn) {
      statusMsg.textContent = "Please login first to submit jobs.";
      statusMsg.style.display = "block";
      statusMsg.style.color = "#f44336";
      setTimeout(() => {
        statusMsg.style.display = "none";
      }, 3000);
      return;
    }

    const description = document.getElementById("description").value;

    if (!description.trim()) {
      statusMsg.textContent = "Please enter a job description.";
      statusMsg.style.display = "block";
      statusMsg.style.color = "#f44336";
      setTimeout(() => {
        statusMsg.style.display = "none";
      }, 3000);
      return;
    }

    statusMsg.textContent = "Adding to database...";
    statusMsg.style.display = "block";
    statusMsg.style.color = "#fff";

    const data = {
      url,
      description,
      createdAt: new Date().toISOString()
    };

    // Import the centralized function
    const { addJobToSupabase } = await import(chrome.runtime.getURL('utils/add_data.js'));

    try {
      await addJobToSupabase(data, {
        showNotification: false,
        onSuccess: () => {
          statusMsg.textContent = "Job submitted and being analyzed!";
          statusMsg.style.color = "#4caf50";
          // Clear the description field after successful submission
          document.getElementById("description").value = "";
        },
        onError: (error) => {
          if (error === 'Supabase key not found. Please add it first.') {
            statusMsg.textContent = "Supabase key not found. Please add it first.";
          } else {
            statusMsg.textContent = "Failed to submit job.";
          }
          statusMsg.style.color = "#f44336";
        }
      });
    } catch (error) {
      statusMsg.textContent = `Error connecting to database ${error}`;
      statusMsg.style.color = "#f44336";
    }
    
    setTimeout(() => {
      statusMsg.style.display = "none";
      statusMsg.style.color = "";
    }, 2500);
  });
})
