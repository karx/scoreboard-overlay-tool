let db = firebase.firestore();

let data = {
  p1: {},
  p2: {}
};
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

async function getBroadcasterId() {
  return getParameterByName("bid", window.location.search);
}
async function getScoreboardId() {
  return getParameterByName("sid", window.location.search);
}

async function init() {
  let bid = await getBroadcasterId();
  let sid = await getScoreboardId();
data.bid = bid;
data.sid = sid;
  if (bid && sid) {
    db.collection(`/scoreboards/${bid}/allboards`)
      .doc(sid)
      .onSnapshot((scoreboard) => {
        let data = scoreboard.data();
        updateScoreboadToDOM(data);
      });
  }
}

init();

function updateScoreboadToDOM(scoreboard) {
  console.log(scoreboard);
  let p1 = {
    name: scoreboard.p1Name || "Player 1",
    score: scoreboard.p1Score | 0,
    bg_color: scoreboard.p1_BGColor || "#1e88e5"
  };
  let p2 = {
    name: scoreboard.p2Name || "Player 2",
    score: scoreboard.p2Score | 0,
    bg_color: scoreboard.p2_BGColor || "#1e88e5"
  };

  document.getElementById("p1Score-value").innerHTML = p1.score;
  document.getElementById("p1Score-label").innerHTML = p1.name;
  document.getElementById("p1Score-label").parentNode.style.backgroundColor = p1.bg_color;

  document.getElementById("p2Score-value").innerHTML = p2.score;
  document.getElementById("p2Score-label").innerHTML = p2.name;
  document.getElementById("p2Score-label").parentNode.style.backgroundColor = p2.bg_color;
  console.log(p1.bg_color, p2.bg_color);
  
  
  document.getElementById("sc-name").innerHTML = scoreboard.room;
  
  data.p1 = p1;
  data.p2 = p2;
}

function addScore(playerLabel) {
  let currentScore = data[playerLabel].score;
  console.log(`${playerLabel}Score-value = ${currentScore + 1}`);
  let toUpdateObj = {};
  toUpdateObj[`${playerLabel}Score`] = currentScore + 1;

    console.log(toUpdateObj);
  db.collection(`/scoreboards/${data.bid}/allboards`)
  .doc(data.sid)
  .update({
    ...toUpdateObj
  });
}


async function getAoe2DEMatchHistory(steeam_id) {
  let aoe2netUrl = new URL(
    `https://cors-anywhere.herokuapp.com/https://aoe2.net/api/player/ratinghistory`
  );
  aoe2netUrl.search = new URLSearchParams({
    game: "aoe2de",
    leaderboard_id: 3,
    steam_id: steeam_id,
    count: 60,
  });
  // Default options are marked with *
  const response = await fetch(aoe2netUrl, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    // credentials: 'same-origin', // include, *same-origin, omit
  });
  console.log(response);
  return response.json(); // parses JSON response into native JavaScript objects
}
 async function auto_everything() {
   let data = await getAoe2DEMatchHistory('76561198098219750');
   console.log(data);

 }

 auto_everything();