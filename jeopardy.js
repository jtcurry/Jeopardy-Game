const numCategories = 6;
const numClues = 5;
let categories = [];
let canClick = true;
const button = document.querySelector("button");
const questionDivContainer = document.getElementById("questionDivContainer");
const questionDivHeading = document.getElementById("questionDivHeading");
const questionDivBody = document.getElementById("questionDivBody");

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
  button.classList.add("hidden");
  for (let category of categories) {
    let revealTitle = document.createElement("div");
    revealTitle.classList.add("reveal");
    revealTitle.textContent = category.title;
    revealContainer.append(revealTitle);
  }
  setTimeout(makeHtmLBoard, 5000, numClues, numCategories);
};

//** CREATE HTML BOARD WITH CATEGORY TITLE AS HEADING CELLS
const makeHtmLBoard = (height, width) => {
  document.querySelector("table").classList.remove("hidden");
  document.getElementById("revealcategories").textContent = "";
  button.classList.remove("hidden");
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
      let icon = document.createElement("i");
      icon.setAttribute("class", "far fa-question-circle fa-3x");
      cell.append(icon);
      row.append(cell);
    }
    tbody.append(row);
  }
};

//** RETRIEVE CLUE BASED OFF OF ID CLICKED
const retrieveClue = (evt) => {
  const targetId = evt.id.split("");
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
  clearQuestionDiv();
  button.textContent = "Play Again?";
};

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

//** CLEAR QUESTION DIV
const clearQuestionDiv = () => {
  questionDivHeading.textContent = "";
  questionDivBody.textContent = "";
  canClick = true;
};

//** START/RESTART/CLEAR FOR NEW GAME
const setupAndStart = () => {
  categories = [];
  showLoadingView();
  getClues();
};

//**CLICK HANDLER FOR BUTTON
button.addEventListener("click", function () {
  clearQuestionDiv();
  setupAndStart();
});

//** CLICK HANDLER FOR CELL SELECTION
document.querySelector("tbody").addEventListener("click", function (evt) {
  if (canClick === true) {
    if (evt.target.tagName === "I") {
      let eventParent = evt.target.parentElement;
      let currentClue = retrieveClue(eventParent);
      if (currentClue.showing === null) {
        currentClue.showing = "question";
        evt.target.setAttribute("class", "fas fa-stream fa-3x");
        evt.target.parentElement.classList.add("active");
        questionDivHeading.textContent = "Question:";
        questionDivBody.textContent = currentClue.question;
      } else if (currentClue.showing === "question") {
        canClick = false;
        currentClue.showing = "answer";
        evt.target.setAttribute("class", "fas fa-check fa-3x");
        evt.target.parentElement.classList.remove("active");
        evt.target.style.cursor = "default";
        questionDivHeading.textContent = "Answer:";
        questionDivBody.textContent = currentClue.answer;
        setTimeout(clearQuestionDiv, 2000);
      } else {
        return;
      }
      if (checkGameOver()) {
        gameOver();
      }
    }
  }
});

//** SHOWS CURRENT QUESTION WHEN HOVERED OVER
document.querySelector("tbody").addEventListener("mouseover", function (evt) {
  if (evt.target.tagName === "TD") {
    let currentClue = retrieveClue(evt.target);
    if (currentClue.showing === "question") {
      questionDivHeading.textContent = "Question:";
      questionDivBody.textContent = currentClue.question;
    }
  }
});
