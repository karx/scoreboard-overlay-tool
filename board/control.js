let db = firebase.firestore();

let data = {
  p1: {},
  p2: {},
  p3: {},
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
        updateViewURLToDOM(data.bid, data.sid);
        updateCardURLToDOM(data.bid, data.sid);
      });
  }
}

init();

function updateScoreboadToDOM(scoreboard) {
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
  let p3 = {
    name: scoreboard.p3Name || "Player 3",
    score: scoreboard.p3Score | 0,
    bg_color: scoreboard.p3_BGColor || "#1e88e5"
  };

  document.getElementById("p1Score-value").innerHTML = p1.score;
  document.getElementById("p1Score-label").value = p1.name;
  document.getElementById("p1Color_piker").color = p1.bg_color;

  document.getElementById("p2Score-value").innerHTML = p2.score;
  document.getElementById("p2Score-label").value = p2.name;
  document.getElementById("p2Color_piker").color = p2.bg_color;

  document.getElementById("p3Score-value").innerHTML = p3.score;
  document.getElementById("p3Score-label").value = p3.name;
  document.getElementById("p3Color_piker").color = p3.bg_color;

  document.getElementById("sc-name").innerHTML = scoreboard.room;

  data.p1 = p1;
  data.p2 = p2;
  data.p3 = p3;
}

function updateViewURLToDOM(bid, sid) {
  let url = `${window.location.href
    .replace(/\/+$/, "")
    .replace("/board", "/scoreView")}`;
  document.getElementById("myInput").value = url;
}

function updateCardURLToDOM(bid, sid) {
  let url = `${window.location.href
    .replace(/\/+$/, "")
    .replace("/board", "/playerLabel")}`;
  document.getElementById("playerCardcp").value = url;
}

function addScore(playerLabel) {
  let currentScore = data[playerLabel].score;
  console.log(`${playerLabel}Score-value = ${currentScore + 1}`);
  let toUpdateObj = {};
  toUpdateObj[`${playerLabel}Score`] = currentScore + 1;
  console.log({playerLabel});
  console.log(toUpdateObj);
  db.collection(`/scoreboards/${data.bid}/allboards`)
    .doc(data.sid)
    .update({
      ...toUpdateObj,
    });
}

function removeScore(playerLabel) {
  let currentScore = data[playerLabel].score;
  console.log(`${playerLabel}Score-value = ${currentScore - 1}`);
  let toUpdateObj = {};
  toUpdateObj[`${playerLabel}Score`] = currentScore - 1;

  console.log(toUpdateObj);
  db.collection(`/scoreboards/${data.bid}/allboards`)
    .doc(data.sid)
    .update({
      ...toUpdateObj,
    });
}

function updateColorOnCloud(playerLabel, color) {
  console.log(`Updateing now ${playerLabel} : ${color}`);
  let toUpdateObj = {};
  toUpdateObj[`${playerLabel}_BGColor`] = color;

  db.collection(`/scoreboards/${data.bid}/allboards`)
    .doc(data.sid)
    .update({
      ...toUpdateObj,
    });
}

function updateNamesToCloud() {
  let p1Name = document.getElementById("p1Score-label").value;
  let p2Name = document.getElementById("p2Score-label").value;
  let p3Name = document.getElementById("p3Score-label").value;

  db.collection(`/scoreboards/${data.bid}/allboards`).doc(data.sid).update({
    p1Name: p1Name,
    p2Name: p2Name,
    p3Name: p3Name,
  });
}

function copyToClipboad(elm) {
  var copyText = document.getElementById(elm);
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");

  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copied: " + copyText.value;
}

function outFunc() {
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copy to clipboard";
}


function debounce(func, wait, immediate) {
  var timeout;

  return function executedFunction() {
    var context = this;
    var args = arguments;
	    
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;
	
    clearTimeout(timeout);

    timeout = setTimeout(later, wait);
	
    if (callNow) func.apply(context, args);
  };
};




function updateplayercard() {
  let steamid = document.getElementById('playerCardSteamID').value;
  db.collection(`/scoreboards/${data.bid}/allboards`)
    .doc(data.sid)
    .update({
      steamid: steamid
    });
}

function selectedplayer(steam_id) {
  document.getElementById('playerCardSteamID').value = steam_id;
}

document.getElementById('playerCardName').addEventListener("keyup", async (event) => {
  if(event.key === "Enter") {
    let searchname = event.target.value;
    let searchResult = await searchAoE2(searchname);


    let domToAdd = ``;
    searchResult.leaderboard.forEach((player) => {
      let playerDOM = `<div class="player-result-each" id=${player.steam_id} onclick="selectedplayer('${player.steam_id}')">`;
      playerDOM += ` ${player.name} (${player.rating}) `;
      playerDOM += `</div>`;

      domToAdd += playerDOM;
    });

    document.getElementById('searchresults').innerHTML = domToAdd;
    console.log(searchResult);
  }
})