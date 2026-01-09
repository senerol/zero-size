# Zero-Size

Zero-Size is a small, dependency-free web app that compresses and decompresses text using Huffman coding, and visualizes the Huffman tree it builds.

## Features

- Encode any `.txt` file into a Huffman-compressed binary stream
- Decode a previously compressed file back into the original text
- Renders the generated Huffman tree as an SVG diagram instead of a raw text dump
- Shows compression stats: original size, compressed size, ratio, and unique character count
- No frameworks or build step - plain HTML, CSS and JS

## How Huffman coding works

1. **Frequency analysis** - count how often each character appears in the text.
2. **Build the tree** - repeatedly merge the two least-frequent nodes into a parent node until one tree remains.
3. **Generate codes** - walk the tree; each left branch appends `0`, each right branch appends `1`. Leaves are characters, and the path from the root to a leaf is that character's code.
4. **Compress** - replace each character in the text with its code and pack the resulting bits into bytes.
5. **Decompress** - walk the same tree bit by bit to recover the original characters.

## Running locally

Open `index.html` directly in a browser, or serve the folder with any static file server, e.g.

```bash
npx serve .
```

## Project structure

- `heap.js` - binary heap used to repeatedly pick the two least-frequent nodes
- `huffman.js` - Huffman tree construction and encode/decode logic
- `treeView.js` - renders the Huffman tree as an SVG
- `script.js` - wires up the UI: file upload, encode/decode actions, stats, tree rendering
- `style.css` - UI styling
- `index.html` - app markup
