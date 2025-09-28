class GraphEditor {
    constructor(viewport, graph) {
        this.viewport = viewport;
        this.canvas = viewport.canvas;
        this.graph = graph;

        this.ctx = this.canvas.getContext("2d");

        this.selected = null;
        this.hovered = null;
        this.dragging = false;
        this.mouse = null;

        this.gridSize = 20; // Default grid size
        this.gridEnabled = false; // Grid snapping is off by default

        this.#addEventListeners();
    }

    dispose() {
        this.graph.dispose();
        this.selected = null;
        this.hovered = null;
    }

    toggleGrid() {
        this.gridEnabled = !this.gridEnabled;
        console.log("Grid snapping: " + (this.gridEnabled ? "ON" : "OFF"));
        return this.gridEnabled; // Return the new state
    }

    #addEventListeners() {
        this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
        this.canvas.addEventListener("contextmenu", (evt) => evt.preventDefault());
        this.canvas.addEventListener("mouseup", () => this.dragging = false);
        document.addEventListener("keydown", this.#handleKeyDown.bind(this)); // Re-add keydown listener
    }

    #handleKeyDown(evt) {
        if (evt.code === "KeyG") { // Toggle grid snapping with 'G' key
            const newState = this.toggleGrid();
            // This part will be handled by the index.html script for button visual update
            // For now, just log
            console.log("Grid snapping (from key): " + (newState ? "ON" : "OFF"));
        }
    }

    #handleMouseMove(evt) {
        this.mouse = this.viewport.getMouse(evt, true);
        this.hovered = getNearestPoint(this.mouse, this.graph.points, 10 * this.viewport.zoom);
        if (this.dragging == true) {
            let newPos = this.mouse;
            if (this.gridEnabled) {
                newPos = this.#snap(this.mouse);
            }
            this.selected.x = newPos.x;
            this.selected.y = newPos.y;
        }
    }

    #handleMouseDown(evt) {
        if (evt.button == 2) { // right click
            if (this.selected) {
                this.selected = null;
            }
            else if (this.hovered) {
                this.#removePoint(this.hovered);
            }
        }
        if (evt.button == 0) { // left click
            if (this.hovered) {
                this.#select(this.hovered);
                this.dragging = true;
                return;
            }
            let newPoint = this.mouse;
            if (this.gridEnabled) {
                newPoint = this.#snap(this.mouse);
            }
            this.graph.addPoint(newPoint);
            this.#select(newPoint);
            this.hovered = newPoint;
        }
    }

    #snap(point) {
        const snappedX = Math.round(point.x / this.gridSize) * this.gridSize;
        const snappedY = Math.round(point.y / this.gridSize) * this.gridSize;
        return new Point(snappedX, snappedY);
    }

    #select(point) {
        if (this.selected) {
            this.graph.tryAddSegment(new Segment(this.selected, point));
        }
        this.selected = point;
    }

    #removePoint(point) {
        this.graph.removePoint(point);
        this.hovered = null;
        if (this.selected == point) {
            this.selected = null;
        }
    }

    display(ctx) {
        if (this.hovered) {
            this.hovered.draw(ctx, { fill: true });
        }
        if (this.selected) {
            const intent = this.hovered ? this.hovered : this.mouse;
            new Segment(this.selected, intent).draw(ctx, { dash: [3, 3] });
            this.selected.draw(ctx, { outline: true });
        }

        // Optionally draw grid lines if enabled
        if (this.gridEnabled) {
            this.#drawGrid(ctx);
        }
    }

    #drawGrid(ctx) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;

        const { left, right, top, bottom } = this.viewport.getExtents();

        for (let x = Math.floor(left / this.gridSize) * this.gridSize; x < right; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();
        }

        for (let y = Math.floor(top / this.gridSize) * this.gridSize; y < bottom; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.stroke();
        }
    }
}