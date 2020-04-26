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
    const threeColorings = allThreeColorings(range(numberOfVertices), edges)
    const primes = findPrimes(numberOfVertices, edges)

    if (threeColorings.length === 0) {
        return {isThreeColorable: false, primes}
    }

    let isochromaticVertices: number[][] = threeColorings.map((_, index) => [index])
    let quasiEdges: [number, number][] = []

    for (let i = 0; i < numberOfVertices; i++) {
        for (let j = 0; j < i; j++) {
            if (threeColorings.every(coloring => coloring[i] === coloring[j])) {
                isochromaticVertices = join(i, j, isochromaticVertices)
            }

            if (threeColorings.every(coloring => coloring[i] !== coloring[j] && !hasEdge(edges, i, j))) {
                quasiEdges.push([i, j])
            }
        }
    }

    return {
        isThreeColorable: true,
        primes,
        isochromaticVertices: isochromaticVertices.filter(group => group.length >= 2),
        quasiEdges,
        threeColorings
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
    primes: Prime[]
} | {
    isThreeColorable: true
    primes: Prime[]
    isochromaticVertices: number[][]
    quasiEdges: [number, number][]
    threeColorings: Color[][]
}

export function simplify(numberOfVertices: number, edges: [number, number][]): [number, number][] {
    console.log('got in here')

    const report: IsochromacyReport = isochromacyReport(numberOfVertices, edges)

    if (report.isThreeColorable === false) {
        return []
    }

    let result: [number, number][] = []

    for (let i = 0; i < edges.length; i++) {
        const withOneEdgeRemoved = [...edges.slice(0, i), ...edges.slice(i + 1, edges.length)]
        const newReport = isochromacyReport(numberOfVertices, withOneEdgeRemoved)

        if (
            newReport.isThreeColorable === true &&
            newReport.isochromaticVertices.length === report.isochromaticVertices.length &&
            newReport.quasiEdges.length === report.quasiEdges.length
        ) {
            result.push(edges[i])
        }
    }

    return result
}

export type Prime = Diamond | QE8 | HC3n2 | OCC2n3 | Courtney

function findPrimes(numberOfVertices: number, edges: [number, number][]): Prime[] {
    return [
        ...findDiamonds(numberOfVertices, edges),
        ...findQE8s(numberOfVertices, edges),
        ...findOCs(numberOfVertices, edges),
        ...findOCCPs(numberOfVertices, edges),
        ...findCourtneys(numberOfVertices, edges)
    ]
}

type Diamond = {
    name: 'Diamond'
    top: number
    left: number
    right: number
    bottom: number
}

type QE8 = {
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

type HC3n2 = {
    name: 'HC3n2'
    hornPath: number[]
    endpointConnector: number
    hornConnector: number
}

type OCC2n3 = {
    name: 'OCC2n3',
    first: number,
    second: number,
    oddCycle: number[]
}

type Courtney = {
    name: 'Courtney',
    outer: number,
    
    topLeft: number,
    topMiddle: number
    topRight: number

    middleLeft: number
    middleMiddle: number
    middleRight: number

    bottomLeft: number
    bottomMiddle: number
    bottomRight: number
}

type Cycle = {
    name: 'Cycle'
    vertices: number[]
}

type Path = {
    name: 'Path'
    vertices: number[]
}

function findDiamonds(numberOfVertices: number, edges: [number, number][]): Diamond[] {
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

function findQE8s(numberOfVertices: number, edges: [number, number][]): QE8[] {
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

function findOCs(numberOfVertices: number, edges: [number, number][]): HC3n2[] {
    let result: HC3n2[] = []

    const cycles: number[][] = flatMap(
        range(numberOfVertices)
            .map(n => (3 * n) + 1)
            .filter(n => n < numberOfVertices),
        n => findCycles(n, numberOfVertices, edges).map(cycle => cycle.vertices)
    )

    const eligibleCycles = cycles.filter(([first, ...rest]) => range(rest.length)
        .map(n => 3 * n + 1)
        .filter(n => n < rest.length)
        .map(n => [n - 1, n + 1])
        .every(([i, j]) => hasEdge(edges, rest[i], rest[j]))
    )

    for (let i = 0; i < numberOfVertices; i++) {
        for (let j = 0; j < eligibleCycles.length; j++) {
            const cycle = eligibleCycles[j]
            const [first, ...rest] = cycle
            if (!cycle.includes(i) && range(rest.length)
                .map(n => 3 * n + 1)
                .filter(n => n < rest.length)
                .every(k => hasEdge(edges, rest[k], i))
            ) {
                result.push({
                    name: 'HC3n2',
                    endpointConnector: first,
                    hornPath: rest,
                    hornConnector: i
                })
            }
        }
    }

    return result
}

function findOCCPs(numberOfVertices: number, edges: [number, number][]): OCC2n3[] {
    let result: OCC2n3[] = []
    
    const oddCycles = findAllOddCycles(numberOfVertices, edges).map(x => x.vertices)

    for (let i = 0; i < numberOfVertices; i++) {
        for (let j = 0; j < i; j++) {
            for (let k = 0; k < oddCycles.length; k++) {
                const oddCycle = oddCycles[k]

                if (
                    !oddCycle.includes(i) &&
                    !oddCycle.includes(j) &&
                    oddCycle.some(vertex => hasEdge(edges, i, vertex)) &&
                    oddCycle.some(vertex => hasEdge(edges, j, vertex)) &&
                    oddCycle.every(vertex => hasEdge(edges, i, vertex) || hasEdge(edges, j, vertex))
                ) {
                    result.push({
                        name: 'OCC2n3',
                        first: i,
                        second: j,
                        oddCycle: oddCycle
                    })
                }
            }
        }
    }

    return result
}

function findCourtneys(numberOfVertices: number, edges: [number, number][]): Courtney[] {
    return findCycles(10, numberOfVertices, edges)
        .map(cycles => cycles.vertices)
        .filter(([outer, bottomLeft, bottomMiddle, bottomRight, middleRight, middleMiddle, middleLeft, topLeft, topMiddle, topRight]) => 
            hasEdge(edges, bottomLeft, bottomRight) &&
            hasEdge(edges, bottomLeft, middleLeft) &&
            hasEdge(edges, bottomMiddle, middleMiddle) &&
            hasEdge(edges, middleMiddle, topMiddle) &&
            hasEdge(edges, middleRight, topRight) &&
            hasEdge(edges, outer, topLeft))
        .map(([outer, bottomLeft, bottomMiddle, bottomRight, middleRight, middleMiddle, middleLeft, topLeft, topMiddle, topRight]) => ({
            name: 'Courtney',
            outer, bottomLeft, bottomMiddle, bottomRight, middleRight, middleMiddle, middleLeft, topLeft, topMiddle, topRight
        }))
}

function findAllOddCycles(numberOfVertices: number, edges: [number, number][]): Cycle[] {
    return flatMap(
        range(numberOfVertices)
            .map(n => (2 * n) + 3)
            .filter(n => n <= numberOfVertices),
        n => findCycles(n, numberOfVertices, edges)
    )
}

function findCycles(cycleLength: number, numberOfVertices: number, edges: [number, number][]): Cycle[] {
    return findPaths(cycleLength, numberOfVertices, edges)
        .filter(path => hasEdge(edges, path.vertices[0], path.vertices[cycleLength - 1]))
        .map(path => ({name: 'Cycle', vertices: path.vertices}))
}

function findPaths(pathLength: number, numberOfVertices: number, edges: [number, number][]): Path[] {
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