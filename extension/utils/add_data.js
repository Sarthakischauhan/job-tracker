// Centralized function to add job data to Supabase
export async function addJobToSupabase(jobData, options = {}) {
  const {
    showNotification = true,
    onSuccess = null,
    onError = null
  } = options;

  // Get Supabase key from storage
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['supabaseKey'], async (result) => {
      const supabaseKey = result.supabaseKey;
      if (!supabaseKey) {
        const error = 'Supabase key not found';
        console.error(error);
        if (onError) onError(error);
        reject(error);
        return;
      }

      const SUPABASE_EDGE_FUNCTION_URL = "https://sbnxomibyyhfcvpnfcwu.supabase.co/functions/v1/application-tracker";

      try {
        const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseKey
          },
          body: JSON.stringify(jobData)
        });

        if (response.ok) {
          console.log('Job data added successfully!');
          
          // Show notification if requested
          if (showNotification) {
            chrome.notifications.create({
              type: 'basic',
              title: 'Job Tracker',
              message: 'Application automatically logged!'
            });
          }

          if (onSuccess) onSuccess();
          resolve(true);
        } else {
          const error = `Failed to submit job data: ${response.statusText}`;
          console.error(error);
          if (onError) onError(error);
          reject(error);
        }
      } catch (error) {
        console.error('Error submitting job data:', error);
        if (onError) onError(error);
        reject(error);
      }
    });
  });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { addJobToSupabase };
}

