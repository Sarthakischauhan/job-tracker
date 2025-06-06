document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  // Autofill URL field
  document.getElementById("url").value = url;

  // Check for Supabase key in storage and show/hide settings button
  chrome.storage.sync.get(['supabaseKey'], (result) => {
    const settingsBtn = document.getElementById('settingsBtn');
    if (result.supabaseKey && result.supabaseKey.trim() !== '') {
      settingsBtn.style.display = 'none';
    } else {
      settingsBtn.style.display = 'block';
      settingsBtn.style.background = '#f44336';
      settingsBtn.style.color = '#fff';
      settingsBtn.style.border = 'none';
      settingsBtn.style.padding = '8px 12px';
      settingsBtn.style.borderRadius = '2px';
      settingsBtn.style.marginBottom = '10px';
      settingsBtn.style.cursor = 'pointer';
      settingsBtn.textContent = 'Add Supabase Secret Key';
    }
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Button click handler
  document.getElementById("submit").addEventListener("click", async () => {
    const jobTitle = document.getElementById("jobTitle").value;
    const company = document.getElementById("company").value;
    const description = document.getElementById("description").value;
    const url = document.getElementById("url").value;
    const statusMsg = document.getElementById("statusMsg");

    // Show loading message
    statusMsg.textContent = "Adding to database...";
    statusMsg.style.display = "block";

    const data = {
      jobTitle,
      company,
      url,
      description,
      createdAt: new Date().toISOString()
    };

    // Supabase Edge Function URL
    const SUPABASE_EDGE_FUNCTION_URL = "https://sbnxomibyyhfcvpnfcwu.supabase.co/functions/v1/application-tracker";

    // Get Supabase key from chrome storage
    chrome.storage.sync.get(['supabaseKey'], async (result) => {
      const supabaseKey = result.supabaseKey;
      if (!supabaseKey) {
        statusMsg.textContent = "Supabase key not found. Please add it first.";
        statusMsg.style.color = "#f44336";
        return;
      }
      try {
        const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseKey
          },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          statusMsg.textContent = "Job submitted and being analyzed!";
          statusMsg.style.color = "#4caf50";
        } else {
          statusMsg.textContent = "Failed to submit job.";
          statusMsg.style.color = "#f44336";
        }
      } catch (e) {
        statusMsg.textContent = "Error connecting to database.";
        statusMsg.style.color = "#f44336";
      }
      setTimeout(() => {
        statusMsg.style.display = "none";
        statusMsg.style.color = "";
      }, 2500);
    });
  });
});
