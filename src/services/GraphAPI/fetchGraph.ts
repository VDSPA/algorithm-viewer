import fetcher from "../fetcher";

type FetchGraphData = Omit<GraphAPI.Setting, "matrix">;

type FetchGraphResult = CommonAPI.IResponse<{
  graph: GraphAPI.Matrix
}>

const fetchGraph = async (data: FetchGraphData) => {
  return fetcher<FetchGraphResult, FetchGraphData>("/api/graph", {
    method: "POST",
    data
  });
};

export default fetchGraph;
