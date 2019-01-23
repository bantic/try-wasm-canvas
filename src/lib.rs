extern crate cfg_if;
extern crate wasm_bindgen;

mod utils;

use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet(s:&str) {
    alert(&format!("Hello, {}!",s));
}

#[wasm_bindgen]
pub struct MyStuff {
  len: usize,
  data: Vec<u8>
}

#[wasm_bindgen]
impl MyStuff {
  pub fn new() -> MyStuff {
    MyStuff {
      len: 0,
      data: vec![]
    }
  }

  pub fn allocate_data(&mut self, w:u32,h:u32) -> *const u8 {
    utils::set_panic_hook();
    self.len = (w*h*4) as usize;
    self.data = Vec::with_capacity(self.len);
    self.data.resize(self.len, 0);
    self.data.as_ptr()
  }

  pub fn set_data(&mut self, data:Vec<u8>, w:u32, h:u32) {
    utils::set_panic_hook();
    self.len = (w*h*4) as usize;
    self.data = data;
  }

  pub fn get_data(&self) -> *const u8 {
    self.data.as_ptr()
  }

  pub fn get_len(&self) -> usize {
    self.len
  }

  pub fn munge_data(&mut self) {
    utils::set_panic_hook();
    for i in 0..self.data.len() {
      self.data[i] = self.data[i] / 2;
    }
  }

  pub fn color_data(&mut self, idx:u8) {
    utils::set_panic_hook();
    for i in 0..self.data.len() {
      if (i as u8) % 4 == idx || (i as u8) % 4 == 3 {
        self.data[i] = 255;
      } else {
        self.data[i] = 0;
      }
    }
  }

  pub fn invert_data(&mut self) {
    for i in 0..self.data.len() {
      if i % 4 == 3 { continue; }
      self.data[i] = self.data[i] ^ 255;
    }
  }
}
