let twitch_client_id = 'j4zhgepzz3onr4pn0e9a4iumcrxqjq'
document.getElementById('twitch-auth-link').setAttribute('href', `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${twitch_client_id}&redirect_uri=${window.location.href.replace(/\/+$/, '')}&scope=viewing_activity_read`);
let db = firebase.firestore();



function enableClickToEnter() {
    document.getElementById('enter-to-enter').addEventListener('click', (e) => {
        document.getElementById('prof-bar').classList = 'profile-bar clicked';
        document.getElementById('filler-bar').classList = 'filler-bar clicked';
        document.getElementById('enter-to-enter').classList = 'enter-to-enter clicked';
        document.getElementById('enter-steps').classList = 'enter-steps clicked';
        document.getElementById('addOption').classList += ' clicked'
        document.getElementById('scoreboard-list-div').classList += ' clicked'
        
        getAllScoreboardsAndShow();
    
    });    
}



async function checkIfAuth() {
    var url = window.location.hash;
    let access_token = url.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1];
    console.log(`Do we have access token: ${!!access_token}`);
    return !!access_token; // TODO: better check. Hit API endpoint and confirm access token is Gucci
}
async function getAuthToken() {
    var url = window.location.hash;
    let access_token = url.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1];
    return access_token;
}

async function getTwitchBroadcasterId(access_token) {
    let twitch_url = new URL(`https://api.twitch.tv/helix/users`);
    // twitch_url.search = new URLSearchParams({
    //   game_id: this.data.game
    // });
      // Default options are marked with *
      const response = await fetch(twitch_url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Client-ID': twitch_client_id,
          'Authorization': 'Bearer ' + access_token
        },
      });
      return response.json(); // parses JSON response into native JavaScript objects
}


async function init() {
    if (await checkIfAuth()) {
        console.log('logged In');
        document.getElementById('login-msg').innerHTML = 'Success';
        document.getElementById('twitch-login').classList.add('logged-in');
        enableClickToEnter();
    } else {
        
    }
}

init();

async function getAllScoreboardsAndShow() {

    let access_token = await getAuthToken();
    let broadcasterData = await getTwitchBroadcasterId(access_token);
    console.log(broadcasterData);
    let broadcasterId = broadcasterData.data[0].id;
    console.log(`BroadcasterID = ${broadcasterId}`);
    db.collection(`/scoreboards/${broadcasterId}/allboards`).onSnapshot((querySnapshot) => {
        console.log('got something');
        document.getElementById('scoreboard-list-div').innerHTML = '';
        querySnapshot.forEach(scoreboard => {
            addScoreboardToDOM(scoreboard.data(), broadcasterId, scoreboard.id);
        })
    });
}


async function addScoreBoard() {
    let access_token = await getAuthToken();
    let broadcasterData = await getTwitchBroadcasterId(access_token);
    console.log(broadcasterData);
    let broadcasterId = broadcasterData.data[0].id;

    let roomID = document.getElementById("scoreboardName").value;
    
  
    db.collection(`/scoreboards/${broadcasterId}/allboards`)
      .add({
        room: roomID,
        p1Score: 0,
        p2Score: 0,
        timestamp: new Date(),
      })
      .then(function (docRef) {
        console.log("Document written with ID: ", docRef);
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });
  }

  function addScoreboardToDOM(scoreboard, bid, sid) {
      console.log('SCOREBOARD');
      console.log(scoreboard);
      let scoreboardEl = document.createElement('kaaro-scoreboard-card');
      scoreboardEl.setAttribute('p1Score', scoreboard.p1Score);
      scoreboardEl.setAttribute('p2Score', scoreboard.p2Score);
      scoreboardEl.setAttribute('room', scoreboard.room);
      scoreboardEl.setAttribute('bid', bid);
      scoreboardEl.setAttribute('sid', sid);

      // let eachScoreboard = `
      // <div class="eachScoreboard">
      //     <div class="scoreDiv">
      //       ${scoreboard.p1Score} - ${scoreboard.p2Score}
      //     </div>
      //     <div class="scoreboardTitle">
      //       <a href="./board?bid=${bid}&sid=${sid}" class="">
      //           ${scoreboard.room}
      //       </a>
          
      //     </div>
          
      //   </div>
      // `;

      document.getElementById('scoreboard-list-div').append(scoreboardEl);
  }