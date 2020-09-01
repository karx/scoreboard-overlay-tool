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
        updateViewURLToDOM(data.bid, data.sid);
      });
  }
}

init();

function updateScoreboadToDOM(scoreboard) {
  let p1 = {
    name: scoreboard.p1Name || "Player 1",
    score: scoreboard.p1Score | 0,
  };
  let p2 = {
    name: scoreboard.p2Name || "Player 2",
    score: scoreboard.p2Score | 0,
  };

  document.getElementById("p1Score-value").innerHTML = p1.score;
  document.getElementById("p1Score-label").value = p1.name;

  document.getElementById("p2Score-value").innerHTML = p2.score;
  document.getElementById("p2Score-label").value = p2.name;

  document.getElementById("sc-name").innerHTML = scoreboard.room;

  data.p1 = p1;
  data.p2 = p2;
}

function updateViewURLToDOM(bid,sid) {
  let url = `${window.location.href.replace(/\/+$/, '').replace('/board','/view')}`;
  document.getElementById('myInput').value = url;
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

function removeScore(playerLabel) {
  let currentScore = data[playerLabel].score;
  console.log(`${playerLabel}Score-value = ${currentScore - 1}`);
  let toUpdateObj = {};
  toUpdateObj[`${playerLabel}Score`] = currentScore - 1;

    console.log(toUpdateObj);
  db.collection(`/scoreboards/${data.bid}/allboards`)
  .doc(data.sid)
  .update({
    ...toUpdateObj
  });
}

function updateNamesToCloud() {
  let p1Name = document.getElementById("p1Score-label").value;
  let p2Name = document.getElementById("p2Score-label").value;

  db.collection(`/scoreboards/${data.bid}/allboards`)
  .doc(data.sid)
  .update({
    p1Name: p1Name,
    p2Name: p2Name
  });
}


function copyToClipboad() {
  var copyText = document.getElementById("myInput");
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