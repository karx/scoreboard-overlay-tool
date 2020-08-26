let twitch_colors_accent_muted = ['#F0F0FF','#D2D2E6','#FAB4FF','#BFABFF','#FACDCD','#FC6675','#FEEE85','#FFCA5F','#BEFAE1','#57BEE6','#00C8AF','#0014A5'];
let twitch_colors_accent = ['#8205B4','#41145F','#FA1ED2','#BE0078','#FF6905','#FA2828','#FAFA19','#00FA05','#BEFF00','#69FFC3','#00FAFA','#1E69FF'];
let lastUsedColorIndex = 0;
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

  async attributeChangedCallback(attr, oldVal, newVal) {   
    console.log(attr);
    console.log(oldVal);
    console.log(newVal);
    if (attr === 'game') {
      this.data.game = newVal;
    
      let clipData = await this.getClipData();
      this.clipData = clipData.data;
    
      this.clipData.forEach( (clip) => {
        console.log(clip);
        
        this.addVidToDOM(clip, lastUsedColorIndex++);
      })
    
    }
    
  }

  async init() {
    if(this.clipData) {

    } else {
      console.log('getting CLip[s');
      let clipData = await this.getClipData();
      this.clipData = clipData.data;
    }
    this.clipData.forEach( (clip) => {
      console.log(clip);
      this.addVidToDOM(clip, lastUsedColorIndex++);
    })
    
  }

  async addVidToDOM(clip, colorCode) {
    let vodURL = clip.thumbnail_url.replace('-preview-480x272.jpg','.mp4');
    let thumbnail_url = clip.thumbnail_url;
    let vidContainerDiv = document.createElement('div');
    let vodElm = document.createElement('video');
    let streamerLink = document.createElement('div');

    vidContainerDiv.classList = 'each-clip';

    let colorIndex = (clip.broadcaster_id )%twitch_colors_accent.length;
    vidContainerDiv.style.backgroundColor = twitch_colors_accent_muted[colorIndex];
    vidContainerDiv.style.outlineColor = twitch_colors_accent[colorIndex];
    vidContainerDiv.style.color = colorIndex === 11 ? '#FFF' : '#000';
    vodElm.setAttribute('src', vodURL);
    vodElm.setAttribute('poster', thumbnail_url);
    vodElm.setAttribute('preload', 'metadata');
    
    var timeout = null;
    vodElm.addEventListener('mouseover', (elm) => {
      console.log('On mouse Over: ');
      timeout = setTimeout( () => vodElm.play(), 1000);
      
    });
    vodElm.addEventListener('mouseout', (elm) => {
      clearTimeout(timeout);
      vodElm.pause();
    });
    vodElm.addEventListener( 'click', (e) => {
      console.log(`Click registered`);
    })


    streamerLink.href = `https://twitch.tv/${clip.broadcaster_name}`;
    streamerLink.innerHTML = `@${clip.broadcaster_name}`;
    streamerLink.classList = 'streamer-links';
    
    // this.shadowRoot.append(vidContainerDiv);
    vidContainerDiv.append(vodElm);
    vidContainerDiv.append(streamerLink);
    this.append(vidContainerDiv);
  }

  async getClipData() {
    
    let twitch_url = new URL(`https://api.twitch.tv/helix/clips`);
    twitch_url.search = new URLSearchParams({
      game_id: this.data.game
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

customElements.define('kaaro-clip-game', BasicWebComponent);