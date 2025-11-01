let products = [];
let routes = {};
let locations = new Set(['Warehouse']);
function addProduct() {
    const name = document.getElementById('productName').value;
    const weight = parseFloat(document.getElementById('productWeight').value);
    const quantity = parseFloat(document.getElementById('productValue').value);
    const destination = document.getElementById('productDestination').value;

    if (!name || !weight || !quantity || !destination) {
        alert('Please fill all fields');
        return;
    }

    products.push({ name, weight, quantity, destination });
    locations.add(destination);
        document.getElementById('productName').value = '';
       document.getElementById('productWeight').value = '';
      document.getElementById('productValue').value = '';
      document.getElementById('productDestination').value = '';

    updateProductsList();
    updateLocationsList();
}
function addRoute() {
    const from = document.getElementById('fromLocation').value;
    const to = document.getElementById('toLocation').value;
    const dist = parseFloat(document.getElementById('distance').value);

    if (!from || !to || !dist) {
        alert('Please fill all route fields');
        return;
    }
    if (!routes[from]) routes[from] = {};
    if (!routes[to]) routes[to] = {};
    
    routes[from][to] = dist;
    routes[to][from] = dist;

    locations.add(from);
    locations.add(to);
    document.getElementById('fromLocation').value = '';
    document.getElementById('toLocation').value = '';
    document.getElementById('distance').value = '';

    updateLocationsList();
}
function updateProductsList() {
    const list = document.getElementById('productsList');
    list.innerHTML = '';
    
    products.forEach((p) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-item';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'product-info';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'product-name';
        nameDiv.textContent = p.name;
        
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'product-details';
        detailsDiv.textContent = `Weight: ${p.weight}kg | Quantity: ${p.quantity} | Destination: ${p.destination}`;
        
        infoDiv.appendChild(nameDiv);
        infoDiv.appendChild(detailsDiv);
        productDiv.appendChild(infoDiv);
        list.appendChild(productDiv);
    });
}
function updateLocationsList() {
    const list = document.getElementById('locationsList');
    list.innerHTML = '';
    
    Array.from(locations).forEach(loc => {
        const locDiv = document.createElement('div');
        locDiv.className = 'location-item';
        locDiv.textContent = loc;
        list.appendChild(locDiv);
    });
}
function knapsack(items, capacity) {
    const n = items.length;
    const dp = Array(n + 1).fill(null).map(() => Array(capacity + 1).fill(0));
        for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity; w++) {
            const item = items[i - 1];
            const itemWeight = Math.floor(item.weight);
            
            if (itemWeight <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    dp[i - 1][w - itemWeight] + item.quantity
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    const selected = [];
    let w = capacity;
    for (let i = n; i > 0; i--) {
        if (dp[i][w] !== dp[i - 1][w]) {
            selected.push(items[i - 1]);
            w -= Math.floor(items[i - 1].weight);
        }
    }

    return { selected, totalQuantity: dp[n][capacity] };
}
function tsp(locations, distances, start) {
    const n = locations.length;
    if (n <= 1) return { path: locations, distance: 0 };

    const visited = new Set([start]);
    const path = [start];
    let totalDist = 0;
    let current = start;
    while (visited.size < n) {
        let nearest = null;
        let minDist = Infinity;

        for (const loc of locations) {
            if (!visited.has(loc) && distances[current] && distances[current][loc]) {
                if (distances[current][loc] < minDist) {
                    minDist = distances[current][loc];
                    nearest = loc;
                }
            }
        }
        if (nearest) {
            visited.add(nearest);
            path.push(nearest);
            totalDist += minDist;
            current = nearest;
        } else {
            break;
        }
    }
    if (distances[current] && distances[current][start]) {
        totalDist += distances[current][start];
        path.push(start);
    }

    return { path, distance: totalDist };
}
function floydWarshall(locations, routes) {
    const n = locations.length;
    const dist = {};
    const next = {};
    for (const loc of locations) {
        dist[loc] = {};
        next[loc] = {};
        for (const loc2 of locations) {
            dist[loc][loc2] = loc === loc2 ? 0 : Infinity;
            next[loc][loc2] = null;
        }
    }
    for (const from in routes) {
        for (const to in routes[from]) {
            dist[from][to] = routes[from][to];
            next[from][to] = to;
        }
    }
    for (const k of locations) {
        for (const i of locations) {
            for (const j of locations) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    next[i][j] = next[i][k];
                }
            }
        }
    }

    return { dist, next };
}
function optimizeDelivery() {
    if (products.length === 0) {
        alert('Please add products first');
        return;
    }

    const capacity = parseInt(document.getElementById('truckCapacity').value);

    const { selected, totalQuantity } = knapsack(products, capacity);
        const destinations = new Set(['Warehouse']);
    selected.forEach(p => destinations.add(p.destination));
    const locArray = Array.from(destinations);
    const { path: tspPath, distance: tspDistance } = tsp(locArray, routes, 'Warehouse');
    const locationsArray = Array.from(locations);
    const { dist: shortestPaths } = floydWarshall(locationsArray, routes);
    const totalWeight = selected.reduce((sum, p) => sum + p.weight, 0);
    document.getElementById('statItems').textContent = selected.length;
    document.getElementById('statWeight').textContent = totalWeight.toFixed(1) + 'kg';
    document.getElementById('statValue').textContent = totalQuantity;
    document.getElementById('statDistance').textContent = tspDistance.toFixed(1) + 'km';
    const loadedItemsDiv = document.getElementById('loadedItems');
    loadedItemsDiv.innerHTML = '';
    selected.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'loaded-item';
        itemDiv.innerHTML = `<strong>${item.name}</strong><br>${item.weight}kg | Qty: ${item.quantity}<br>Destination: ${item.destination}`;
        loadedItemsDiv.appendChild(itemDiv);
    });
    const routePathDiv = document.getElementById('routePath');
    routePathDiv.innerHTML = '';
    tspPath.forEach((loc, i) => {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'location-node';
        nodeDiv.textContent = loc;
        routePathDiv.appendChild(nodeDiv);
        
        if (i < tspPath.length - 1) {
            const arrowSpan = document.createElement('span');
            arrowSpan.className = 'arrow';
            arrowSpan.textContent = '→';
            routePathDiv.appendChild(arrowSpan);
        }
    });
 document.getElementById('routeDistance').textContent = tspDistance.toFixed(2);
    const table = document.getElementById('distanceTable');
    table.innerHTML = '';
    const headerRow = document.createElement('tr');
    const cornerCell = document.createElement('th');
    cornerCell.textContent = 'From / To';
    headerRow.appendChild(cornerCell);
    
    locationsArray.forEach(loc => {
        const th = document.createElement('th');
        th.textContent = loc;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
        locationsArray.forEach(from => {
        const row = document.createElement('tr');
        const headerCell = document.createElement('th');
        headerCell.textContent = from;
        row.appendChild(headerCell);
        
        locationsArray.forEach(to => {
            const cell = document.createElement('td');
            const distance = shortestPaths[from] && shortestPaths[from][to] !== Infinity 
                ? shortestPaths[from][to].toFixed(1) 
                : '∞';
            cell.textContent = distance;
            row.appendChild(cell);
        });
        
        table.appendChild(row);
    });
    document.getElementById('results').style.display = 'block';
}
function reset() {
    products = [];
    routes = {};
    locations = new Set(['Warehouse']);
    document.getElementById('productsList').innerHTML = '';
    document.getElementById('locationsList').innerHTML = '';
    document.getElementById('results').style.display = 'none';
    updateLocationsList();
}
updateLocationsList();
