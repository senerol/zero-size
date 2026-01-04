export { BinaryHeap };

// Max-heap over [key, value] pairs, ordered by key.
// Huffman construction inserts [-frequency, node] so the "max" extracted
// is always the node with the smallest frequency.
class BinaryHeap {

    constructor() {
        this.heap = [];
    }

    insert(value) {
        this.heap.push(value);
        this.bubbleUp();
    }

    size() {
        return this.heap.length;
    }

    empty() {
        return this.size() === 0;
    }

    bubbleUp() {
        let index = this.size() - 1;

        while (index > 0) {
            const element = this.heap[index];
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];

            if (parent[0] >= element[0]) break;
            this.heap[index] = parent;
            this.heap[parentIndex] = element;
            index = parentIndex;
        }
    }

    extractMax() {
        const max = this.heap[0];
        const last = this.heap.pop();
        if (!this.empty()) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return max;
    }

    sinkDown(index) {
        const left = 2 * index + 1;
        const right = 2 * index + 2;
        let largest = index;
        const length = this.size();

        if (left < length && this.heap[left][0] > this.heap[largest][0]) {
            largest = left;
        }
        if (right < length && this.heap[right][0] > this.heap[largest][0]) {
            largest = right;
        }

        if (largest !== index) {
            const tmp = this.heap[largest];
            this.heap[largest] = this.heap[index];
            this.heap[index] = tmp;
            this.sinkDown(largest);
        }
    }
}
