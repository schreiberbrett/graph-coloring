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

            if (colorings.every(coloring => coloring[i] !== coloring[j]) && !edges.includes([i, j]) && !edges.includes([j, i])) {
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
