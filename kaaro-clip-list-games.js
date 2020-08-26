
class BasicWebComponent extends HTMLElement {
  schema = {
    'game': {type: 'string', default: '32982'},
    'post': {type: 'string', default: ''},
    'token': {type: 'string', default: ''}
  }
  constructor() {
    super(); // this is mandatory
    console.log(this.schema);
  }

  connectedCallback() {
    this.data = new Object();
    this.data.game = this.getAttribute('game') || this.schema.game.default;
    
    // const _wrapper = document.createElement('div');
    // _wrapper.style.display = 'inherit';
    
    // let shadowRoot = this.attachShadow({ mode: 'open' });
    // shadowRoot.appendChild(_wrapper);
    // shadowRoot.addEventListener('click', (event) => {
    //   this.updateClipboard(toClip)
    // });
    var url = window.location.hash;
    let access_token = url.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1];
    this.data.access_token = access_token;
    console.log(access_token);
    this.init();
  }

  attributeChangedCallback(attr, oldVal, newVal) {   
    console.log(attr);
  }

  async init() {
    if(this.gamesData) {

    } else {
      let gamesData = await this.getGamesData();
      this.gamesData = gamesData.data;
    }
    this.gamesData.forEach( (eachGame) => {
      console.log(eachGame);
      let gameArtURL = eachGame.box_art_url.replace('{width}', '600').replace('{height}', '800');
      let gameName = eachGame.name;
      let gameID = eachGame.id;
      // let clipURL = clip.thumbnail_url.replace('-preview-480x272.jpg','.mp4');
      this.addGameToDOM(gameArtURL, gameName, gameID);
    })
    
  }

  async addGameToDOM(gameArtURL, gameName, gameID) {
    let gameContainerDiv = document.createElement('div');
    let imgElm = document.createElement('img');
    gameContainerDiv.classList = 'each-game';

    imgElm.setAttribute('src', gameArtURL);
    imgElm.setAttribute('alt', gameName);
    let labelElm = document.createElement('p');
    // labelElm.innerHTML = gameName;
    
    gameContainerDiv.append(imgElm);
    console.log('Test log');
    const game_selected_event = new CustomEvent('game-selected', { detail: gameID });
    imgElm.addEventListener( 'click', (e) => {
      this.dispatchEvent(game_selected_event)
    });
    
    // this.shadowRoot.append(gameContainerDiv);
    this.append(gameContainerDiv);
  }

  async getGamesData() {
    
    let twitch_url = new URL(`https://api.twitch.tv/helix/games/top`);
    twitch_url.search = new URLSearchParams({
      first: 20
    });
      // Default options are marked with *
      const response = await fetch(twitch_url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Client-ID': 'qezpomfligmtrmcaw4s7mqijl5948e',
          'Authorization': 'Bearer ' + this.data.access_token
        },
      });
      return response.json(); // parses JSON response into native JavaScript objects
  }
  
}

BasicWebComponent.observedAttributes = ['game', 'post', 'token'];

customElements.define('kaaro-clip-game-list', BasicWebComponent);