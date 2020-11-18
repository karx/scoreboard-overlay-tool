let db = firebase.firestore();

let data = {
  p1: {},
  p2: {},
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
async function getSteamId() {
  return (getParameterByName("steamid", window.location.search) || '76561198088178833');
}

async function init() {
  console.log('getSteamId');

  let bid = await getBroadcasterId();
  let sid = await getScoreboardId();
  let steamid = await getSteamId();
  console.log('getSteamId');
  data.bid = bid;
  data.sid = sid;
  if (bid && sid) {
    db.collection(`/scoreboards/${bid}/allboards`)
      .doc(sid)
      .onSnapshot((scoreboard) => {
        console.log('We got new data');
        let data = scoreboard.data();
        console.log({data});
        updateScoreboadToDOM(data);
      });
  }
  getDataFromAoe2(steamid);
}

init();

function updateScoreboadToDOM(scoreboard) {
  // Here for PlayerLabel, we get data for the steam ID
  let playerSteamID = scoreboard.steamid || '76561198088178833'; // defaults to T90Official bcz
  getDataFromAoe2(playerSteamID);
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
      ...toUpdateObj,
    });
}

async function getDataFromAoe2(steeam_id) {
  let gameData = await getAoe2DEMatchHistory(steeam_id);
  let playerData = await getPlayerDataFromSteam(steeam_id);
  console.log(gameData);
  updateplayerDatatoDOM(gameData, playerData);
  drawCurveTypes(gameData);
}

function updateplayerDatatoDOM(data, playerData) {
  let latestData = data[0];

  let theDescPage = `
  <ul>
    <li> Wins: ${latestData.num_wins}</li>
    <li> Losses: ${latestData.num_losses}</li>
    <li> Drops: ${latestData.drops}</li>
    
  </ul>
  `;
  document.getElementById('desc-card').innerHTML = theDescPage;
  document.getElementById('mana-icon').innerHTML = latestData.rating;
  document.getElementById('playerName').innerHTML = playerData.pName;

  document.getElementById('set-icon').setAttribute('src', playerData.pAvatar);
}

function drawCurveTypes(aoe2Data) {
  var data = new google.visualization.DataTable();
  data.addColumn("number", "X");
  data.addColumn("number", "Player");
  //   data.addColumn('number', 'Cats');
    let dataArray = aoe2Data.map( row => [row.timestamp, row.rating ]);
    console.log(dataArray);
  data.addRows([
    ...dataArray
  ]);

  var options = {
    hAxis: {
      title: "Time",
      ticks: []
    },
    vAxis: {
      title: "Rating",
    },
    series: {
      1: { curveType: "function" },
    },
    animation : {
      startup: true,
      easing: 'in'
    }, 

  };

  var chart = new google.visualization.LineChart(
    document.getElementById("chart_div")
  );
  chart.draw(data, options);
}


async function getPlayerDataFromSteam(steeam_id) {
  let streamProfileURL = new URL(
    `https://cors-anywhere.herokuapp.com/https://steamcommunity.com/profiles/${steeam_id}/?xml=1`
  );
  // Default options are marked with *
  const response = await fetch(streamProfileURL, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    // credentials: 'same-origin', // include, *same-origin, omit
  });
  console.log(response);
  let xmlResposne = await response.text(); // parses JSON response into native JavaScript objects
  console.log({xmlResposne});
  let parser = new DOMParser();
  let xml = parser.parseFromString(xmlResposne, "application/xml");
  let pName = xml.getElementsByTagName('steamID')[0].innerHTML.replace('<![CDATA[', '').replace(']]>', '');
  let pAvatar = xml.getElementsByTagName('avatarFull')[0].innerHTML.replace('<![CDATA[', '').replace(']]>', '');;
  console.log({ pName, pAvatar});
  return {pName, pAvatar};
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
