//readline is used to create an interface for reading users input and output data
const readline = require("readline");
const rl = readline.createInterface(process.stdin, process.stdout);

let username = "";
let recentEvents;
let messagesToPrint = [];
let pushEvents = [];
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
    if (recentEvents.length < 1) {
      console.log(
        "This user's activity was not found. This might happen because user's GitHub settings disallow public events"
      );
    }
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
        pushEvents.push(recentEvents[i]);
        break;
      case "PublicEvent":
        messagesToPrint.push(`Made ${recentEvents[i]?.repo?.name} public`);
        break;
      case "PullRequestEvent":
        messagesToPrint.push(
          `${recentEvents[i]?.action} a pull request "${recentEvents[i]?.pull_request?.title}"`
        );
        break;
      case "ForkEvent":
        messagesToPrint.push(`Forked ${recentEvents[i]?.repo?.name}`);
        break;
      default:
        messagesToPrint.push(
          `${recentEvents[i]?.type} at ${recentEvents[i]?.repo?.name}`
        );
    }
  }
  handlePushEvent();
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

let pushEventsMap = {};
function handlePushEvent() {
  pushEvents.forEach((event) => {
    if (pushEventsMap[event?.repo?.name] === undefined) {
      pushEventsMap[event?.repo?.name] = 1;
    } else {
      pushEventsMap[event?.repo?.name]++;
    }
  });

  for (let pushRepo in pushEventsMap) {
    messagesToPrint.push(
      `Pushed ${pushEventsMap[pushRepo]} commits to ${pushRepo}`
    );
  }
}
