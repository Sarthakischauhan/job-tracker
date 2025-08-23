document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  const submitBtn = document.getElementById("submit");
  const supabaseKeySection = document.getElementById("supabaseKeySection");
  const supabaseKeyInput = document.getElementById("supabaseKeyInput");
  const saveSupabaseKeyBtn = document.getElementById("saveSupabaseKeyBtn");
  const statusMsg = document.getElementById("statusMsg");

  // Check for Supabase key in storage
  chrome.storage.sync.get(['supabaseKey'], (result) => {
    const supabaseKey = result.supabaseKey;
    if (supabaseKey && supabaseKey.trim() !== '') {
      supabaseKeySection.style.display = 'none';
      submitBtn.disabled = false;
    } else {
      supabaseKeySection.style.display = 'block';
      submitBtn.disabled = true;
    }
  });

  // Save Supabase key handler
  saveSupabaseKeyBtn.addEventListener('click', () => {
    const key = supabaseKeyInput.value.trim();
    if (!key) {
      statusMsg.textContent = "Please enter a Supabase key.";
      statusMsg.style.display = "block";
      statusMsg.style.color = "#f44336";
      return;
    }
    chrome.storage.sync.set({ supabaseKey: key }, () => {
      supabaseKeySection.style.display = 'none';
      submitBtn.disabled = false;
      statusMsg.textContent = "Supabase key saved!";
      statusMsg.style.display = "block";
      statusMsg.style.color = "#4caf50";
      setTimeout(() => {
        statusMsg.style.display = "none";
        statusMsg.style.color = "";
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
    const description = document.getElementById("description").value;

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
