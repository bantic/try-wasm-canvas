# Use WebAssembly to Manipulate Images

View the demo at: http://hypnotic-driving.surge.sh/

An experiment to compile Rust code to webassembly to manipulate images.

Usage:

- Follow the instructions later on in this document to use `wasm-pack build` to compile the Rust to webassembly
- To run locally, `cd www && npm start`

Deployment notes:

- Build: `cd www && npm run build`
- Cp the images to dist: `cp www/*.jpg dist`
- Edit the bootstrap.js file in dist to comment out the lines that attempt to do streaming compilation:

```
/******/ 				} else if(typeof WebAssembly.instantiateStreaming === 'function') {
/******/ 					promise = WebAssembly.instantiateStreaming(req, importObject);
```

- Use surge to deploy: `cd dist && surge . hypnotic-driving.surge.sh`

## Notes

Some issues I ran into along the way:

- The wasm-provided `memory` did not grow large enough to handle my images. I did not figure out why this was the case, but after some fiddling (and a night's rest) this is "just work"ing. The original issue was that the code would invert a small (50x30) image and then when it attempted to do so for a larger 500x407 image, the Unit8Array constructor would complain that there wasn't enough space in the memory.buffer. The memory is supposed to grow as needed when calling wasm functions that require more allocation, and it didn't seem to be doing that correctly, but it is now.
- Might be missing an easier method to read in pixel data from user-supplied image. This is the current method:
  - Use input[type=file]'s change event to get the filelist[0] file
  - Use FileReader to read it as an ArrayBuffer
  - Convert buffer -> blob -> objectURL -> set img.src to url. img is display:none
  - Use img.onload to wait until src is updated, then read width and height, and
  - draw the image into the canvas, then use canvas#getImageData to get the pixel data back out of it
  - Pass this pixel data to the wasm set_data fn, and from that point can manipulate it in wasm

Distribution:
I used `npm run build` to run the webpack build into www/dist

- The webpack config didn’t copy the images, so I had to manually copy them
- The .wasm file is not served with appropriate mime type, so streaming compilation fails
- Solution: Edit the code in bootstrap.js that does streaming compilation and comment it out so it just does normal instantiation. This method doesn’t care about the mime type so it just works.

Works on desktop Chrome, Safari, FF, mobile Safari. Mobile Chrome will show the initial inverted image but it doesn’t seem to react correctly to choosing a file. I suspect some issue but haven’t bothered to attempt to debug the mobile chrome devtools console.

# 🦀🕸️ `wasm-pack-template`

A template for kick starting a Rust and WebAssembly project using
[`wasm-pack`](https://github.com/rustwasm/wasm-pack).

This template is designed for compiling Rust libraries into WebAssembly and
publishing the resulting package to NPM.

- Want to use the published NPM package in a Website? [Check out
  `create-wasm-app`.](https://github.com/rustwasm/create-wasm-app)
- Want to make a monorepo-style Website without publishing to NPM? Check out
  [`rust-webpack-template`](https://github.com/rustwasm/rust-webpack-template)
  and/or
  [`rust-parcel-template`](https://github.com/rustwasm/rust-parcel-template).

## 🔋 Batteries Included

- [`wasm-bindgen`](https://github.com/rustwasm/wasm-bindgen) for communicating
  between WebAssembly and JavaScript.
- [`console_error_panic_hook`](https://github.com/rustwasm/console_error_panic_hook)
  for logging panic messages to the developer console.
- [`wee_alloc`](https://github.com/rustwasm/wee_alloc), an allocator optimized
  for small code size.

## 🚴 Usage

### 🐑 Use `cargo generate` to Clone this Template

[Learn more about `cargo generate` here.](https://github.com/ashleygwilliams/cargo-generate)

```
cargo generate --git https://github.com/rustwasm/wasm-pack-template.git --name my-project
cd my-project
```

### 🛠️ Build with `wasm-pack build`

```
wasm-pack build
```

### 🔬 Test in Headless Browsers with `wasm-pack test`

```
wasm-pack test --headless --firefox
```

### 🎁 Publish to NPM with `wasm-pack publish`

```
wasm-pack publish
```
