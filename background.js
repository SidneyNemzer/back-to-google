// An object that stores the history for each tab
// Will be deleted when Chrome is closed
const tabHistory = {}
// Why doesn't chrome's history API already track per tab?

// Listen to navigation events, to create a history per tab
chrome.webNavigation.onCommitted.addListener(function (details) {
  // Only listen for navigation from the top-level frame
  // Not iFrames in the page
  if (details.frameId != 0) {
    return
  }

  // Create an array for this tab's history, if it doesn't have one yet
  if (!Array.isArray(tabHistory[details.tabId])) {
    tabHistory[details.tabId] = []
  }

  // Add the current page to the beginning of the history array
  tabHistory[details.tabId].unshift(details.url)
})

// Listen for our key commands
chrome.commands.onCommand.addListener(function (command) {
  // Determine what tab is focused
  chrome.tabs.query({
    currentWindow: true,
    active: true
  }, function (tabArray) {
    if (tabArray.length < 1) {
      throw new Error('No active tab?')
    }

    // Assume the first tab in the tabArray is the current tab
    const tab = tabArray[0]

    // Retrieve the history that we've saved for that tab
    const currentTabHistory = tabHistory[tab.id]

    // Go through the history...
    for (let i = 0; i < currentTabHistory.length; i++) {
      const curUrl = currentTabHistory[i]

      // Does the url look like a google search?
      if (curUrl.includes('https://www.google.com') || curUrl.includes('http://www.google.com')) {
        if (i == 0) {
          // We're already on a google search, do nothing
          break
        }

        // Tell the current tab to go to the url
        chrome.tabs.update(tab.id, {
          url: curUrl
        })
        break
      }
    }
  })

})
