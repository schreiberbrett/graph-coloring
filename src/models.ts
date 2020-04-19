export type Color = 'red' | 'green' | 'blue'

export function allThreeColorings(vertices: number[], edges: [number, number][]): Color[][] {
    if (vertices.length === 0) {
        return []
    }

    if (vertices.length === 1) {
        return [['red'], ['green'], ['blue']]
    }

    const init = vertices.slice(0, vertices.length - 1)
    const last = vertices[length - 1]

    const result = allThreeColorings(init, edges)

    if (result.length === 0) return []

    const withRed = result.map(x => x.concat('red'))
    const withGreen = result.map(x => x.concat('blue'))
    const withBlue = result.map(x => x.concat('green'))

    const colorings = [...withRed, ...withGreen, ...withBlue]

    return colorings.filter(coloring => edges.every(([a, b]) => !((coloring.length > a && coloring.length > b) && coloring[a] === coloring[b])))
}

export function isochromacyReport(numberOfVertices: number, edges: [number, number][]): IsochromacyReport {
    const colorings = allThreeColorings(range(numberOfVertices), edges)

    if (colorings.length === 0) {
        return {isThreeColorable: false}
    }

    let isochromaticVertices: number[][] = colorings.map((_, index) => [index])
    let quasiEdges: [number, number][] = []

    for (let i = 0; i < numberOfVertices; i++) {
        for (let j = 0; j < i; j++) {
            if (colorings.every(coloring => coloring[i] === coloring[j])) {
                isochromaticVertices = join(i, j, isochromaticVertices)
            }

            if (colorings.every(coloring => coloring[i] !== coloring[j] && !hasEdge(edges, i, j))) {
                quasiEdges.push([i, j])
            }
        }
    }

    return {
        isThreeColorable: true,
        isochromaticVertices: isochromaticVertices.filter(group => group.length >= 2),
        quasiEdges
    }
}

function range(n: number): number[] {
    let result = []
    for (let i = 0; i < n; i++) {
        result.push(i)
    }

    return result
}

function join(i: number, j: number, unions: number[][]): number[][] {
    const iIndex = unions.findIndex(union => union.includes(i))
    const jIndex = unions.findIndex(union => union.includes(j))
    const result = unions[iIndex].concat(unions[jIndex])

    return [result, ...unions.filter((_, index) => index !== iIndex && index !== jIndex)]
}

export type IsochromacyReport = {
    isThreeColorable: false
} | {
    isThreeColorable: true
    isochromaticVertices: number[][]
    quasiEdges: [number, number][]
}

export type Diamond = {
    name: 'Diamond'
    top: number
    left: number
    right: number
    bottom: number
}

export type QE7 = {
    name: 'QE7'
    outerTop: number
    outerLeft: number
    outerMiddle: number
    outerRight: number
    innerTop: number
    innerLeft: number
    innerRight: number
}

export type QE8 = {
    name: 'QE8'
    outerTop: number,
    leftTop: number,
    leftMiddle: number,
    leftBottom: number,
    rightTop: number,
    rightMiddle: number,
    rightBottom: number,
    outerBottom: number
}

export type OC = {
    name: 'OC'
    hornPath: number[]
    endpointConnector: number
    hornConnector: number
}

export type Cycle = {
    name: 'Cycle'
    vertices: number[]
}

export type Path = {
    name: 'Path'
    vertices: number[]
}

export function findDiamonds(numberOfVertices: number, edges: [number, number][]): Diamond[] {
    let result: Diamond[] = []

    for (let i = 0; i < edges.length; i++) {
        const [a, b] = edges[i]

        for (let j = 0; j < numberOfVertices; j++) {
            for (let k = 0; k < j; k++) {
                if (
                    !(edges[i].includes(j) || edges[i].includes(k)) &&
                    hasEdge(edges, j, a) &&
                    hasEdge(edges, j, b) &&
                    hasEdge(edges, k, a) &&
                    hasEdge(edges, k, b)
                ) {
                    result.push({
                        name: 'Diamond',
                        top: j,
                        left: a,
                        right: b,
                        bottom: k
                    })
                }
            }
        }
    }

    return result
}

export function findQE7s(numberOfVertices: number, edges: [number, number][]): QE7[] {
    return findCycles(7, numberOfVertices, edges)
        .map(cycle => cycle.vertices)
        .filter(([outerTop, innerTop, innerRight, innerLeft, outerLeft, outerMiddle, outerRight]) =>
            hasEdge(edges, outerTop, outerLeft) &&
            hasEdge(edges, innerTop, innerLeft) &&
            hasEdge(edges, outerRight, innerRight))
        .map(([outerTop, innerTop, innerRight, innerLeft, outerLeft, outerMiddle, outerRight]) =>
            ({name: 'QE7', outerTop, innerTop, innerRight, innerLeft, outerLeft, outerMiddle, outerRight}))
}

export function findQE8s(numberOfVertices: number, edges: [number, number][]): QE8[] {
    return findCycles(8, numberOfVertices, edges)
        .map(cycle => cycle.vertices)
        .filter(([outerTop, leftTop, leftMiddle, leftBottom, outerBottom, rightBottom, rightMiddle, rightTop]) => 
            hasEdge(edges, leftTop, rightTop) &&
            hasEdge(edges, leftMiddle, rightMiddle) &&
            hasEdge(edges, leftBottom, rightBottom) &&
            hasEdge(edges, rightTop, rightBottom))
        .map(([outerTop, leftTop, leftMiddle, leftBottom, outerBottom, rightBottom, rightMiddle, rightTop]) => 
            ({name: 'QE8', outerTop, leftTop, leftMiddle, leftBottom, outerBottom, rightBottom, rightMiddle, rightTop}))
}

export function findOCs(numberOfVertices: number, edges: [number, number][]): OC[] {
    let result: OC[] = []

    for (let i = 7; i < numberOfVertices; i += 3) {
        const cycles = findCycles(i, numberOfVertices, edges).map(cycles => cycles.vertices).filter(vertices => {
            const [_, ...rest] = vertices

            return range(rest.length / 3)
                .map(n => [3 * n, 3 * n + 2]) // [0, 2], [3, 5], [6, 8]...
                .every(([a, b]) => hasEdge(edges, rest[a], rest[b]))
        })

        for (let j = 0; j < cycles.length; j++) {
            for (let k = 0; k < numberOfVertices; k++) {
                const [first, ...rest] = cycles[j]

                if (
                    !cycles[j].includes(k) &&
                    range(rest.length / 3).map(n => (3 * n) + 1).every(vertex => hasEdge(edges, k, vertex))
                ) {
                    result.push({
                        name: 'OC',
                        endpointConnector: first,
                        hornConnector: k,
                        hornPath: rest
                    })
                }
            }
        }
    }

    return result
}

export function findCycles(cycleLength: number, numberOfVertices: number, edges: [number, number][]): Cycle[] {
    return findPaths(cycleLength, numberOfVertices, edges)
        .filter(path => hasEdge(edges, path.vertices[0], path.vertices[cycleLength - 1]))
        .map(path => ({name: 'Cycle', vertices: path.vertices}))
}

export function findPaths(pathLength: number, numberOfVertices: number, edges: [number, number][]): Path[] {
    return flatMap(range(numberOfVertices), vertex => helper([], vertex))

    function helper(pathSoFar: number[], lastInPath: number): Path[] {
        const fullPath = [...pathSoFar, lastInPath]

        if (fullPath.length === pathLength) {
            return [{
                name: 'Path',
                vertices: fullPath
            }]
        }

        const candidateVertices = range(numberOfVertices).filter(vertex => !pathSoFar.includes(vertex) && hasEdge(edges, lastInPath, vertex))
        
        if (candidateVertices.length === 0) {
            return []
        }

        return flatMap(candidateVertices, vertex => helper(fullPath, vertex))
    }
}

function hasEdge(edges: [number, number][], i: number, j: number): boolean {
    return edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i))
}

function flatMap<A, B>(array: A[], fn: (a: A) => B[]): B[] {
    let result: B[] = []
    for (let i = 0; i < array.length; i++) {
        result = result.concat(fn(array[i]))
    }

    return result
}

// 8 => [[0, 1], [2, 3], [4, 5], [6, 7]]
export function pairedRange(limit: number): [number, number][] {
    return range(limit / 2).map(x => [x * 2, x * 2 + 1])
}