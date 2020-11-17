
import './lib/webaudio-controls.js';

const getBaseURL = () => {
  const base = new URL('.', import.meta.url);
  console.log("Base = " + base);
  return `${base}`;
};

const template = document.createElement("template");
template.innerHTML = `
  <style>
     H1 {
          color:black;
    }
    canvas {
      border: 1px solid #079992;
      background-color: black;
    }
  
  .myPlayer{
    margin: 32px;
  border:1px solid;
  border-radius:15px;
  background-color: Grey;
  padding:10px;
  width:300px;
  box-shadow: 10px 10px 5px grey;
  text-align:center;
  font-family: "Open Sans";
  font-size: 12px;

  #myCanvas {
    margin-bottom:10px;
    border:1px solid;
  }

  }
   #playButton{
    padding : 10px 25px;
    font-size: 22px;
    line-height: 20px;
    mine-width: 150px;
    text-align: center;
    cursor: pointer;
    background: linear-gradient(to right bottom, #273c75, #079992);
    color: #fff;
    border-radius: 200px;
    border: 0px
    height:60px;
    
   }
    
   #pauseButton{
    padding : 10px 25px;
    font-size: 19px;
    line-height: 20px;
    mine-width: 150px;
    text-align: center;
    cursor: pointer;
    background: linear-gradient(to right bottom, #273c75, #079992);
    color: #fff;
    border-radius: 200px;
    border: 0px
    height:60px;
    
   }

   #remettreAuDebut{
    padding : 10px 25px;
    font-size: 22px;
    line-height: 30px;
    mine-width: 150px;
    text-align: center;
    cursor: pointer;
    background: linear-gradient(to right bottom, #273c75, #079992);
    color: #fff;
    border-radius: 200px;
    border: 0px
    height:60px;
   }

   #equalizer{
    flex: 50%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-content: space-between;
    color: black;
    border : black
  }
  webaudio-slider{
    padding: 2px;
    background:color:#14D0FE;
    box-shadow:0 0 5px 0 #14D0FE;
  }

    
  </style>
  
  <div class="myPlayer">
  <h1> Karilys Music Reader</h1>
  <audio id="myPlayer" crossorigin>
        <source src="https://mainline.i3s.unice.fr/mooc/guitarRiff1.ogg" type="audio/ogg" />
        <source src="https://mainline.i3s.unice.fr/mooc/guitarRiff1.mp3" type="audio/mp3" />

        Your browser does not support the audio tag.
    </audio>
    <canvas id="myCanvas" width=300 height=100></canvas>
    <br>
    <progress id ="progressRuler" min= 0 value = 0 step =0.1></progress>
    <br>
   
    <div>
    <button id="playButton">Play &#9658</button>
    &nbsp;
    &nbsp;
    <button id ="pauseButton">pause &#9632</button>
    
    
    </div>
    <br>
    <button id ="remettreAuDebut">Début&#9664</button>
    <br>
  
    
    <webaudio-knob id="knobVolume" tooltip="Volume:%s" src="./assets/imgs/bouton5.png" sprites="100" value=1 min="0" max="1" step=0.01>
        Volume
    </webaudio-knob>
   
    
    <webaudio-knob id="knobStereo" tooltip="Balance:%s" src="./assets/imgs/bouton2.png" sprites="127" value=0 min="-1" max="1" step=0.01>
        Balance G/D
    </webaudio-knob>

    <div class="controls">
    <label>60Hz</label>
    <input id="g0" type="range" value="0" step="1" min="-30" max="30"></input>
    <output id="gain0">-1 dB</output>
    </div>

    <div class="controls">
    <label>170Hz</label>
    <input id="g1" type="range" value="0" step="1" min="-30" max="30"></input>
    <output id="gain0">-3 dB</output>
    </div>

    <div class="controls">
    <label>350Hz</label>
    <input id="g2" type="range" value="0" step="1" min="-30" max="30"></input>
    <output id="gain0">-4 dB</output>
    </div>

    <div class="controls">
    <label>1000Hz</label>
    <input id="g3" type="range" value="0" step="1" min="-30" max="30"></input>
    <output id="gain0">0 dB</output>
    </div>

    <div class="controls">
    <label>3500Hz</label>
    <input id="g4" type="range" value="0" step="1" min="-30" max="30"></input>
    <output id="gain0">0 dB</output>
    </div>

    <div class="controls">
    <label>10000Hz</label>
    <input id="g5" type="range" value="0" step="1" min="-30" max="30"></input>
    <output id="gain0">0 dB</output>
    </div>

    </div>

    
    `;
  

class MyAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.src = this.getAttribute("src");

    console.log("src =" + this.getAttribute("src"));
    this.volume = 1;
    this.attachShadow({ mode: "open" });
    //this.shadowRoot.innerHTML = template;
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.basePath = getBaseURL(); // url absolu du composant
    // Fix relative path in WebAudio Controls elements
    this.fixRelativeImagePaths();
    
   // *************************************************
    document.getElementById('control-panel');
		this.infoBar = document.getElementById('info');
  }

  //MVC
  //static get observedAttributes() {
  //  return ["src","volume"];
  //}

  //attributeChangedCallback(attr,oldValue,newValue) {
  //  console.log("attributModifié nouvelle valeur : " + newValue)
  //}

  connectedCallback() {
    this.player = this.shadowRoot.querySelector("#myPlayer");
    this.player.loop = true;
    //this.player.src = this.src;

    this.canvas = this.shadowRoot.querySelector("#myCanvas");
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.canvasContext = this.canvas.getContext("2d");

    //Création d'un contexte web audio
    let audioContext = new AudioContext();
    let mediaElement = this.shadowRoot.getElementById('myPlayer');
    mediaElement.onplay = (e) => { audioContext.resume(); }
    mediaElement.addEventListener('play', () => audioContext.resume());
    
    this.filters = [];
    let playerNode = audioContext.createMediaElementSource(this.player);
    this.pannerNode = audioContext.createStereoPanner();
    // Create analyserNode
    this.analyserNode = audioContext.createAnalyser();
    this.analyserNode.fftSize = 1024;
    this.bufferLength = this.analyserNode.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    

   /*  playerNode
      .connect(this.pannerNode)
      .connect(this.analyserNode)
      .connect(audioContext.destination); //Connect to the speakers */

      // create the equalizer. It's a set of biquad Filters
    [60, 170, 350, 1000, 3500, 10000].forEach((freq, i) => {
      var eq = audioContext.createBiquadFilter();
      eq.frequency.value = freq;
      eq.type = "peaking";
      eq.gain.value = 0;
      this.filters.push(eq);
  });

  // Connect filters in serie
  playerNode.connect(this.filters[0]);
  for (var i = 0; i < this.filters.length - 1; i++) {
      this.filters[i].connect(this.filters[i + 1]);
  }
   // connect the different nodes
   this.filters[this.filters.length - 1].connect(this.pannerNode);
   this.pannerNode.connect(this.analyserNode);
   this.analyserNode.connect(audioContext.destination);

    this.visualize();

    this.declareListeners();
  }

  changeGain(sliderVal,nbFilter) {
    var value = parseFloat(sliderVal);
    this.filters[nbFilter].gain.value = value;

    // update output labels
    var output = this.shadowRoot.querySelector("#gain"+nbFilter);
    output.value = value + " dB";
  }

  visualize() {
    this.canvasContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
    
    this.canvasContext.fillRect(0, 0, this.width, this.height);
    
    this.analyserNode.getByteTimeDomainData(this.dataArray);
   
    this.canvasContext.lineWidth = 2;
    this.canvasContext.strokeStyle = 'LightBlue';
    
    this.canvasContext.beginPath();
    var sliceWidth = this.width / this.bufferLength;
    var x = 0;

    for (var i = 0; i < this.bufferLength; i++) {
      
      var v = this.dataArray[i] / 255;
      var y = v * this.height;

      if (i === 0) {
        this.canvasContext.moveTo(x, y);
      } else {
        this.canvasContext.lineTo(x, y);
      }
      x += sliceWidth;
    }

    this.canvasContext.lineTo(this.width, this.height / 2);
    this.canvasContext.stroke();
    // 3. appeller l'animation
    requestAnimationFrame(() => {this.visualize() });
  }


  fixRelativeImagePaths() {
    // change webaudiocontrols relative paths for spritesheets to absolute
    let webaudioControls = this.shadowRoot.querySelectorAll(
      'webaudio-knob, webaudio-slider, webaudio-switch, img'
    );
    webaudioControls.forEach((e) => {
      let currentImagePath = e.getAttribute('src');
      if (currentImagePath !== undefined) {
        //console.log("Got wc src as " + e.getAttribute("src"));
        let imagePath = e.getAttribute('src');
        //e.setAttribute('src', this.basePath  + "/" + imagePath);
        e.src = this.basePath + "/" + imagePath;
        //console.log("After fix : wc src as " + e.getAttribute("src"));
      }
    });
  }

  declareListeners() {
    // Play
    this.shadowRoot.querySelector("#playButton").addEventListener("click", (event) => {
      this.play();
    });
    // Pause
    this.shadowRoot.querySelector("#pauseButton").addEventListener("click", (event) => {
      this.pause();
    });
    // Remise a zero
    this.shadowRoot.querySelector("#remettreAuDebut").addEventListener("click", (event) => {
      this.remettreAuDebut() = 0;
    });

    this.shadowRoot
      .querySelector("#knobVolume")
      .addEventListener("input", (event) => {
        this.setVolume(event.target.value);
      });

    this.shadowRoot
      .querySelector("#knobStereo")
      .addEventListener("input", (event) => {
        this.setBalance(event.target.value);
      });
// Equalizer
      this.shadowRoot.querySelector("#g0").addEventListener("input", (event) => {
        this.changeGain(event.target.value, 0);
      });

      this.shadowRoot.querySelector("#g1").addEventListener("input", (event) => {
        this.changeGain(event.target.value, 0);
      });

      this.shadowRoot.querySelector("#g2").addEventListener("input", (event) => {
        this.changeGain(event.target.value, 0);
      });

      this.shadowRoot.querySelector("#g3").addEventListener("input", (event) => {
        this.changeGain(event.target.value, 0);
      });

      this.shadowRoot.querySelector("#g4").addEventListener("input", (event) => {
        this.changeGain(event.target.value, 0);
      });

      this.shadowRoot.querySelector("#g5").addEventListener("input", (event) => {
        this.changeGain(event.target.value, 0);
      });

    this.player.addEventListener('timeupdate', (event) => {
      console.log("time = " + this.player.currentTime + "la durée Total" + this.player.duration);
      let p = this.shadowRoot.querySelector("#progressRuler");
      try {
        p.max = this.player.duration.toFixed(2); //max avec la duree total
        p.value = this.player.currentTime;
      } catch (err) {
        console.log(err);
      }

    })
    
  }

  // API
  setVolume(val) {
    this.player.volume = val;
  }

  setBalance(val) {
    this.pannerNode.pan.value = val;
  }

  play() {
    this.player.play();

  }
  pause() {
    this.player.pause();
  }
  remettreAuDebut() {
    this.player.currentTime = 0;
  }
}

customElements.define("my-audioplayer", MyAudioPlayer);
