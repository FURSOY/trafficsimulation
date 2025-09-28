
window.onload = function() {
    // --- DOM Elements ---
    const canvas = document.getElementById('mapCanvas');
    const ctx = canvas.getContext('2d');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const fileInput = document.getElementById('fileInput');
    const drawRoadBtn = document.getElementById('drawRoadBtn');
    const placeUturnBtn = document.getElementById('placeUturnBtn');
    const laneCountInput = document.getElementById('laneCount');

    // --- Constants ---
    const LANE_WIDTH = 15; // Width of a single lane in pixels

    // --- State ---
    let tool = 'drawRoad'; // 'drawRoad', 'placeUturn', etc.
    let roads = [];
    let mapObjects = [];
    let currentRoadPoints = [];

    // --- Functions ---

    /**
     * Main drawing function. Clears and redraws the entire map.
     */
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all finalized roads
        roads.forEach(drawRoad);

        // Draw all placed map objects
        mapObjects.forEach(drawMapObject);

        // Draw the road currently being created (live preview)
        if (currentRoadPoints.length > 0) {
            drawPolyline(currentRoadPoints, '#007bff', 2, [5, 10]); // Dashed line for preview
        }
    }

    /**
     * Draws a single road object with multiple lanes.
     * @param {object} road - The road object { id, points, lanes }
     */
    function drawRoad(road) {
        for (let i = 0; i < road.points.length - 1; i++) {
            const p1 = road.points[i];
            const p2 = road.points[i+1];

            const roadWidth = road.lanes * LANE_WIDTH;
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const perpAngle = angle + Math.PI / 2; // Perpendicular angle

            // Calculate offsets for road edges
            const dx = Math.cos(perpAngle) * roadWidth / 2;
            const dy = Math.sin(perpAngle) * roadWidth / 2;

            // Draw outer lines
            const outer1 = { start: { x: p1.x + dx, y: p1.y + dy }, end: { x: p2.x + dx, y: p2.y + dy } };
            const outer2 = { start: { x: p1.x - dx, y: p1.y - dy }, end: { x: p2.x - dx, y: p2.y - dy } };
            drawLine(outer1.start, outer1.end, '#333', 3);
            drawLine(outer2.start, outer2.end, '#333', 3);

            // Draw inner lane dividers (dashed lines)
            for (let j = 1; j < road.lanes; j++) {
                const laneOffset = (j * LANE_WIDTH) - (roadWidth / 2);
                const ldx = Math.cos(perpAngle) * laneOffset;
                const ldy = Math.sin(perpAngle) * laneOffset;
                const lane = { start: { x: p1.x + ldx, y: p1.y + ldy }, end: { x: p2.x + ldx, y: p2.y + ldy } };
                drawLine(lane.start, lane.end, '#888', 1, [10, 10]); // Dashed line
            }
        }
    }
    
    /**
     * Draws a generic map object based on its type.
     * @param {object} obj - The map object { id, type, position }
     */
    function drawMapObject(obj) {
        if (obj.type === 'uturn') {
            drawUturn(obj.position);
        }
    }

    /**
     * Draws a U-turn symbol at a given position.
     * @param {object} pos - The position { x, y }
     */
    function drawUturn(pos) {
        ctx.save();
        ctx.strokeStyle = '#009933';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 15, Math.PI, 0);
        ctx.moveTo(pos.x - 15, pos.y);
        ctx.lineTo(pos.x - 15, pos.y + 20);
        ctx.moveTo(pos.x + 15, pos.y);
        ctx.lineTo(pos.x + 15, pos.y + 20);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(pos.x - 15, pos.y + 20);
        ctx.lineTo(pos.x - 20, pos.y + 15);
        ctx.lineTo(pos.x - 10, pos.y + 15);
        ctx.closePath();
        ctx.fillStyle = '#009933';
        ctx.fill();
        ctx.restore();
    }

    /**
     * Helper to draw a simple line between two points.
     */
    function drawLine(p1, p2, color = '#333', width = 1, dash = []) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Helper to draw a polyline from an array of points.
     */
    function drawPolyline(points, color, width, dash = []) {
        if (points.length < 2) return;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.setLineDash(dash);
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Finalizes the current road, adds it to the main array, and resets.
     */
    function finalizeCurrentRoad() {
        if (currentRoadPoints.length > 1) {
            const newRoad = {
                id: `road_${Date.now()}`,
                points: currentRoadPoints,
                lanes: parseInt(laneCountInput.value, 10) || 2,
            };
            roads.push(newRoad);
        }
        currentRoadPoints = [];
        draw();
    }
    
    /**
     * Sets the active tool and updates button styles.
     * @param {string} newTool - The name of the tool to activate.
     */
    function setActiveTool(newTool) {
        // Finalize any road-in-progress before switching tools
        if (tool === 'drawRoad' && currentRoadPoints.length > 0) {
            finalizeCurrentRoad();
        }
        tool = newTool;
        
        drawRoadBtn.classList.toggle('active', tool === 'drawRoad');
        placeUturnBtn.classList.toggle('active', tool === 'placeUturn');
        
        canvas.style.cursor = (tool === 'drawRoad') ? 'crosshair' : 'pointer';
    }

    // --- Event Handlers ---

    function handleCanvasClick(e) {
        const pos = { x: e.offsetX, y: e.offsetY };
        if (tool === 'drawRoad') {
            currentRoadPoints.push(pos);
            draw(); // Redraw to show the new point
        } else if (tool === 'placeUturn') {
            mapObjects.push({
                id: `obj_${Date.now()}`,
                type: 'uturn',
                position: pos
            });
            draw();
        }
    }

    function handleCanvasDblClick(e) {
        if (tool === 'drawRoad') {
            finalizeCurrentRoad();
        }
    }
    
    function handleCanvasMouseMove(e) {
        if (tool === 'drawRoad' && currentRoadPoints.length > 0) {
            draw(); // Redraws everything
            const lastPoint = currentRoadPoints[currentRoadPoints.length - 1];
            const currentPos = { x: e.offsetX, y: e.offsetY };
            drawLine(lastPoint, currentPos, '#007bff', 2, [5, 10]); // Draw preview line
        }
    }

    function handleSave() {
        finalizeCurrentRoad(); // Save any unfinished road
        if (roads.length === 0 && mapObjects.length === 0) {
            alert('Kaydedilecek bir şey yok!');
            return;
        }
        const mapData = { roads, mapObjects, version: 1 };
        const jsonData = JSON.stringify(mapData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'map.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    function handleLoad() {
        fileInput.click();
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const mapData = JSON.parse(event.target.result);
                if (mapData && mapData.roads) {
                    roads = mapData.roads || [];
                    mapObjects = mapData.mapObjects || [];
                    currentRoadPoints = [];
                    draw();
                    alert('Harita başarıyla yüklendi!');
                } else {
                    alert('Geçersiz harita dosyası!');
                }
            } catch (error) {
                alert('Harita dosyası okunurken bir hata oluştu: ' + error.message);
            }
        };
        reader.readAsText(file);
        // Reset file input so the same file can be loaded again
        e.target.value = '';
    }

    // --- Initial Setup ---
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('dblclick', handleCanvasDblClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    
    saveBtn.addEventListener('click', handleSave);
    loadBtn.addEventListener('click', handleLoad);
    fileInput.addEventListener('change', handleFileSelect);

    drawRoadBtn.addEventListener('click', () => setActiveTool('drawRoad'));
    placeUturnBtn.addEventListener('click', () => setActiveTool('placeUturn'));

    setActiveTool('drawRoad'); // Set initial tool
    draw(); // Initial draw
};