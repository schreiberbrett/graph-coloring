import { Component } from '@angular/core';
import { isochromacyReport, IsochromacyReport, findDiamonds, Diamond, findQE7s, QE7, findQE8s, QE8, findOCs, OC} from '../../models'

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent {

  vertices: Vertex[] = []
  edges: [number, number][] = []
  isochromacyReport: IsochromacyReport = isochromacyReport(this.vertices.length, this.edges)
  diamonds: Diamond[] = []
  qe7s: QE7[] = []
  qe8s: QE8[] = []
  ocs: OC[] = []

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

  contextmenuVertex(event: MouseEvent) {
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

  auxclickSVG(event: MouseEvent) {
    event.preventDefault()
  }

  contextmenuSVG(event: MouseEvent) {
    event.preventDefault()
  }

  startHovering(vertexIndex: number) {  
    this.state = {
      name: 'Hover',
      vertexIndex: vertexIndex
    }
  }
  
  unhover() {  
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

    this.recomputeIsochromacyReport()
  }

  startDragging(state: Hover, event: MouseEvent) {
    const {cursorX, cursorY} = cursorPosition(event)
    this.state = {
      name: 'Dragging',
      vertexIndex: state.vertexIndex,
      cursorX: cursorX,
      cursorY: cursorY
    }
  }

  continueDragging(state: Dragging, event: MouseEvent) {
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
    this.state = {
      name: 'Hover',
      vertexIndex: state.vertexIndex
    }
  }

  /* MakingEdge */

  startMakingEdge(state: Hover) {
    const vertex: Vertex = this.vertices[state.vertexIndex]
    
    this.state = {
      name: 'MakingEdge',
      vertexIndex: state.vertexIndex,
      cursorX: vertex.x,
      cursorY: vertex.y
    }
  }
  

  continueMakingEdge(state: MakingEdge, event: MouseEvent) {
    const {cursorX, cursorY} = cursorPosition(event)

    this.state = {
      name: 'MakingEdge',
      vertexIndex: state.vertexIndex,
      cursorX: cursorX,
      cursorY: cursorY
    }
  }

  cancelEdgeToHover(state: MakingEdge) {
    this.state = {
      name: 'Hover',
      vertexIndex: state.vertexIndex
    }
  }

  stopMakingEdge(state: MakingEdge) {
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
    const {cursorX, cursorY} = cursorPosition(event)

    this.state = {
      name: 'MakingEdge',
      vertexIndex: state.sourceVertexIndex,
      cursorX: cursorX,
      cursorY: cursorY
    }
  }

  makeEdge(state: SnappedEdge) {
    this.edges.push([state.sourceVertexIndex, state.destinationVertexIndex])

    this.recomputeIsochromacyReport()

    this.state = {
      name: 'Hover',
      vertexIndex: state.destinationVertexIndex
    }
  }

  recomputeIsochromacyReport() {
    this.diamonds = findDiamonds(this.vertices.length, this.edges)
    this.qe7s = findQE7s(this.vertices.length, this.edges)
    this.qe8s = findQE8s(this.vertices.length, this.edges)
    this.ocs = findOCs(this.vertices.length, this.edges)
    this.isochromacyReport = isochromacyReport(this.vertices.length, this.edges)

    this.vertices = this.vertices.map((vertex, index) => {
      if (!this.isochromacyReport.isThreeColorable) {
        return {
          x: vertex.x,
          y: vertex.y,
          color: 'red'
        }
      }

      const colors = ['blue', 'yellow', 'pink', 'orange', 'purple']

      const result = this.isochromacyReport.isochromaticVertices.findIndex(group => group.includes(index))

      return {
        x: vertex.x,
        y: vertex.y,
        color: result === -1 ? 'white' : colors[result]
      }
    })
  }

  deleteHoveredVertex(state: Hover) {
    const indexToRemove = state.vertexIndex

    this.edges = this.edges
      .filter(([a, b]) => a !== state.vertexIndex && b !== state.vertexIndex)
      .map(([a, b]) => [(a > indexToRemove) ? a - 1 : a, (b > indexToRemove) ? b - 1 : b])

    this.vertices.splice(indexToRemove, 1)

    this.recomputeIsochromacyReport()

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
