import { BinaryHeap } from './heap.js';

export { HuffmanCoder, HuffmanNode };

class HuffmanNode {
    constructor(freq, char = null, left = null, right = null) {
        this.freq = freq;
        this.char = char;
        this.left = left;
        this.right = right;
    }

    isLeaf() {
        return this.char !== null;
    }
}

class HuffmanCoder {

    buildFrequencyTable(text) {
        const freq = new Map();
        for (const ch of text) {
            freq.set(ch, (freq.get(ch) || 0) + 1);
        }
        return freq;
    }

    buildTree(freqTable) {
        const heap = new BinaryHeap();
        for (const [char, freq] of freqTable) {
            heap.insert([-freq, new HuffmanNode(freq, char)]);
        }

        while (heap.size() > 1) {
            const a = heap.extractMax();
            const b = heap.extractMax();
            const merged = new HuffmanNode(a[1].freq + b[1].freq, null, a[1], b[1]);
            heap.insert([-merged.freq, merged]);
        }

        return heap.extractMax()[1];
    }

    buildCodes(node, path = '') {
        if (node.isLeaf()) {
            this.codes[node.char] = path.length ? path : '0';
            return;
        }
        this.buildCodes(node.left, path + '0');
        this.buildCodes(node.right, path + '1');
    }

    serializeTree(node) {
        if (node.isLeaf()) {
            return "'" + node.char;
        }
        return '0' + this.serializeTree(node.left) + '1' + this.serializeTree(node.right);
    }

    deserializeTree(data) {
        if (data[this.ind] === "'") {
            this.ind++;
            const char = data[this.ind];
            this.ind++;
            return new HuffmanNode(0, char);
        }

        this.ind++;
        const left = this.deserializeTree(data);
        this.ind++;
        const right = this.deserializeTree(data);
        return new HuffmanNode(0, null, left, right);
    }

    bitsToBytes(bits) {
        let bytes = '';
        for (let i = 0; i < bits.length; i += 8) {
            bytes += String.fromCharCode(parseInt(bits.substring(i, i + 8), 2));
        }
        return bytes;
    }

    bytesToBits(bytes) {
        let bits = '';
        for (let i = 0; i < bytes.length; i++) {
            let num = bytes.charCodeAt(i);
            let byteBits = '';
            for (let j = 0; j < 8; j++) {
                byteBits = (num % 2) + byteBits;
                num = Math.floor(num / 2);
            }
            bits += byteBits;
        }
        return bits;
    }

    encode(text) {
        if (!text || text.length === 0) {
            throw new Error('input text is empty');
        }

        const freqTable = this.buildFrequencyTable(text);
        const tree = this.buildTree(freqTable);

        this.codes = {};
        this.buildCodes(tree);

        let bits = '';
        for (const ch of text) bits += this.codes[ch];

        const padding = (8 - bits.length % 8) % 8;
        bits += '0'.repeat(padding);

        const payload = this.serializeTree(tree) + '\n' + padding + '\n' + this.bitsToBytes(bits);

        const stats = {
            originalSize: text.length,
            compressedSize: payload.length,
            ratio: (text.length / payload.length).toFixed(2),
            uniqueChars: freqTable.size
        };

        return { payload, tree, codes: { ...this.codes }, stats };
    }

    decode(payload) {
        const firstBreak = payload.indexOf('\n');
        const secondBreak = payload.indexOf('\n', firstBreak + 1);
        const treeData = payload.substring(0, firstBreak);
        const padding = parseInt(payload.substring(firstBreak + 1, secondBreak), 10);
        const bytes = payload.substring(secondBreak + 1);

        this.ind = 0;
        const tree = this.deserializeTree(treeData);

        let bits = this.bytesToBits(bytes);
        bits = bits.substring(0, bits.length - padding);

        let text = '';
        if (tree.isLeaf()) {
            // Only one unique character: every bit is one occurrence of it.
            for (let i = 0; i < bits.length; i++) text += tree.char;
        } else {
            let node = tree;
            for (const bit of bits) {
                node = bit === '0' ? node.left : node.right;
                if (node.isLeaf()) {
                    text += node.char;
                    node = tree;
                }
            }
        }

        return { text, tree, stats: { decodedSize: text.length } };
    }
}
