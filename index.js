import GraphVertex from './graph/GraphVertex.js';
import GraphEdge from './graph/GraphEdge.js';
import Graph from './graph/Graph.js';
import bellmanFord from './bellman-ford.js';

import fs from 'fs';
import minimist from 'minimist';


const args = minimist(process.argv.slice(2));
const pathToFile = args.f || args.file || './input.json';
const padding = args.p || args.padding || 4;
const paddingPath = args.pp || args['padding-path'] || 16;


try {
    const results = solveProblem(pathToFile);

    console.log('Matrix');
    console.log(results.matrix);

    console.log('Shortest Path Lengths');
    console.log(results.pathLengths);

    console.log('Shortest Paths');
    console.log(results.paths);

}
catch (e) {
    console.error(e.message);
}

function solveProblem(pathToFile) {
    const matrix = readMatrix(pathToFile);
    validateMatrix(matrix);

    const graph = convertMatrixToGraph(matrix);
    const results = getAlgorithmResultsFromGraph(graph);
    return {
        matrix: matrixToString(matrix, padding),
        paths: pathsToString(results.previousVerticles, matrix, paddingPath),
        pathLengths: distancesToString(results.distances, matrix, padding)
    };
}

function readMatrix(pathToFile) {
    try {
        return JSON.parse(fs.readFileSync(pathToFile, 'utf-8'));
    }
    catch(e) {
        return null;
    }
}

function validateMatrix(input) {
    if (!Array.isArray(input)) {
        throw new Error(`Input cannot be parsed as a matrix - it is not an array`);
    }

    if (input.some(array => !Array.isArray(array))) {
        throw new Error(`Input cannot be parsed as a matrix - it must be comprised of arrays only`);
    }

    const arrayLength = input[0].length;
    if (input.some(array => array.length != arrayLength)) {
        throw new Error(`Input cannot be parsed as a matrix - all of its arrays must be the same length`);
    }

    if (input.some((array, i) => array[i] !== 0)) {
        throw new Error(`The main diagonal of the matrix must all be zero`);
    }
}

function matrixToString(matrix, padding = 0) {
    let heading = ''.padStart(padding);
    heading += matrix.reduce((heading, column, i) => heading + numToLetters(i).padStart(padding) + ' ', '');

    return heading + '\n' + matrix.reduce((str, column, i) => {
        str += numToLetters(i).padStart(padding);
        str += column.reduce((str, weight, j) => {
            return str + String(
                typeof weight == 'string'
                || typeof weight == 'number' && isFinite(weight)
                ? weight
                : '-'
            ).padStart(padding) + ' ';
        }, '');
        return str + '\n';
    }, '');
}

function distancesToString(distances, matrix, padding) {
    return matrixToString(
        matrix.map((column, i) =>
            column.map((cell, j) =>
                distances[numToLetters(i)][numToLetters(j)]
            )
        ),
        padding
    );
}

function pathsToString(previousVerticles, matrix, padding) {
    return matrixToString(
        matrix.map((column, i) =>
            column.map((cell, j) => {
                const verticleGroup = previousVerticles[numToLetters(i)];
                let previousVerticle = verticleGroup[numToLetters(j)];
                let path = previousVerticle ? [numToLetters(j)] : [];

                while (previousVerticle) {
                    path.unshift(previousVerticle.getKey());
                    previousVerticle = verticleGroup[previousVerticle.getKey()];
                }

                return path.length > 0 ? path.join(' -> ') : null;
            })
        ),
        padding
    );
}

function convertMatrixToGraph(matrix) {
    const graph = new Graph(true);
    const vertexes = matrix.map((column, i) => new GraphVertex(numToLetters(i)));
    vertexes.forEach(vertex => graph.addVertex(vertex));

    matrix.forEach((column, i) => {
        column.forEach((weight, j) => {

            if (i == j || typeof weight != 'number' || isNaN(weight)) {
                return;
            }

            graph.addEdge(new GraphEdge(vertexes[i], vertexes[j], weight));
        });
    });

    return graph;
}

function numToLetters(number) {
    var baseChar = ("A").charCodeAt(0),
        letters = "";

    number++;

    do {
        number -= 1;
        letters = String.fromCharCode(baseChar + (number % 26)) + letters;
        number = Math.floor(number / 26);
    } while (number > 0);

    return letters;
}

function getAlgorithmResultsFromGraph(graph) {
    return graph.getAllVertices().reduce((results, verticle) => {
        const _results = bellmanFord(graph, verticle);
        results.distances[verticle.getKey()] = _results.distances;
        results.previousVerticles[verticle.getKey()] = _results.previousVertices;
        return results;
    }, {
        distances: {},
        previousVerticles: {}
    });
}
