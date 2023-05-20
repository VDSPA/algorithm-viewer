declare namespace ShortPathAPI {
  interface Target {
    role: "node" | "edge",
    id: string;
  }

  interface Step {
    type: "traverse" | "settle" | "reset";
    targets: Array<Target>;
  }
}
