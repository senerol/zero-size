export { renderTree };

const SVG_NS = 'http://www.w3.org/2000/svg';
const NODE_RADIUS = 18;
const X_GAP = 60;
const Y_GAP = 80;
const PADDING_X = 40;
const PADDING_Y = 30;

function layoutTree(root) {
    const nodes = [];
    const links = [];
    let leafIndex = 0;
    let maxDepth = 0;

    function assign(node, depth) {
        maxDepth = Math.max(maxDepth, depth);
        node._y = depth;

        if (!node.left && !node.right) {
            node._x = leafIndex++;
            return node._x;
        }

        const xs = [];
        if (node.left) xs.push(assign(node.left, depth + 1));
        if (node.right) xs.push(assign(node.right, depth + 1));
        node._x = xs.reduce((a, b) => a + b, 0) / xs.length;
        return node._x;
    }

    function collect(node) {
        nodes.push(node);
        if (node.left) {
            links.push({ from: node, to: node.left, label: '0' });
            collect(node.left);
        }
        if (node.right) {
            links.push({ from: node, to: node.right, label: '1' });
            collect(node.right);
        }
    }

    assign(root, 0);
    collect(root);

    return { nodes, links, leafCount: Math.max(leafIndex, 1), maxDepth };
}

function formatChar(ch) {
    if (ch === ' ') return '␣';
    if (ch === '\n') return '\\n';
    if (ch === '\t') return '\\t';
    if (ch === '\r') return '\\r';
    return ch;
}

function renderTree(container, root) {
    container.innerHTML = '';
    if (!root) return;

    const { nodes, links, leafCount, maxDepth } = layoutTree(root);

    const width = Math.max(leafCount * X_GAP + PADDING_X * 2, 200);
    const height = (maxDepth + 1) * Y_GAP + PADDING_Y * 2;

    const px = (node) => PADDING_X + node._x * X_GAP + X_GAP / 2;
    const py = (node) => PADDING_Y + node._y * Y_GAP;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.classList.add('tree-svg');

    for (const link of links) {
        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', px(link.from));
        line.setAttribute('y1', py(link.from));
        line.setAttribute('x2', px(link.to));
        line.setAttribute('y2', py(link.to));
        line.classList.add('tree-edge');
        svg.appendChild(line);

        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', (px(link.from) + px(link.to)) / 2);
        label.setAttribute('y', (py(link.from) + py(link.to)) / 2 - 6);
        label.classList.add('tree-edge-label');
        label.textContent = link.label;
        svg.appendChild(label);
    }

    for (const node of nodes) {
        const isLeaf = !node.left && !node.right;

        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('cx', px(node));
        circle.setAttribute('cy', py(node));
        circle.setAttribute('r', NODE_RADIUS);
        circle.classList.add(isLeaf ? 'tree-node-leaf' : 'tree-node-internal');
        svg.appendChild(circle);

        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', px(node));
        label.setAttribute('y', py(node) + 4);
        label.classList.add('tree-node-label', isLeaf ? 'tree-node-label-leaf' : 'tree-node-label-internal');
        label.textContent = isLeaf ? formatChar(node.char) : node.freq;
        svg.appendChild(label);

        if (isLeaf) {
            const freqLabel = document.createElementNS(SVG_NS, 'text');
            freqLabel.setAttribute('x', px(node));
            freqLabel.setAttribute('y', py(node) + NODE_RADIUS + 14);
            freqLabel.classList.add('tree-node-freq');
            freqLabel.textContent = node.freq;
            svg.appendChild(freqLabel);
        }
    }

    container.appendChild(svg);
}
