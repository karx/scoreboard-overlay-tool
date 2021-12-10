let db = firebase.firestore();
var msg = new SpeechSynthesisUtterance();
var voices = window.speechSynthesis.getVoices();
console.log(voices);
msg.voice = voices[3]; 
msg.volume = 1; // From 0 to 1
msg.rate = 1; // From 0.1 to 10
msg.pitch = 1; // From 0 to 2
msg.lang = 'hi';

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
    set: scoreboard.p1Set || 0,
    bg_color: scoreboard.p1_BGColor || "#1e88e5"
  };
  let p2 = {
    name: scoreboard.p2Name || "Player 2",
    score: scoreboard.p2Score | 0,
    set: scoreboard.p2Set || 0,
    bg_color: scoreboard.p2_BGColor || "#1e88e5"
  };

  document.getElementById("p1Score-value").innerHTML = p1.score;
  document.getElementById("p1Score-label").innerHTML = p1.name;
  document.getElementById("p1Set-value").innerHTML = p1.set;
  // document.getElementById("p1Score-label").parentNode.style.backgroundColor = p1.bg_color;

  document.getElementById("p2Score-value").innerHTML = p2.score;
  document.getElementById("p2Score-label").innerHTML = p2.name;
  document.getElementById("p2Set-value").innerHTML = p2.set;
  // document.getElementById("p2Score-label").parentNode.style.backgroundColor = p2.bg_color;
  console.log(p1.bg_color, p2.bg_color);
  
  
  document.getElementById("sc-name").innerHTML = scoreboard.room;
  
  data.p1 = p1;
  data.p2 = p2;
  doSpeechofScore(data);
  
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

function doSpeechofScore(data) {
  msg.text = `${data.p1.score} ${data.p2.score}`;

  window.speechSynthesis.speak(msg);
  if(data.p1.score === 1) {
    msg.text = `${data.p1.name} Wins`;
    window.speechSynthesis.speak(msg);
    setTimeout( () => { addSet('p1') }, 5000);
  } else if (data.p2.score === 21) {
    msg.text = `${data.p2.name} Wins`;
    window.speechSynthesis.speak(msg);
    setTimeout( () => { addSet('p2') }, 5000);
  }

}

function addSet(playerLabel) {

  let currentSet = data[playerLabel].set;
  console.log(`${playerLabel}Set-value = ${currentSet + 1}`);
  let toUpdateObj = {};
  toUpdateObj[`${playerLabel}Set`] = currentSet + 1;
  toUpdateObj[`p1Score`] = 0;
  toUpdateObj[`p2Score`] = 0;
    console.log(toUpdateObj);
  db.collection(`/scoreboards/${data.bid}/allboards`)
  .doc(data.sid)
  .update({
    ...toUpdateObj
  });

}