//readline is used to create an interface for reading users input and output data
const readline = require("readline");
const rl = readline.createInterface(process.stdin, process.stdout);

let username = "";
let recentEvents;
let messagesToPrint = [];
rl.question("github-activity: ", (response) => {
  username = response;
  getData();
  rl.close();
});

async function getData() {
  const url = `https://api.github.com/users/${username}/events`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    recentEvents = await response.json();
    filterActivity();
  } catch (error) {
    console.log(error.message);
    console.log("Make sure the username you entered is valid.");
  }
}

function filterActivity() {
  for (let i = 0; i < recentEvents.length; i++) {
    switch (recentEvents[i].type) {
      case "CreateEvent":
        printEvent(recentEvents[i], "Created");
        break;
      case "IssuesEvent":
        messagesToPrint.push(
          `Opened a new issue in ${recentEvents[i].repo.name}`
        );
        break;
      case "DeleteEvent":
        printEvent(recentEvents[i], "Delete");
        break;
      case "WatchEvent":
        messagesToPrint.push(`Starred ${recentEvents[i].repo.name}`);
        break;
      case "PushEvent":
        handlePushEvent(recentEvents[i]);
        break;
    }
  }
  messagesToPrint.forEach((message) => {
    console.log(`- ${message}`);
  });
}

function printEvent(event, eventType) {
  if (event.payload.ref_type === "branch") {
    messagesToPrint.push(
      `${eventType} branch ${event.payload.master_branch} in ${event.repo.name}`
    );
  } else if (event.payload.ref_type === "repository") {
    messagesToPrint.push(`Created repository ${event.repo.name}`);
  } else if (event.payload.ref_type === "tag") {
    messagesToPrint.push(
      `${eventType} tag ${event.payload.master_branch} in ${event.repo.name}`
    );
  }
}

let pushEvents = [];
let groupedPushEvents = [];
function handlePushEvent(event) {
  for (let i = 0; i < recentEvents.length; i++) {
    if (recentEvents[i].type === "PushEvent") {
      pushEvents.push(recentEvents[i]);
    }
  }
  for (let i = 0; i < recentEvents.length; i++) {
    groupedPushEvents = pushEvents.find(
      (element) => element.repo.name === event.repo.name
    );
  }
}
