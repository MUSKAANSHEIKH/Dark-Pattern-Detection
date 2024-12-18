window.onload = function () {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { message: "popup_open" });
    });
  
    document.getElementsByClassName("analyze-button")[0].onclick = function () {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: "analyze_site" });
      });
    };
  
    document.getElementsByClassName("link")[0].onclick = function () {
      chrome.tabs.create({
        url: document.getElementsByClassName("link")[0].getAttribute("href"),
      });
    };
  };
  
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "update_current_count") {
      document.getElementsByClassName("number")[0].textContent = request.count;
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.flag-button').addEventListener('click', function() {
      try {
        chrome.tabs.create({ url: "https://streamlit.app/" });
      } catch (error) {
        console.error("Error creating tab:", error);
        // Handle error gracefully, e.g., display an error message to the user
      }
    });
  });