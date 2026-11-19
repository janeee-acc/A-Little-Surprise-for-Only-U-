
// ==========================================
// BIRTHDAY PHOTOBOOK
// PAGE FLIPPING FUNCTIONALITY
// ==========================================

// DOM ELEMENTS
const book = document.getElementById("book");
const sheets = Array.from(document.querySelectorAll(".sheet"));
const pageStatus = document.getElementById("pageStatus");
const stage = document.querySelector(".book-stage");
const music = document.getElementById("birthdayMusic");

// ==========================================
// BOOK STATE
// ==========================================

let currentSheet = 0;
let isTurning = false;

const totalSheets = sheets.length;
const turnDuration = 950;

function startMusic() {

  music.volume = 0.4;

  return music.play().catch(error => {
    console.warn("Music playback:", error);
  });

}

// ==========================================
// UPDATE SHEET STACKING
// ==========================================

function updateStacking() {

  sheets.forEach((sheet, index) => {

    if (index < currentSheet) {
      sheet.style.zIndex = index + 1;
    } else {
      sheet.style.zIndex = totalSheets - index;
    }

  });

}

// ==========================================
// UPDATE BOOK POSITION
// ==========================================

function updateBookPosition() {

  if (currentSheet === 0) {

    // Front cover centered
    book.classList.remove("open", "finished");

  } else if (currentSheet === totalSheets) {

    // Back cover centered
    book.classList.remove("open");
    book.classList.add("finished");

  } else {

    // Two-page spread centered
    book.classList.remove("finished");
    book.classList.add("open");

  }

}

// ==========================================
// UPDATE PAGE INDICATOR
// ==========================================

function updateNavigation() {

  if (currentSheet === 0) {

    pageStatus.textContent = "OPEN THE BOOK >";

  } else if (currentSheet === totalSheets) {

    pageStatus.textContent = "THE END ♡";

  } else if (currentSheet === totalSheets - 1) {

    pageStatus.textContent = "HAPPY BIRTHDAY, JEN ♡";

  } else {

    const leftPage = currentSheet * 2 - 1;
    const rightPage = currentSheet * 2;

    pageStatus.textContent =
      String(leftPage).padStart(2, "0") +
      " — " +
      String(rightPage).padStart(2, "0");

  }

}

// ==========================================
// NEXT PAGE
// ==========================================

function nextPage() {

  if (isTurning || currentSheet >= totalSheets) {
    return;
  }

  isTurning = true;

  const sheet = sheets[currentSheet];

  // Keep turning sheet above other pages
  sheet.style.zIndex = totalSheets + 5;

  // Flip sheet forward
  sheet.classList.add("flipped");

  currentSheet++;

  // Update book position
  updateBookPosition();

  // Update page indicator
  updateNavigation();

  // Wait for page-turn animation
  setTimeout(() => {

    updateStacking();
    isTurning = false;

  }, turnDuration);

}

// ==========================================
// PREVIOUS PAGE
// ==========================================

function previousPage() {

  if (isTurning || currentSheet <= 0) {
    return;
  }

  isTurning = true;

  currentSheet--;

  const sheet = sheets[currentSheet];

  // Keep turning sheet above other pages
  sheet.style.zIndex = totalSheets + 5;

  // Flip sheet backward
  sheet.classList.remove("flipped");

  // Update book position
  updateBookPosition();

  // Update page indicator
  updateNavigation();

  // Wait for page-turn animation
  setTimeout(() => {

    updateStacking();
    isTurning = false;

  }, turnDuration);

}

// ==========================================
// CLICK NAVIGATION
// ==========================================

book.addEventListener("click", (event) => {

  if (isTurning) return;

  // Front cover: open book
  if (currentSheet === 0) {
    nextPage();
    return;
  }

  // Back cover: reopen book
  if (currentSheet === totalSheets) {
    previousPage();
    return;
  }

  const rect = book.getBoundingClientRect();

  // Right page: move forward
  if (event.clientX >= rect.left) {
    nextPage();
  } else {
    previousPage();
  }

});

// ==========================================
// LEFT PAGE CLICK NAVIGATION
// ==========================================

stage.addEventListener("click", (event) => {

  if (isTurning) return;

  if (currentSheet === 0 ||
      currentSheet === totalSheets) {
    return;
  }

  const rect = book.getBoundingClientRect();

  // Click left page to go backward
  if (event.clientX < rect.left) {
    previousPage();
  }

});

// ==========================================
// KEYBOARD NAVIGATION
// ==========================================

document.addEventListener("keydown", (event) => {

  if (event.key === "ArrowRight") {

    event.preventDefault();
    nextPage();

  }

  if (event.key === "ArrowLeft") {

    event.preventDefault();
    previousPage();

  }

});

// ==========================================
// TOUCH / SWIPE NAVIGATION
// ==========================================

let touchStartX = 0;
let touchStartY = 0;
let suppressClick = false;

stage.addEventListener("touchstart", (event) => {

  touchStartX = event.changedTouches[0].screenX;
  touchStartY = event.changedTouches[0].screenY;

}, { passive: true });

stage.addEventListener("touchend", (event) => {

  const differenceX =
    event.changedTouches[0].screenX - touchStartX;

  const differenceY =
    event.changedTouches[0].screenY - touchStartY;

  // Ignore vertical scrolling
  if (Math.abs(differenceY) > Math.abs(differenceX)) {
    return;
  }

  // Swipe left: next page
  if (differenceX < -50) {

    suppressClick = true;
    nextPage();

  }

  // Swipe right: previous page
  else if (differenceX > 50) {

    suppressClick = true;
    previousPage();

  }

}, { passive: true });

// Prevent extra click after swiping
stage.addEventListener("click", (event) => {

  if (suppressClick) {

    event.stopImmediatePropagation();
    suppressClick = false;

  }

}, true);

// ==========================================
// INITIALIZE PHOTOBOOK
// ==========================================

updateStacking();
updateBookPosition();
updateNavigation();

if (music.readyState >= HTMLMediaElement.HAVE_METADATA) {
  music.currentTime = 10;
} else {
  music.addEventListener("loadedmetadata", () => {
    music.currentTime = 10;
  }, { once: true });
}

// Start immediately, 10 seconds into the track.
startMusic();

const unlockMusic = () => {
  if (music.paused) {
    startMusic();
  }
};

document.addEventListener("pointerdown", unlockMusic, { once: true });
document.addEventListener("keydown", unlockMusic, { once: true });
