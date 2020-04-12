export type Color = 'red' | 'green' | 'blue'

export function allValidThreeColorings(vertices: number[], edges: [number, number][]): Color[][] {
    return allThreeColorings(vertices.length).filter(coloring => !edges.some(([a, b]) => coloring[a] === coloring[b]))

}

export function allThreeColorings(numberOfVertices: number): Color[][] {
    if (numberOfVertices === 0) {
        return [[], [], []]
    }

    const colorings = allThreeColorings(numberOfVertices - 1)

    const redsInFront = colorings.map(coloring => ['red' as Color].concat(coloring))
    const greensInFront = colorings.map(coloring => ['green' as Color].concat(coloring))
    const bluesInFront = colorings.map(coloring => ['blue' as Color].concat(coloring))

    return [...redsInFront, ...greensInFront, ...bluesInFront]
}

export function isochromacies(numberOfVertices: number, colorings: Color[][]): Isochromacy[] {
    if (colorings.length === 0) {
        return range(numberOfVertices).map(_ => ({name: 'Graph Not 3-Colorable'}))
    }

    let unions: number[][] = colorings.map((_, index) => [index])

    for (let i = 0; i < numberOfVertices; i++) {
        for (let j = 0; j < i; j++) {
            if (colorings.every(coloring => coloring[i] === coloring[j])) {
                unions = join(i, j, unions)
            }
        }
    }

    return range(numberOfVertices).map(vertexNumber => {
        const group = unions.findIndex(union => union.includes(vertexNumber))
        return (unions[group].length === 1) ? {name: 'Independent Vertex'} : {name: 'In Color Group', group}
    })
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

export type Isochromacy = {
    name: 'In Color Group',
    group: number
} | {
    name: 'Independent Vertex'
} | {
    name: 'Graph Not 3-Colorable'
}

