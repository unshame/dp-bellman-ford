import GraphVertex from './graph/GraphVertex.js';
import GraphEdge from './graph/GraphEdge.js';
import Graph from './graph/Graph.js';
import bellmanFord from './bellman-ford.js';

import fs from 'fs';
import minimist from 'minimist';


const args = minimist(process.argv.slice(2));
const pathToFile = args.f || args.file || './input.json';
const padding = args.p || args.padding || 4;


try {
    const results = solveProblem(pathToFile);
    console.log('Input');
    console.log(results.input);
    console.log('Output');
    console.log(results.output);
}
catch (e) {
    console.error(e.message);
}

function solveProblem(pathToFile) {
    const matrix = readMatrix(pathToFile);
    validateMatrix(matrix);

    const graph = convertMatrixToGraph(matrix);
    return {
        input: matrixToString(matrix, padding),
        output: resultsToString(getAlgorithmResultsFromGraph(graph), matrix, padding)
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
            return str + String(typeof weight == 'number' && isFinite(weight) ? weight : '-').padStart(padding) + ' ';
        }, '');
        return str + '\n';
    }, '');
}

function resultsToString(results, matrix, padding) {
    return matrixToString(
        matrix.map((column, i) =>
            column.map((cell, j) =>
                results[numToLetters(i)][numToLetters(j)]
            )
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
        results[verticle.getKey()] = bellmanFord(graph, verticle);
        return results;
    }, {});
}
