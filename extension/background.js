chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToJobDescription",
    title: "Add to Job Tracker Description",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToJobDescription" && info.selectionText) {
    chrome.storage.local.set({ jobDescriptionFromContext: info.selectionText });
   
    // Open the pop up once's selected!
    chrome.action.openPopup();
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'applicationSubmitted') {
    handleApplicationSubmitted(message.data);
  }
});

async function handleApplicationSubmitted(jobData) {
  console.log('Background script received application submission:', jobData);
  
  // Import the centralized function
  const { addJobToSupabase } = await import(chrome.runtime.getURL('utils/add_data.js'));
  
  // Add auto-detection flags to the job data
  const enhancedJobData = {
    ...jobData,
    status: 'applied', // Mark as applied since we detected submission
    autoDetected: true // Flag to indicate this was auto-detected
  };

  try {
    await addJobToSupabase(enhancedJobData, {
      showNotification: true,
      onSuccess: () => {
        console.log('Job application automatically logged successfully!');
      },
      onError: (error) => {
        console.error('Failed to submit job application:', error);
      }
    });
  } catch (error) {
    console.error('Error in handleApplicationSubmitted:', error);
  }
}