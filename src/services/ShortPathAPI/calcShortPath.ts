import fetcher from "../fetcher";

type CalcShortPathData = {
  settings: GraphAPI.Setting & { matrix: GraphAPI.Matrix };
}

type CalcShortPathResult = CommonAPI.IResponse<{
  [key: string]: Array<ShortPathAPI.Step>
}>

const calcShortPath = async (data: CalcShortPathData) => {
  return fetcher<CalcShortPathResult, CalcShortPathData>("/api/graph/result", {
    method: "POST",
    data
  });
};

export default calcShortPath;
