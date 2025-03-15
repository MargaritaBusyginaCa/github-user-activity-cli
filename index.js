//readline is used to create an interface for reading users input and output data
const readline = require("readline");
const fs = require("fs");
const rl = readline.createInterface(process.stdin, process.stdout);
const githubEvents = JSON.parse(
  fs.readFileSync("githubEvents.json")
).githubEvents;

let username = "";
let recentEvents;
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
    matchEvent(recentEvents[i]);
  }
}

function matchEvent(event) {
  for (let i = 0; i < githubEvents.length; i++) {
    if (
      githubEvents[i].name === event.type &&
      (event.name !== "CreateEvent" ||
        githubEvents[i].ref_type === event.ref_type)
    ) {
      githubEvents[i] = {
        ...githubEvents[i],
        events: [event],
      };
      writeJson();
    }
  }
}

function writeJson() {
  const jsonFile = {
    githubEvents: githubEvents,
  };
  let data = JSON.stringify(jsonFile);
  fs.writeFileSync("githubEvents.json", data);
}
