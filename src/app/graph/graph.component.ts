import { Component } from '@angular/core';
import { isochromacies, Isochromacy, allValidThreeColorings, Color } from '../../models'

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent {
  edges: [number, number][] = []

  vertices: Vertex[] = []

  threeColorings: Color[][] = []

  state: State = {name: 'Neutral'}


  mouseoverSnappableArea(vertexIndex: number) {
    switch (this.state.name) {
      case 'MakingEdge':
        this.maybeSnapEdgeToVertex(this.state, vertexIndex)
        break
    }
  }

  mouseleaveSnappableArea(event: MouseEvent) {
    switch (this.state.name) {
      case 'SnappedEdge':
        this.unsnap(this.state, event)
        break
    }
  }

  clickSnappableArea() {
    switch (this.state.name) {
      case 'SnappedEdge':
        this.makeEdge(this.state)
        break
    }
  }

  mouseoverVertex(vertexIndex: number) {
    switch (this.state.name) {
      case 'Neutral':
        this.startHovering(vertexIndex)
        break

      case 'MakingEdge':
        this.maybeSnapEdgeToVertex(this.state, vertexIndex)
        break
    }
  }

  mouseleaveVertex(event: MouseEvent) {
    switch (this.state.name) {
      case 'Hover':
        this.unhover()
        break

      case 'SnappedEdge':
        this.unsnap(this.state, event)
        break
    }
  }

  mousedownVertex(event: MouseEvent) {
    switch (this.state.name) {
      case 'Hover':
        this.startDragging(this.state, event)
        break
    }
  }

  mouseupVertex() {
    switch (this.state.name) {
      case 'Dragging':
        this.stopDragging(this.state)
        break

      case 'MakingEdge':
        this.cancelEdgeToHover(this.state)
        break

      case 'SnappedEdge':
        this.makeEdge(this.state)
        break
    }
  }

  mousemoveVertex(event: MouseEvent) {
    switch (this.state.name) {
      case 'Dragging':
        this.continueDragging(this.state, event)
        break
    }
  }

  dblclickVertex(event: MouseEvent) {
    switch (this.state.name) {
      case 'Hover':
        this.startMakingEdge(this.state)
    }
  }

  auxclickVertex(event: MouseEvent) {
    event.preventDefault()

    switch (this.state.name) {
      case 'Hover':
        this.deleteHoveredVertex(this.state)
    }
  }

  contextMenuVertex(event: MouseEvent) {
    event.preventDefault()
  }

  mousemoveSVG(event: MouseEvent) {
    switch (this.state.name) {
      case 'Dragging':
        this.continueDragging(this.state, event)
        break

      case 'MakingEdge':
        this.continueMakingEdge(this.state, event)
        break
    }
  }

  mouseupSVG(event: MouseEvent) {
    switch (this.state.name) {
      case 'Neutral':
        this.makeVertexAtCursor(event)
        break

      case 'MakingEdge':
        this.stopMakingEdge(this.state)
        break
    }
  }

  startHovering(vertexIndex: number) {
    console.log("starthovering")
  
    this.state = {
      name: 'Hover',
      vertexIndex: vertexIndex
    }
  }
  
  unhover() {
    console.log('unhover')
  
    this.state = {
      name: 'Neutral'
    }
  }

  makeVertexAtCursor(event: MouseEvent) {
    const {cursorX, cursorY} = cursorPosition(event)

    this.vertices.push({
      x: cursorX,
      y: cursorY,
      color: 'white'
    })
  }

  startDragging(state: Hover, event: MouseEvent) {
    console.log('startdragging')

    const {cursorX, cursorY} = cursorPosition(event)
    this.state = {
      name: 'Dragging',
      vertexIndex: state.vertexIndex,
      cursorX: cursorX,
      cursorY: cursorY
    }
  }

  continueDragging(state: Dragging, event: MouseEvent) {
    console.log('continuedragging')

    const {cursorX, cursorY} = cursorPosition(event)
    const vertex = this.vertices[state.vertexIndex]
    vertex.x = cursorX
    vertex.y = cursorY

    this.state = {
      name: 'Dragging',
      vertexIndex: state.vertexIndex,
      cursorX: cursorX,
      cursorY: cursorY
    }
  }

  stopDragging(state: Dragging) {
    console.log('stopdragging')

    this.state = {
      name: 'Hover',
      vertexIndex: state.vertexIndex
    }
  }

  /* MakingEdge */

  startMakingEdge(state: Hover) {
    console.log('startmakingedge')

    const vertex: Vertex = this.vertices[state.vertexIndex]
    
    this.state = {
      name: 'MakingEdge',
      vertexIndex: state.vertexIndex,
      cursorX: vertex.x,
      cursorY: vertex.y
    }
  }
  

  continueMakingEdge(state: MakingEdge, event: MouseEvent) {
    console.log('continuemakingedge')

    const {cursorX, cursorY} = cursorPosition(event)

    this.state = {
      name: 'MakingEdge',
      vertexIndex: state.vertexIndex,
      cursorX: cursorX,
      cursorY: cursorY
    }
  }

  cancelEdgeToHover(state: MakingEdge) {
    console.log('canceledgetohover')

    this.state = {
      name: 'Hover',
      vertexIndex: state.vertexIndex
    }
  }

  stopMakingEdge(state: MakingEdge) {
    console.log('stop making edge')

    this.state = {
      name: 'Neutral'
    }
  }

  maybeSnapEdgeToVertex(state: MakingEdge, vertexIndex: number) {
    const sourceIndex = state.vertexIndex
    const destinationIndex = vertexIndex

    if (sourceIndex !== destinationIndex && !this.edges.some(([a, b]) =>
      (a === sourceIndex && b === destinationIndex) ||
      (a === destinationIndex && b === sourceIndex)
    )) {
      this.state = {
        name: 'SnappedEdge',
        sourceVertexIndex: state.vertexIndex,
        destinationVertexIndex: vertexIndex
      }
    }
  }

  unsnap(state: SnappedEdge, event: MouseEvent) {
    console.log('unsnap')

    const {cursorX, cursorY} = cursorPosition(event)

    this.state = {
      name: 'MakingEdge',
      vertexIndex: state.sourceVertexIndex,
      cursorX: cursorX,
      cursorY: cursorY
    }
  }

  makeEdge(state: SnappedEdge) {
    console.log('make edge')

    this.edges.push([state.sourceVertexIndex, state.destinationVertexIndex])

    this.updateColors()

    this.state = {
      name: 'Hover',
      vertexIndex: state.destinationVertexIndex
    }
  }

  updateColors() {
    const colorings: Color[][] = allValidThreeColorings(this.vertices.map((_, i) => i), this.edges)

    const result: Isochromacy[] = isochromacies(this.vertices.length, colorings)

    this.vertices = this.vertices.map((vertex, index) => ({
      x: vertex.x,
      y: vertex.y,
      color: colorForIsochromacy(result[index])
    }))
  }

  deleteHoveredVertex(state: Hover) {
    console.log('delete vertex')

    const indexToRemove = state.vertexIndex

    this.edges = this.edges
      .filter(([a, b]) => a !== state.vertexIndex && b !== state.vertexIndex)
      .map(([a, b]) => [(a > indexToRemove) ? a - 1 : a, (b > indexToRemove) ? b - 1 : b])

    this.vertices.splice(indexToRemove, 1)

    this.state = {
      name: 'Neutral'
    }
  }
}

type Vertex = {
  x: number
  y: number
  color: string
}


function cursorPosition(event: MouseEvent): {cursorX: number, cursorY: number} {
  const svg = event.target as SVGGraphicsElement
  const CTM = svg.getScreenCTM()

  const cursorX = (event.clientX - CTM.e) / CTM.a
  const cursorY = (event.clientY - CTM.f) / CTM.d

  return {cursorX, cursorY}
}

type State = Neutral | Hover | Dragging | MakingEdge | SnappedEdge


type Neutral = {
  name: 'Neutral'
}

type Hover = {
  name: 'Hover'
  vertexIndex: number
}

type Dragging = {
  name: 'Dragging'
  vertexIndex: number
  cursorX: number
  cursorY: number
}


type MakingEdge = {
  name: 'MakingEdge'
  vertexIndex: number
  cursorX: number
  cursorY: number
}

type SnappedEdge = {
  name: 'SnappedEdge'
  sourceVertexIndex: number
  destinationVertexIndex: number
}

function colorForIsochromacy(isochromacy: Isochromacy): string {
  switch (isochromacy.name) {
    case 'Graph Not 3-Colorable':
      return 'red'

    case 'Independent Vertex':
      return 'white'

    case 'In Color Group':
      return ['blue', 'green', 'yellow', 'purple'][isochromacy.group]
  }
}
