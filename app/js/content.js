const endpoint = "http://127.0.0.1:5000/";
const descriptions = {
  "Sneaking": "Coerces users to act in ways that they would not normally act by obscuring information.",
  "Urgency": "Places deadlines on things to make them appear more desirable.",
  "Misdirection": "Aims to deceptively incline a user towards one choice over the other.",
  "Social Proof": "Gives the perception that a given action or product has been approved by other people.",
  "Scarcity": "Tries to increase the value of something by making it appear to be limited in availability.",
  "Obstruction": "Tries to make an action more difficult so that a user is less likely to do that action.",
  "Forced Action": "Forces a user to complete extra, unrelated tasks to do something that should be simple.",
};

function scrape() {
  if (document.getElementById("insite_count")) {
    return;
  }

  // Get text content of page
  let elements = segments(document.body);
  let filtered_elements = [];

  for (let i = 0; i < elements.length; i++) {
    let text = elements[i].innerText.trim().replace(/\t/g, " ");
    if (text.length == 0) {
      continue;
    }
    filtered_elements.push(text);
  }

  // Send text tokens to backend API
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens: filtered_elements }),
  })
    .then((resp) => resp.json())  // Parse the JSON response
    .then((data) => {
      if (!data || !data.result || !Array.isArray(data.result)) {
        throw new Error("Invalid response structure from API.");
      }

      let dp_count = 0;
      let element_index = 0;

      // Process the result and highlight elements
      for (let i = 0; i < elements.length; i++) {
        let text = elements[i].innerText.trim().replace(/\t/g, " ");
        if (text.length == 0) {
          continue;
        }

        if (data.result[i] !== "Not Dark") {
          highlight(elements[element_index], data.result[i]);
          dp_count++;
        }
        element_index++;
      }

      // Store number of dark patterns found
      let g = document.createElement("div");
      g.id = "insite_count";
      g.value = dp_count;
      g.style.opacity = 0;
      g.style.position = "fixed";
      document.body.appendChild(g);
      sendDarkPatterns(g.value);
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
      alert("Something went wrong while analyzing the page.");
    });
}

// Highlight elements that are identified as dark patterns
function highlight(element, type) {
  element.classList.add("insite-highlight");

  let body = document.createElement("span");
  body.classList.add("insite-highlight-body");

  // Modal header
  let header = document.createElement("div");
  header.classList.add("modal-header");
  let headerText = document.createElement("h1");
  headerText.style.border = "1px solid #FF0000"; 
  headerText.style.borderRadius = "10px";
  headerText.style.backgroundColor = "#A28CEC";
  headerText.style.width = "fit-content";
  headerText.innerHTML = type + " Pattern"; 
  header.appendChild(headerText);
  body.appendChild(header);

  // Modal content (description)
  let content = document.createElement("div");
  content.classList.add("modal-content");
  content.style.border = "1px solid #FF0000"; 
  content.style.borderRadius = "10px";
  content.style.backgroundColor = "#A28CEC";
  content.style.width = "fit-content";
  content.innerHTML = descriptions[type];

  // Close button for modal
  let closeButton = document.createElement("button");
  closeButton.innerHTML = "Close";
  closeButton.onclick = function() {
    element.removeChild(body);
  };
  content.appendChild(closeButton);

  body.appendChild(content);
  element.appendChild(body);
}

// Send the number of dark patterns found to the Chrome extension background script
function sendDarkPatterns(number) {
  chrome.runtime.sendMessage({
    message: "update_current_count",
    count: number,
  });
}

// Listen for messages from the Chrome extension popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "analyze_site") {
    scrape();
  } else if (request.message === "popup_open") {
    let element = document.getElementById("insite_count");
    if (element) {
      sendDarkPatterns(element.value);
    }
  }
});
