import * as wasm from 'try-wasm-canvas';
import { memory } from 'try-wasm-canvas/try_wasm_canvas_bg';

let m = wasm.MyStuff.new();
let w = 500;
let h = 407;

let data = getImageData(w, h).data;
m.set_data(data, w, h);
m.invert_data();
renderToCanvas(m);

function clearCanvas() {
  let c = document.getElementById('canvas');
  let ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
}

function renderToCanvas(m, w = 500, h = 407) {
  let ptr = m.get_data();
  let len = m.get_len();
  let bytes = memory.buffer.byteLength;
  let remainingBytes = bytes - ptr;
  console.log(
    `ptr ${ptr}, len ${len}, bytes ${bytes}, remainingBytes: ${remainingBytes}`
  );
  let data = new Uint8ClampedArray(memory.buffer, m.get_data(), m.get_len());
  let c = document.getElementById('canvas');
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
  input.addEventListener('input', async e => {
    let file = e.target.files[0];
    let imageData = await getImageDataFromFile(file);
    m.set_data(imageData.data, imageData.width, imageData.height);
    m.invert_data();
    renderToCanvas(m, imageData.width, imageData.height);
  });
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
