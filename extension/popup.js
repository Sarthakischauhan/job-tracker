document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  document.getElementById("url").value = url;

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
  const formFields = ["jobTitle", "company", "description", "url"];
  chrome.storage.local.get(["jobFormDraft"], (result) => {
    if (result.jobFormDraft) {
      const draft = result.jobFormDraft;
      formFields.forEach((field) => {
        if (draft[field]) {
          document.getElementById(field).value = draft[field];
        }
      });
    }
  });

  // Save form data on input change
  formFields.forEach((field) => {
    document.getElementById(field).addEventListener("input", () => {
      const draft = {};
      formFields.forEach((f) => {
        draft[f] = document.getElementById(f).value;
      });
      chrome.storage.local.set({ jobFormDraft: draft });
    });
  });


  // Button click handler
  submitBtn.addEventListener("click", async () => {
    const jobTitle = document.getElementById("jobTitle").value;
    const company = document.getElementById("company").value;
    const description = document.getElementById("description").value;
    const url = document.getElementById("url").value;

    statusMsg.textContent = "Adding to database...";
    statusMsg.style.display = "block";
    statusMsg.style.color = "#fff";

    const data = {
      jobTitle,
      company,
      url,
      description,
      createdAt: new Date().toISOString()
    };

    const SUPABASE_EDGE_FUNCTION_URL = "https://sbnxomibyyhfcvpnfcwu.supabase.co/functions/v1/application-tracker";

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
