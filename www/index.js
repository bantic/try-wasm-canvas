import * as wasm from 'try-wasm-canvas';
import { memory } from 'try-wasm-canvas/try_wasm_canvas_bg';

let m = wasm.MyStuff.new();
let w = 500;
let h = 407;

let data = getImageData(w, h).data;
m.set_data(data, w, h);
renderToCanvas(m, w, h);

function cycleBrightness() {
  let minBrightness = -100;
  let maxBrightness = 100;
  let brightness = minBrightness;

  let delta = 5;
  let waitMs = 25;

  let run = true;

  function update() {
    if (!run) {
      return;
    }
    let now = new Date();
    m.adjust_brightness(brightness);
    console.log('adjust brightness took: ', new Date() - now);
    now = new Date();
    renderToCanvas(m);
    console.log('render canvas took:', new Date() - now);
    brightness += delta;

    if (brightness > maxBrightness) {
      brightness = maxBrightness;
      delta = -1 * delta;
    } else if (brightness < minBrightness) {
      brightness = minBrightness;
      delta = -1 * delta;
    }

    requestAnimationFrame(update);
  }

  update();

  return () => (run = false);
}

let cancelCycle;

document.getElementById('cycle-brightness').addEventListener('click', e => {
  if (cancelCycle) {
    cancelCycle();
    cancelCycle = null;
    e.target.textContent = 'Cycle Brightness';
  } else {
    cancelCycle = cycleBrightness();
    e.target.textContent = 'Cancel Brightness Cycle';
  }
});

function invertImage() {
  m.invert_data();
  renderToCanvas(m);
}

document.getElementById('invert-image').addEventListener('click', e => {
  if (cancelCycle) {
    cancelCycle();
    cancelCycle = null;
  }
  invertImage();
});

async function wait(ms) {
  return new Promise(res => {
    setTimeout(res, ms);
  });
}

function clearCanvas() {
  let c = document.getElementById('canvas');
  let ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
}

function renderToCanvas(m, w = null, h = null) {
  let ptr = m.get_data();
  let len = m.get_len();
  let bytes = memory.buffer.byteLength;
  let remainingBytes = bytes - ptr;
  // console.log(
  //   `ptr ${ptr}, len ${len}, bytes ${bytes}, remainingBytes: ${remainingBytes}`
  // );
  let data = new Uint8ClampedArray(memory.buffer, m.get_data(), m.get_len());
  let c = document.getElementById('canvas');
  w = w || c.width;
  h = h || c.height;
  c.width = w;
  c.height = h;
  let imageData = new ImageData(data, w, h);
  let ctx = c.getContext('2d');
  ctx.putImageData(imageData, 0, 0);
}

function getImageData(w, h) {
  let img = document.getElementById('img');
  let canvas = document.getElementById('canvas');
  canvas.width = w;
  canvas.height = h;
  let ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, w, h);
}

function addFileListener() {
  let input = document.getElementById('input-file');
  let handleInput = async e => {
    if (cancelCycle) {
      cancelCycle();
      cancelCycle = null;
    }
    let file = e.target.files[0];
    let imageData = await getImageDataFromFile(file);
    m.set_data(imageData.data, imageData.width, imageData.height);
    renderToCanvas(m, imageData.width, imageData.height);
  };
  // input.addEventListener('input', handleInput);
  input.addEventListener('change', handleInput);
}

function getImageDataFromFile(file) {
  return new Promise((res, rej) => {
    let reader = new FileReader();

    reader.onload = e => {
      res(e.target.result);
    };
    reader.onerror = e => {
      rej(e);
    };
    reader.readAsArrayBuffer(file);
  })
    .then(arrayBuffer => {
      let img = document.getElementById('img');
      let blob = new Blob([new Uint8Array(arrayBuffer)]);
      let url = URL.createObjectURL(blob);
      img.src = url;

      return new Promise((res, rej) => {
        img.onload = () => res(img);
        img.src = url;
      });
    })
    .then(img => {
      let canvas = document.getElementById('canvas');
      let ctx = canvas.getContext('2d');
      let w = img.width;
      let h = img.height;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      let data = ctx.getImageData(0, 0, w, h).data;
      return { data, width: w, height: h };
    });
}

addFileListener();
