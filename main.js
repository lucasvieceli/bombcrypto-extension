// // main.js
// const SmartFox = require("sfs2x-api");

// // Expor o SmartFox globalmente para que possa ser usado no content script
// window.SmartFox = SmartFox;
const { WASI } = require("@wasmer/wasi");
const { WasmFs } = require("@wasmer/wasmfs");

// Instantiate a new WASI Instance
window.WASI = WASI;
window.WasmFs = WasmFs;
