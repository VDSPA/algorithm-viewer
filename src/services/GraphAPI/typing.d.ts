declare namespace GraphAPI {

  type Matrix = Array<Array<number>>

  type Node = {
    id: string;
    x: number;
    y: number;
  }


  type Edge = {
    target: Node["id"];
    source: Node["id"];
    value: number;
  }

  type Meta = {
    nodes: Node[];
    edges: Edge[];
  }

  interface Setting {
    isDirected: boolean
  }

}
