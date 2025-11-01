let edges = [];
let vertices = new Set();
function addEdge() {
 const city1 = document.getElementById('city1').value.trim();
const city2 = document.getElementById('city2').value.trim();
 const distance = parseInt(document.getElementById('distance').value);
    if (!city1 || !city2 || !distance || distance <= 0) {
        alert('Please fill all fields with valid data');
        return;
    }
    if (city1.toLowerCase() === city2.toLowerCase()) {
        alert('Cities must be different');
        return;
    }  edges.push({ city1, city2, weight: distance });
 vertices.add(city1);
vertices.add(city2);
 updateEdgesList();
 clearInputs();
}
function clearInputs() {
 document.getElementById('city1').value = '';
 document.getElementById('city2').value = '';
    document.getElementById('distance').value = '';
}
function updateEdgesList() {
    const list = document.getElementById('edgesList');
    list.innerHTML = '';
edges.forEach((edge, index) => {
        const div = document.createElement('div');
        div.className = 'edge-item';
        div.innerHTML = `
            <span>${edge.city1} ↔ ${edge.city2}: ${edge.weight} km</span>
            <button onclick="removeEdge(${index})">Remove</button>
`;
        list.appendChild(div);
    });
}
function removeEdge(index) {
    edges.splice(index, 1);
    rebuildVertices();
    updateEdgesList();
}
function rebuildVertices() {
    vertices.clear();
    edges.forEach(edge => {
        vertices.add(edge.city1);
        vertices.add(edge.city2);
    });
}
function loadSampleData() {
    edges = [
{ city1: 'Mumbai', city2: 'Pune', weight: 150 },
{ city1: 'Mumbai', city2: 'Ahmedabad', weight: 530 },
{ city1: 'Delhi', city2: 'Jaipur', weight: 280 },
{ city1: 'Delhi', city2: 'Chandigarh', weight: 240 },
{ city1: 'Bangalore', city2: 'Chennai', weight: 350 },
{ city1: 'Bangalore', city2: 'Hyderabad', weight: 570 },
{ city1: 'Kolkata', city2: 'Bhubaneswar', weight: 440 },
{ city1: 'Chennai', city2: 'Hyderabad', weight: 630 },
{ city1: 'Pune', city2: 'Bangalore', weight: 840 },
{ city1: 'Jaipur', city2: 'Ahmedabad', weight: 680 },
{ city1: 'Delhi', city2: 'Kolkata', weight: 1500 },
{ city1: 'Mumbai', city2: 'Bangalore', weight: 980 } ];
 rebuildVertices();
    updateEdgesList();
    alert('Sample Indian cities loaded!');
}
function resetData() {
 edges = [];
vertices.clear();
updateEdgesList();
document.getElementById('results').style.display = 'none';
document.getElementById('comparison').style.display = 'none';
}
function primMST() {
    if (edges.length === 0) return { mst: [], cost: 0 };

    const mst = [];
    const visited = new Set();
    const vertexArray = Array.from(vertices);
    visited.add(vertexArray[0]);
    let totalCost = 0;

    while (visited.size < vertexArray.length) {
        let minEdge = null;
        let minWeight = Infinity;
        for (const edge of edges) {
            const c1Visited = visited.has(edge.city1);
            const c2Visited = visited.has(edge.city2);

            if ((c1Visited && !c2Visited) || (!c1Visited && c2Visited)) {
                if (edge.weight < minWeight) {
                    minWeight = edge.weight;
                    minEdge = edge;
                }
            }
        }

        if (minEdge) {
            mst.push(minEdge);
            totalCost += minEdge.weight;
            visited.add(minEdge.city1);
            visited.add(minEdge.city2);
        } else {
            break;
        }
    }

    return { mst, cost: totalCost };
}
class UnionFind {
    constructor(vertices) {
  this.parent = {};
 this.rank = {};
        vertices.forEach(v => {
            this.parent[v] = v;
            this.rank[v] = 0;
        });
    }

    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }
   union(x, y) { const rootX = this.find(x);
        const rootY = this.find(y);

        if (rootX === rootY) return false;
     if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++;
        }
        return true;
    }
}

function kruskalMST() {
    if (edges.length === 0) return { mst: [], cost: 0 };

    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const uf = new UnionFind(Array.from(vertices));
    const mst = [];
    let totalCost = 0;

    for (const edge of sortedEdges) {
        if (uf.union(edge.city1, edge.city2)) {
            mst.push(edge);
            totalCost += edge.weight;
        }
    }

    return { mst, cost: totalCost };
}
function calculateMST() {
    if (edges.length === 0) {
        alert('Please add some city connections first');
        return;
    }

    const primResult = primMST();
    const kruskalResult = kruskalMST();

    displayResults('prim', primResult);
    displayResults('kruskal', kruskalResult);
    displayComparison(primResult, kruskalResult);

    document.getElementById('results').style.display = 'grid';
    document.getElementById('comparison').style.display = 'block';
}
function displayResults(algorithm, result) {
    const prefix = algorithm;
    document.getElementById(`${prefix}Cost`).textContent = result.cost;
    document.getElementById(`${prefix}Edges`).textContent = result.mst.length;
    const list = document.getElementById(`${prefix}List`);
    list.innerHTML = '';
    result.mst.forEach(edge => {
        const li = document.createElement('li');
        li.textContent = `${edge.city1} ↔ ${edge.city2}: ${edge.weight} km`;
        list.appendChild(li);
    });

    drawGraph(algorithm, result.mst);
}
function drawGraph(algorithm, mst) {
    const canvas = document.getElementById(`${algorithm}Canvas`);
    const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 400;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const vertexArray = Array.from(vertices);
    const positions = {};
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;
    vertexArray.forEach((vertex, i) => {
        const angle = (2 * Math.PI * i) / vertexArray.length - Math.PI / 2;
        positions[vertex] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 2;
    mst.forEach(edge => {
     const pos1 = positions[edge.city1];
    const pos2 = positions[edge.city2];
        
ctx.beginPath();
ctx.moveTo(pos1.x, pos1.y);
        ctx.lineTo(pos2.x, pos2.y);
        ctx.stroke();
        const midX = (pos1.x + pos2.x) / 2;
        const midY = (pos1.y + pos2.y) / 2;
        ctx.fillStyle = 'white';
        ctx.fillRect(midX - 20, midY - 10, 40, 20);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(edge.weight, midX, midY + 4);
    });
    vertexArray.forEach(vertex => {
        const pos = positions[vertex];
        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 25, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(vertex, pos.x, pos.y + 3);
    });
}
function displayComparison(primResult, kruskalResult) {
    document.getElementById('primCostComp').textContent = primResult.cost;
    document.getElementById('primEdgesComp').textContent = primResult.mst.length;
    document.getElementById('kruskalCostComp').textContent = kruskalResult.cost;
    document.getElementById('kruskalEdgesComp').textContent = kruskalResult.mst.length;
    const compResult = document.getElementById('comparisonResult');
    if (primResult.cost === kruskalResult.cost) {
        compResult.innerHTML = ` Both algorithms produced identical minimum spanning trees with total cost of <strong>${primResult.cost} </strong>`;
        compResult.style.color = '#28a745';
    } else {
        compResult.innerHTML = `Different results `;
        compResult.style.color = '#ab696fff';
    }
}

