export default function bellmanFord(graph, startVertex) {
    const distances = {};

    // Init all distances with infinity assuming that currently we can't reach
    // any of the vertices except start one.
    distances[startVertex.getKey()] = 0;
    for (let vertex of graph.getAllVertices()) {
        if (vertex.getKey() !== startVertex.getKey()) {
            distances[vertex.getKey()] = Infinity;
        }
    };

    // We need (|V| - 1) iterations.
    for (let iteration = 0; iteration < (graph.getAllVertices().length - 1); iteration += 1) {
        // During each iteration go through all vertices.
        for (let vertexKey of Object.keys(distances)) {
            const vertex = graph.getVertexByKey(vertexKey);

            // Go through all vertex edges.
            for (let neighbor of graph.getNeighbors(vertex)) {
                const edge = graph.findEdge(vertex, neighbor);
                // Find out if the distance to the neighbor is shorter in this iteration
                // then in previous one.
                const distanceToVertex = distances[vertex.getKey()];
                const distanceToNeighbor = distanceToVertex + edge.weight;
                if (distanceToNeighbor < distances[neighbor.getKey()]) {
                    distances[neighbor.getKey()] = distanceToNeighbor;
                }
            };
        };
    }

    return distances;
}
