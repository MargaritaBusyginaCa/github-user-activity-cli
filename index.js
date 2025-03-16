//readline is used to create an interface for reading users input and output data
const readline = require("readline");
// const fs = require("fs");
const rl = readline.createInterface(process.stdin, process.stdout);
// const githubEvents = JSON.parse(
//   fs.readFileSync("githubEvents.json")
// ).githubEvents;

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
  //loop over the array,
  //for each object in the array, get the type of the event and push that object in the json file (only inside of the event)
  for (let i = 0; i < recentEvents.length; i++) {
    // matchEvent(recentEvents[i]);
    switch (recentEvents[i].type) {
      case "CreateEvent":
        printEvent(recentEvents[i]);
        break;
      case "IssuesEvent":
        messagesToPrint.push(
          `Opened a new issue in ${recentEvents[i].repo.name}`
        );
        break;
    }
  }
  console.log(messagesToPrint);
}

function printEvent(event) {
  if (event.payload.ref_type === "branch") {
    messagesToPrint.push(
      `Created branch ${event.payload.master_branch} in ${event.repo.name}`
    );
  } else if (event.payload.ref_type === "repository") {
    messagesToPrint.push(`Created repository ${event.repo.name}`);
  } else if (event.payload.ref_type === "tag") {
    messagesToPrint.push(
      `Created tag ${event.payload.master_branch} in ${event.repo.name}`
    );
  }
}
