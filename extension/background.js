/*
  background.js
  - listens to the popup.js script to look for any mesasges and triggers
  - handles adding data to the extension and then sending it to supabase edge function
*/


// we add a new context option when the user installs extension
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToJobDescription",
    title: "Add to Job Tracker Description",
    contexts: ["selection"]
  });
});

// context menu listener, everytime it is added from menu we open the extension
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

/*
  Util Function for processing messages
*/
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