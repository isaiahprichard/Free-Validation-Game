let count = 0;
let multiplier = 1;
let selloutTimes = 0;
let followerCount = 0;
let followers = [];
let prManagers = [];

// --- Scaling costs ---
let followerCost = 50;
let prCost = 200;
let selloutCost = 1000; // starting cost

// --- DOM elements ---
const selloutCountSpan = document.getElementById("sellout-count");
const button = document.getElementById("click-btn");
const counter = document.getElementById("counter");
const title = document.getElementById("title");
const avatar = document.getElementById("player-avatar");

const buyFollowerBtn = document.getElementById("buy-follower");
const buyPRBtn = document.getElementById("buy-pr");
const selloutBtn = document.getElementById("sellout");
const leaderboardEl = document.getElementById("leaderboard");
const followersContainer = document.getElementById("followers-container");
const prArea = document.getElementById("pr-area");
const eventBubble = document.getElementById("event-bubble");
const shopFeedback = document.getElementById("shop-feedback");

// --- SET INITIAL SHOP BUTTON TEXT ---
buyFollowerBtn.textContent = `Buy Followers (cost: ${followerCost})`;
buyPRBtn.textContent = `Hire PR Manager (cost: ${prCost})`;
selloutBtn.textContent = `Sell Out (cost: ${selloutCost})`;  // <- important fix

// --- Array of possible click emojis ---
const clickEmojis = ["❤️", "👍", "🔥", "✨", "💥", "💖", "😍", "🎉"];

// --- Function to spawn a single floating like ---
function spawnClickLike(x = null, y = null) {
  const like = document.createElement("div");
  
  // Pick a random emoji
  like.textContent = clickEmojis[Math.floor(Math.random() * clickEmojis.length)];
  
  like.style.position = "fixed";
  like.style.fontSize = "1.5rem";
  like.style.opacity = 1;
  like.style.pointerEvents = "none";
  like.style.zIndex = 100;

  // Position: if x/y not provided, spawn above avatar with slight random horizontal offset
  const rect = avatar.getBoundingClientRect();
  like.style.left = (x !== null ? x : rect.left + rect.width / 2 + (Math.random() * 80 - 40)) + "px";
  like.style.top = (y !== null ? y : rect.top - 20) + "px";

  document.body.appendChild(like);

  const startTime = Date.now();
  const duration = 1000;

  function animate() {
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      if (document.body.contains(like)) document.body.removeChild(like);
      return;
    }
    like.style.top = parseFloat(like.style.top) - 0.7 + "px"; // move upwards
    like.style.opacity = 1 - elapsed / duration; // fade out
    requestAnimationFrame(animate);
  }

  animate();
}

// --- Heart click ---
button.addEventListener("click", () => {
  count += followerCount > 0 ? followerCount * multiplier : 1 * multiplier;
  updateDisplay();

  button.classList.add("clicked");
  setTimeout(() => button.classList.remove("clicked"), 150);

  avatar.style.transform = "scale(1.1)";
  setTimeout(() => { avatar.style.transform = "scale(1)"; }, 100);

  // Spawn a single random emoji
  spawnClickLike();
});

// --- Auto clicks from followers ---
setInterval(() => {
  if (followerCount > 0) {
    count += followerCount * multiplier;
    updateDisplay();

    // Spawn random emojis for each follower auto-click
    followers.forEach(follower => {
      const rect = follower.getBoundingClientRect();
      spawnClickLike(rect.left + rect.width / 2 + (Math.random() * 10 - 5), rect.top - 10);
    });
  }
}, 1000);

// --- Value decay ---
setInterval(() => {
  if (count > 0) { count -= 1; updateDisplay(); }
}, 3000);

// --- Auto clicks ---
setInterval(() => {
  count += followerCount * multiplier;
  updateDisplay();
}, 1000);

// --- Followers ---
function spawnFollower() {
  const img = document.createElement("img");
  img.src = "follower.png";
  img.classList.add("follower");
  followersContainer.appendChild(img);
  followers.push(img);
  followerCount++;
  arrangeFollowers();
}

function removeFollower(amount = 1) {
  for (let i = 0; i < amount && followers.length > 0; i++) {
    const f = followers.pop();
    followersContainer.removeChild(f);
    followerCount--;
  }
}

function arrangeFollowers() {
  const rowHeight = 40;
  const maxPerRow = 20;
  const spacing = 40;
  const containerWidth = followersContainer.offsetWidth;
  const avatarX = containerWidth / 2;

  followers.forEach((follower, index) => {
    const row = Math.floor(index / maxPerRow);
    const col = index % maxPerRow;
    const totalInRow = Math.min(maxPerRow, followers.length - row * maxPerRow);
    const x = avatarX + (col - (totalInRow - 1)/2) * spacing;
    const y = row * rowHeight;
    follower.style.left = x - 15 + "px";
    follower.style.top = y + "px";
  });
}

function animateFollowers() {
  const time = Date.now() / 500;
  followers.forEach((f, i) => {
    const offset = Math.sin(time + i) * 6;
    const rotation = Math.sin(time / 2 + i) * 5;
    f.style.transform = `translateY(${offset}px) rotate(${rotation}deg)`;
  });
  requestAnimationFrame(animateFollowers);
}
animateFollowers();

// --- PR Managers ---
function spawnPRManager() {
  const img = document.createElement("img");
  img.src = "pr.png";
  img.classList.add("pr-manager");
  prArea.appendChild(img);
  prManagers.push(img);
  animatePRManager(img);
}

function animatePRManager(manager) {
  const start = Date.now();
  function animate() {
    const offset = Math.sin((Date.now() - start) / 500) * 3;
    manager.style.transform = `translateY(${offset}px)`;
    requestAnimationFrame(animate);
  }
  animate();
}

// --- Shop buttons ---
buyFollowerBtn.addEventListener("click", () => {
    if (count >= followerCost) {
      count -= followerCost;
      spawnFollower();
      showShopFeedback(`You bought followers. Are they real? 🤔`);
  
    // Increase cost gradually
    followerCost = Math.ceil(followerCost * 1.15); // slightly higher growth than before
    buyFollowerBtn.textContent = `Buy Followers (cost: ${followerCost})`;

    updateDisplay();
  }
});

buyPRBtn.addEventListener("click", () => {
  if (count >= prCost) {
    count -= prCost;
    multiplier += 1;
    spawnPRManager();
    showShopFeedback("PR Manager spins your story. Value doubles. 💼");

    // Increase cost much faster
    prCost = Math.ceil(prCost * 1.35); // steeper scaling
    buyPRBtn.textContent = `Hire PR Manager (cost: ${prCost})`;

    updateDisplay();
  }
});

selloutBtn.addEventListener("click", () => {
  if (count >= selloutCost) {
    count -= selloutCost;
    multiplier += 5;
    selloutTimes++;
    selloutCountSpan.textContent = selloutTimes;
    showShopFeedback("You sold out. Value skyrockets. Authenticity questionable. 💸");

    // Increase cost dramatically
    selloutCost = Math.ceil(selloutCost * 1.5); // much steeper growth
    selloutBtn.textContent = `Sell Out (cost: ${selloutCost})`;

    updateDisplay();
  }
});

// --- Shop feedback ---
let shopTimeout;
function showShopFeedback(text) {
  shopFeedback.textContent = text;
  clearTimeout(shopTimeout);
  shopTimeout = setTimeout(() => { shopFeedback.textContent = ""; }, 7000);
}

// --- Event bubble ---
let bubbleTimeout;
function showEventBubble(text) {
  eventBubble.textContent = text;
  eventBubble.style.opacity = 1;
  eventBubble.style.transform = "translateX(-50%) translateY(0)";
  clearTimeout(bubbleTimeout);
  bubbleTimeout = setTimeout(() => {
    eventBubble.style.opacity = 0;
    eventBubble.style.transform = "translateX(-50%) translateY(-50px)";
  }, 10000);
}

// --- Random events ---
const randomEvents = [
  { text: "You adopted a cute dog 🐶 — followers love it!", followers: 5, value: 50 },
  { text: "You got shadow-banned 😬", followers: -15, value: -100 },
  { text: "Getty Images posts a photo of you 📸", followers: -8, value: -50 },
  { text: "Collab with a major star 🌟", followers: 8, value: 150 },
  { text: "Bought a gorgeous coastal home 🏡", followers: 6, value: 120 },
  { text: "Called an industry plant 🤔", followers: -10, value: -70 },
  { text: "Negative PR scandal 🤦‍♂️", followers: -20, value: -100 },
  { text: "Lost sponsorship deals 💔", followers: -15, value: -80 },
  { text: "Bad tweet goes viral 😬", followers: -12, value: -60 }
];

setInterval(() => {
  const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
  count += event.value;
  if (count < 0) count = 0;

  // Update followers visually
  if (event.followers > 0) {
    for (let i = 0; i < event.followers; i++) spawnFollower();
  } else if (event.followers < 0) {
    removeFollower(Math.min(followers.length, Math.abs(event.followers)));
  }

  showEventBubble(event.text);
  updateDisplay();
}, 45000);

// --- Leaderboard ---
let leaderboard = [
  { name: "Kylie Jenner", value: 300000000 },
  { name: "Taylor Swift", value: 1000000},
  { name: "MrBeast", value: 500000 },
  { name: "Charli D’Amelio", value: 40000 },
  { name: "You", value: 0 },
];

let player = leaderboard.find(p => p.name === "You");

function updateLeaderboard() {
  player.value = count; // only update your player's value

  // Make a copy to sort for display
  const sorted = [...leaderboard].sort((a, b) => b.value - a.value);

  leaderboardEl.innerHTML = sorted
    .map(entry => `<li>${entry.name}: ${entry.value.toLocaleString()} value</li>`)
    .join("");
}

// --- Display updates ---
function updateDisplay() {
  counter.textContent = count + " value";
  updateTitle();
  updateAesthetic();
  updateLeaderboard();
}

function updateTitle() {
  if (count < 50) title.textContent = "You're a Nobody";
  else if (count < 100) title.textContent = "You're a Somebody";
  else if (count < 1000) title.textContent = "Wow, you're like so Popular";
  else if (count < 10000) title.textContent = "You're an Influencer";
  else if (count < 100000) title.textContent = "You're a Brand";
  else if (count < 1000000) title.textContent = "You're an Algorithm";
  else title.textContent = "Congratulations, you're a Commodity";
}

// --- UpdateAesthetic modification ---
function updateAesthetic() {
    if (count >= 100 && count < 5000) {
      document.body.style.background = "#fce4ec";
      document.body.style.color = "#000"; // default text
    }
    else if (count >= 5000 && count < 1000000) {
      document.body.style.background = "#e3f2fd";
      document.body.style.color = "#000"; // default text
    }
    else if (count >= 1000000) {
      document.body.style.background = "#212121";
      document.body.style.color = "#fff"; // white text for dark screen
    }
    else {
      document.body.style.background = "#fefefe";
      document.body.style.color = "#000"; // default text
    }
  }


// --- Viral content popup with faster movement, flame emoji and text, sparse likes trail ---
let viralClickCount = 0;

function spawnViralContent() {
  const popup = document.createElement("div");
  popup.innerHTML = "🔥<span style='font-size:1.2rem; font-weight:bold;'>Viral Content!</span>";
  popup.style.position = "fixed";
  popup.style.fontSize = "3rem";
  popup.style.zIndex = 100;
  popup.style.cursor = "pointer";
  popup.style.left = Math.random() * (window.innerWidth - 150) + "px";
  popup.style.top = Math.random() * (window.innerHeight - 150) + "px";
  popup.style.userSelect = "none";
  document.body.appendChild(popup);

  // Value scaling
  const values = [50, 200, 500, 1000, 2000, 5000];
  const value = values[Math.min(viralClickCount, values.length - 1)];

  popup.addEventListener("click", () => {
    count += value;
    viralClickCount++;
    updateDisplay();
    showEventBubble(`Viral content clicked! +${value} value 🚀`);
    if (document.body.contains(popup)) document.body.removeChild(popup);
  });

  // Faster velocity
  let vx = (Math.random() * 5 + 4) * (Math.random() < 0.5 ? 1 : -1);
  let vy = (Math.random() * 5 + 4) * (Math.random() < 0.5 ? 1 : -1);

  const duration = 4000; // 4 seconds
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    if (elapsed > duration) {
      if (document.body.contains(popup)) document.body.removeChild(popup);
      return;
    }

    let left = parseFloat(popup.style.left);
    let top = parseFloat(popup.style.top);

    // Update position
    left += vx;
    top += vy;

    // Bounce off edges
    if (left <= 0 || left >= window.innerWidth - popup.offsetWidth) vx = -vx;
    if (top <= 0 || top >= window.innerHeight - popup.offsetHeight) vy = -vy;

    popup.style.left = left + "px";
    popup.style.top = top + "px";

    // --- Sparse thumbs-up trail ---
    if (Math.random() < 0.3) { // 30% chance per frame to spawn trail
      const trail = document.createElement("div");
      trail.textContent = "👍";
      trail.style.position = "fixed";
      trail.style.left = left + "px";
      trail.style.top = top + "px";
      trail.style.fontSize = "1rem";
      trail.style.opacity = 0.8;
      trail.style.pointerEvents = "none";
      document.body.appendChild(trail);

      // Animate trail fading upwards
      let trailStart = Date.now();
      function animateTrail() {
        const tElapsed = Date.now() - trailStart;
        if (tElapsed > 1000) {
          if (document.body.contains(trail)) document.body.removeChild(trail);
          return;
        }
        trail.style.top = parseFloat(trail.style.top) - 0.5 + "px";
        trail.style.opacity = 0.8 * (1 - tElapsed / 1000);
        requestAnimationFrame(animateTrail);
      }
      animateTrail();
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// Start after 30s, then every 30s
setTimeout(() => {
  spawnViralContent();
  setInterval(spawnViralContent, 30000);
}, 30000);




// --- Log off button ---
const logoutBtn = document.getElementById("logout-btn");
const logoutMessage = document.getElementById("logout-message");
let logoutStage = 0;

logoutBtn.addEventListener("click", handleLogoutAttempt);
function handleLogoutAttempt() {
    const stages = [
      "Are you sure you want to log off? You'll lose all your value.",
      "But your followers will forget you...",
      "What about your influence? Your status?",
      "Logging off means starting from zero.",
      "Think of all the attention wasted...",
      "You’re nothing without visibility.",
      "Final warning: log off and you disappear."
    ];
  
    if (logoutStage < stages.length) {
      logoutMessage.textContent = stages[logoutStage];
      logoutMessage.style.opacity = 1;
      setTimeout(() => { logoutMessage.style.opacity = 0; }, 5000);
      logoutStage++;
  
      // --- Get bounding rectangles ---
      const lbRect = leaderboardEl.getBoundingClientRect();
      const avatarRect = avatar.getBoundingClientRect();
      const heartRect = button.getBoundingClientRect();
      const btnWidth = logoutBtn.offsetWidth;
      const btnHeight = logoutBtn.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
  
      let newX, newY;
  
      do {
        newX = Math.random() * (windowWidth - btnWidth);
        newY = Math.random() * (windowHeight - btnHeight);
      } while (
        // Overlaps leaderboard
        (newX + btnWidth > lbRect.left && newX < lbRect.right &&
         newY + btnHeight > lbRect.top && newY < lbRect.bottom) ||
        // Overlaps avatar
        (newX + btnWidth > avatarRect.left && newX < avatarRect.right &&
         newY + btnHeight > avatarRect.top && newY < avatarRect.bottom) ||
        // Overlaps heart button
        (newX + btnWidth > heartRect.left && newX < heartRect.right &&
         newY + btnHeight > heartRect.top && newY < heartRect.bottom)
      );
  
      logoutBtn.style.left = newX + "px";
      logoutBtn.style.top = newY + "px";
    } else {
      document.body.innerHTML = `
        <h1>You logged off.</h1>
        <p style="font-size:1.5rem; margin-top:20px;">
          Without metrics, you are invisible.<br>
          Is anything real if it's not online?<br>
          Go enjoy your worthless life.
        </p>`;
    }
  }
  

updateDisplay();

