class ThreejsMusicViz extends HTMLElement {
  constructor() {
    super();
    this.width = 400;
    this.height = 400;
    this.camera;
    this.scene;
    this.renderer;
    this.geometry;
    this.material;
    this.hSpace = 4.5;
    this.vSpace = .03;
    this.frequencyData = new Uint8Array(1000);
    this.sphereGeometry = new THREE.SphereGeometry( .5, 4, 4 );
    this.spheres = [];
    this.analyserConnected = false;
    this.player = {};
  }

  createAudioElement() {
    const audioEle = document.createElement('audio');
    const srcEle = document.createElement('source');

    audioEle.setAttribute('controls', true);
    audioEle.style.display = 'none';
    srcEle.setAttribute('src',this.getAttribute('song'));
    audioEle.append(srcEle);
    audioEle.onplay = () => {
      if (!this.analyserConnected) {
        this.analyserConnected = true;
        this.setupAudioContext();
      }
    }
    return audioEle;
  }

  setupThree() {
    let materials = [];
    let position = 0;

    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 3000 );
    this.camera.position.x = 90;
    this.camera.position.y = -80;
    this.camera.position.z = 50;
    this.camera.lookAt(new THREE.Vector3(90,120,0));

    this.scene = new THREE.Scene();

    this.frequencyData.forEach(
      () => {
          position++;
          const factor = position/this.frequencyData.length;
          let blue = Math.floor(255/(1));
          let green = Math.floor(255*factor);
          let red = Math.floor(255*(1-factor));
          const color = new THREE.Color(`rgb(${red}, ${green}, ${blue})`);
          const material = new THREE.MeshBasicMaterial( {color: color} );
          const sphere = new THREE.Mesh( this.sphereGeometry, material );
          this.scene.add(sphere);
          this.spheres.push(sphere);
      }
    );


    this.geometry = new THREE.BoxGeometry( 10, 10, 10 );
    this.material = new THREE.MeshNormalMaterial();
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize(this.width, this.height );
    this.appendChild( this.renderer.domElement );
    this.renderer.render( this.scene, this.camera );

    const animate = () => {
          let position = 0;
          let vSpace = 0;
          this.spheres.forEach(
            (sphere) => {
              sphere.rotation.y += 0.01;
              sphere.rotation.x += 0.01;

              let yPos = -position*.03;
              let xPos = 0;
              let count = 40;
              let horizontalSpacing = 4.5;

              for (let i = 0; i < count; i++) {
                xPos = position%count*horizontalSpacing;
              }

              const zPos = this.frequencyData[position]*0.3;
              sphere.position.set(xPos, yPos, zPos);
              position++;
            }
          );

      this.renderer.render( this.scene, this.camera );
      requestAnimationFrame( animate );
    }

    requestAnimationFrame( animate );
  }

  setupAudioContext() {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var audioElement = this.querySelector('audio');
    var audioSrc = audioCtx.createMediaElementSource(audioElement);
    var analyser = audioCtx.createAnalyser();
    audioSrc.connect(analyser);
    // Bind our analyser to the media element source.
    audioSrc.connect(audioCtx.destination);
    this.frequencyData = new Uint8Array(1000);

     setInterval(() => {
       this.frequencyData = new Uint8Array(1000);
       analyser.getByteFrequencyData(this.frequencyData);
     }, 10);

  }

  createPlayButton() {
    const ele = document.createElement('div');
    const btn = document.createElement('button');
    const btnStop = document.createElement('button');
    btnStop.style.display = 'none';
    btnStop.style.float = 'left';
    btnStop.style.cursor = 'pointer';
    //btnStop.style.margin = '10px';
    btn.style.float = 'left';
    btn.style.cursor = 'pointer';
    //btn.style.margin = '10px';

    btn.innerHTML = '&#9654;';
    btn.onclick =  () => {
      this.querySelector('audio').play();
      btnStop.style.display = '';
      btn.style.display = 'none';
    };
    btnStop.onclick =  () => {
      this.querySelector('audio').pause();
      btnStop.style.display = 'none';
      btn.style.display = '';
    };
    btnStop.innerHTML = '&#9632;';
    ele.append(btn);

    ele.append(btnStop);
    return ele;
  }

  createTitle() {
    const ele = document.createElement('div');
    ele.innerHTML = this.getAttribute('cap');
    ele.style.color = '#FFF';
    ele.style.width = '100%';
    ele.style.textAlign = 'center';
    ele.style.position = 'static';
    //ele.style.lineHeight = '25px';
    return ele;
  }

  connectedCallback() {
    this.width = this.getAttribute("render-width");
    this.height = this.getAttribute("render-height");

    this.prepend(this.createTitle());
    this.prepend(this.createAudioElement());
    this.setupThree();
    this.prepend(this.createPlayButton());
  }
}

customElements.define('threejs-music-viz', ThreejsMusicViz);
