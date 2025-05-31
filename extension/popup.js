document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Autofill URL-based defaults (optional logic can be smarter per domain)
  const url = tab.url;
  document.getElementById("jobTitle").value = ""; // You can try to infer this too later
  document.getElementById("company").value = "";  // Same here

  document.getElementById("submit").addEventListener("click", async () => {
    const jobTitle = document.getElementById("jobTitle").value;
    const company = document.getElementById("company").value;
    const description = document.getElementById("description").value;

    const data = {
      jobTitle,
      company,
      url,
      description,
      createdAt: new Date().toISOString()
    };

    const response = await fetch("https://your-api.com/api/analyzeJob", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert("Job submitted and being analyzed!");
    } else {
      alert("Failed to submit job.");
    }
  });
});
