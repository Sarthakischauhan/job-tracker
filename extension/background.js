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