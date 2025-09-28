class World {
    constructor(graph) {
        this.graph = graph;
    }

    draw(ctx) {
        this.graph.draw(ctx);
    }
}