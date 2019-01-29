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
pub struct MyStuff {
  len: usize,
  data: Vec<u8>,
  original_data: Vec<u8>
}

#[wasm_bindgen]
impl MyStuff {
  pub fn new() -> MyStuff {
    MyStuff {
      len: 0,
      data: vec![],
      original_data: vec![]
    }
  }

  pub fn allocate_data(&mut self, w:u32,h:u32) {
    utils::set_panic_hook();
    self.len = (w*h*4) as usize;
    self.data = Vec::with_capacity(self.len);
    self.data.resize(self.len, 0);
  }

  pub fn set_data(&mut self, data:Vec<u8>, w:u32, h:u32) {
    utils::set_panic_hook();
    self.len = (w*h*4) as usize;
    let original_data = data.to_vec();
    self.data = data;
    self.original_data = original_data;
  }

  pub fn get_data(&self) -> *const u8 {
    self.data.as_ptr()
  }

  pub fn get_len(&self) -> usize {
    self.len
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

  pub fn adjust_brightness(&mut self, brightness: i32) {
    let adjust:i32 = 255 * brightness / 100;
    utils::set_panic_hook();
    for i in 0..self.data.len() {
      if i % 4 == 3 { continue; } // alpha pixel
      let new_val:i32 = (self.original_data[i] as i32) + adjust;
      let new_val:u8 = {
        if new_val > 255 {
          255
        } else if new_val < 0 {
          0
        } else {
          new_val as u8
        }
      };
      self.data[i] = new_val;
    }
  }
}
