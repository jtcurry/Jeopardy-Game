const numCategories = 6;
const numClues = 5;
let categories = [];
const button = document.querySelector("button");

//** GENERATE AN ARRAY OF RANDOM UNIQUE INDEX NUMS
const getRandomIndexes = (num, max) => {
  let indexNums = [];
  while (indexNums.length < num) {
    let uniqueIndex = Math.floor(Math.random() * max);
    if (indexNums.indexOf(uniqueIndex) === -1) {
      indexNums.push(uniqueIndex);
    }
  }
  return indexNums;
};

//** GET REQUEST TO API FOR 100 CATEGORIES, RETURN ARRAY OF CATEGORY ID# AT RANDOM INDEX NUMS
async function getCategories() {
  let indexArr = getRandomIndexes(numCategories, 100);
  const response = await axios.get(
    "http://jservice.io/api/categories?count=100"
  );
  let catNumArray = [];
  for (let index of indexArr) {
    let catIdNum = response.data[index].id;
    catNumArray.push(catIdNum);
  }
  return catNumArray;
}

//** GET REQUEST TO API FOR CLUES FROM RANDOM CATEGORIES, RETURN ARR OF OBJS
async function getClues() {
  let arr = await getCategories();
  for (let categeoryId of arr) {
    const response = await axios.get(
      `http://jservice.io/api/clues?category=${categeoryId}`
    );
    let categoryObj = {
      title: response.data[0].category.title,
      clues: [],
    };
    let clueIndexArr = getRandomIndexes(numClues, response.data.length);
    for (let clueIndex of clueIndexArr) {
      let individualClue = {
        question: response.data[clueIndex].question,
        answer: response.data[clueIndex].answer,
        showing: null,
      };
      categoryObj.clues.push(individualClue);
    }
    categories.push(categoryObj);
  }
  hideLoadingView();
  revealCategories();
}

//** SLOW REVEAL OF CATEGORIES FOR CURRENT GAME
const revealCategories = () => {
  const revealContainer = document.getElementById("revealcategories");
  for (let category of categories) {
    let revealTitle = document.createElement("div");
    revealTitle.textContent = category.title;
    revealContainer.append(revealTitle);
  }
  setTimeout(makeHtmLBoard, 5000, numClues, numCategories);
};

//** CREATE HTML BOARD WITH CATEGORY TITLE AS HEADING CELLS
const makeHtmLBoard = (height, width) => {
  document.querySelector("table").classList.remove("hidden");
  document.getElementById("revealcategories").textContent = "";
  const categoryHeadings = document.getElementById("categoryheading");
  const tbody = document.querySelector("tbody");
  tbody.textContent = "";
  categoryHeadings.textContent = "";
  for (let category of categories) {
    let headingCell = document.createElement("td");
    headingCell.textContent = category.title;
    categoryHeadings.append(headingCell);
  }
  for (let i = 0; i < height; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < width; j++) {
      let cell = document.createElement("td");
      cell.setAttribute("id", `${j}${i}`);
      cell.textContent = "?";
      row.append(cell);
    }
    tbody.append(row);
  }
};

//** RETRIEVE CLUE BASED OFF OF ID CLICKED
const retrieveClue = (evt) => {
  const targetId = evt.target.id.split("");
  const indexA = targetId[0];
  const indexB = targetId[1];
  return categories[indexA].clues[indexB];
};

//** CHECK FOR GAME OVER
const checkGameOver = () => {
  return categories.every((category) =>
    category.clues.every((clue) => clue.showing === "answer")
  );
};

//** SHOW WIN MESSAGE IF GAME IS OVER
const gameOver = () => {
  document.querySelector("table").classList.add("hidden");
  document.getElementById("wincontainer").classList.remove("hidden");
  button.textContent = "Play Again?";
};

//** CLICK HANDLER FOR CELL SELECTION
document.querySelector("tbody").addEventListener("click", function (evt) {
  if (evt.target.tagName === "TD") {
    let currentClue = retrieveClue(evt);
    if (currentClue.showing === null) {
      currentClue.showing = "question";
      evt.target.textContent = currentClue.question;
    } else if (currentClue.showing === "question") {
      currentClue.showing = "answer";
      evt.target.textContent = currentClue.answer;
    } else {
      return;
    }
    if (checkGameOver()) {
      gameOver();
    }
  }
});

//**CLICK HANDLER FOR BUTTON
button.addEventListener("click", function () {
  setupAndStart();
});

//** SHOW LOADING VIEW
const showLoadingView = () => {
  document.getElementById("wincontainer").classList.add("hidden");
  document.querySelector("table").classList.add("hidden");
  button.textContent = "Loading...";
};

//** HIDE LOADING VIEW
const hideLoadingView = () => {
  button.textContent = "Restart";
};

//** START/RESTART/CLEAR FOR NEW GAME
const setupAndStart = () => {
  categories = [];
  showLoadingView();
  getClues();
};




// //TEST  _ERASE*************************************************************
