import { HuffmanCoder } from './huffman.js';
import { renderTree } from './treeView.js';

window.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('dropzone');
    const dropzoneLabel = document.getElementById('dropzoneLabel');
    const upload = document.getElementById('uploadedFile');
    const encodeBtn = document.getElementById('encode');
    const decodeBtn = document.getElementById('decode');
    const statsEl = document.getElementById('stats');
    const treeArea = document.getElementById('treearea');

    const coder = new HuffmanCoder();

    upload.addEventListener('change', () => {
        const file = upload.files[0];
        dropzoneLabel.textContent = file ? file.name : 'Drop a text file here or click to browse';
    });

    ['dragover', 'dragleave', 'drop'].forEach((evt) => {
        dropzone.addEventListener(evt, (e) => {
            e.preventDefault();
            dropzone.classList.toggle('dragover', evt === 'dragover');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length) {
            upload.files = e.dataTransfer.files;
            upload.dispatchEvent(new Event('change'));
        }
    });

    encodeBtn.onclick = () => runOperation('encode');
    decodeBtn.onclick = () => runOperation('decode');

    function runOperation(mode) {
        const file = upload.files[0];
        if (!file) {
            alert('No file uploaded!');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            if (!text.length) {
                alert('Text can not be empty! Upload another file!');
                return;
            }

            try {
                const start = performance.now();
                const result = mode === 'encode' ? coder.encode(text) : coder.decode(text);
                const durationMs = performance.now() - start;

                const output = mode === 'encode' ? result.payload : result.text;
                const suffix = mode === 'encode' ? '_encoded.txt' : '_decoded.txt';

                downloadFile(file.name.split('.')[0] + suffix, output);
                renderTree(treeArea, result.tree);
                renderStats(result.stats, mode, durationMs);
            } catch (err) {
                alert('Could not ' + mode + ' this file: ' + err.message);
            }
        };
        reader.readAsText(file, 'UTF-8');
    }

    function renderStats(stats, mode, durationMs) {
        const timeRow = `<dt>${mode === 'encode' ? 'Encoding' : 'Decoding'} time</dt><dd>${formatDuration(durationMs)}</dd>`;

        if (mode === 'encode') {
            statsEl.innerHTML = `
                <dl>
                    <dt>Original size</dt><dd>${stats.originalSize} chars</dd>
                    <dt>Compressed size</dt><dd>${stats.compressedSize} bytes</dd>
                    <dt>Compression ratio</dt><dd>${stats.ratio}x</dd>
                    <dt>Unique characters</dt><dd>${stats.uniqueChars}</dd>
                    ${timeRow}
                </dl>`;
        } else {
            statsEl.innerHTML = `
                <dl>
                    <dt>Decoded size</dt><dd>${stats.decodedSize} chars</dd>
                    ${timeRow}
                </dl>`;
        }
    }

    function formatDuration(ms) {
        return ms < 1 ? '<1 ms' : Math.round(ms) + ' ms';
    }

    function downloadFile(fileName, data) {
        const a = document.createElement('a');
        a.href = 'data:application/octet-stream,' + encodeURIComponent(data);
        a.download = fileName;
        a.click();
    }
});
