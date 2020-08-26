let twitch_colors_accent_muted = ['#F0F0FF','#D2D2E6','#FAB4FF','#BFABFF','#FACDCD','#FC6675','#FEEE85','#FFCA5F','#BEFAE1','#57BEE6','#00C8AF','#0014A5'];
let twitch_colors_accent = ['#8205B4','#41145F','#FA1ED2','#BE0078','#FF6905','#FA2828','#FAFA19','#00FA05','#BEFF00','#69FFC3','#00FAFA','#1E69FF'];

let style = `
<style>
.eachScoreboard {
  height: 100%;
  width=100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: column;
}

.scoreBtn {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 80%;
  height: 0;
  overflow: hidden;
  transition: background-color 2s, padding 2s, height 2s, transform 2s;

}

.eachScoreboard:hover .scoreBtn {
  height: 20%;
}

</style>
`
let lastUsedColorIndex = 0;
class BasicWebComponent extends HTMLElement {
  schema = {
    'p1Name': {type: 'string', default: 'Player 1'},
    'p2Name': {type: 'string', default: 'Player 2'},
    'p1Score': {type: 'string', default: '2'},
    'p2Score': {type: 'string', default: '3'},
    'room': {type: 'string', default: 'BO7 Arabia Standard'},
    'bid': {type: 'string', default: ''},
    'sid': {type: 'string', default: ''},
  }
  constructor() {
    super(); // this is mandatory
    console.log(this.schema);
  }
  connectedCallback() {
    this.data = {};
    this.data.p1Name = this.getAttribute('p1Name') || this.schema.p1Name.default;
    this.data.p2Name = this.getAttribute('p2Name') || this.schema.p2Name.default;
    this.data.p1Score = this.getAttribute('p1Score') || this.schema.p1Score.default;
    this.data.p2Score = this.getAttribute('p2Score') || this.schema.p2Score.default;
    this.data.room = this.getAttribute('room') || this.schema.room.default;
    this.data.bid = this.getAttribute('bid') || this.schema.bid.default;
    this.data.sid = this.getAttribute('sid') || this.schema.sid.default;
    
    const rootElem = document.createElement('div');
    rootElem.classList='eachScoreboard';
    rootElem.innerHTML = `
    ${style}
      
      <div class="scoreDiv">
      ${this.data.p1Score} - ${this.data.p2Score}
    </div>
    <div class="scoreboardTitle">
      <a href="./board?bid=${this.data.bid}&sid=${this.data.sid}" class="">
          ${this.data.room}
      </a>
    
    </div>
    <div class="scoreBtn">
      <div class="controlRoom"><a href="./board?bid=${this.data.bid}&sid=${this.data.sid}" class="">🎮</a></div>
      <div class="viewBoard"><a href="./view?bid=${this.data.bid}&sid=${this.data.sid}" class="">📺</a></div>
    </div>
    
    
    `;

    let shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(rootElem);

  }

  attributeChangedCallback(attr, oldVal, newVal) {
  }
  
}

// BasicWebComponent.observedAttributes = ['game', 'post', 'token'];

customElements.define('kaaro-scoreboard-card', BasicWebComponent);