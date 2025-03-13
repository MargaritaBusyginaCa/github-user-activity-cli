//readline is used to create an interface for reading users input and output data
const readline = require("readline");
const rl = readline.createInterface(process.stdin, process.stdout);

let username = "MargaritaBusyginaCa";
rl.question("github-activity: ", (response) => {
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

    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.log(error.message);
  }
}
