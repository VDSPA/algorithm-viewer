import useSWR from "swr";
import GraphService from "@/services/GraphAPI";
import convertMatrix2GraphMeta from "@/utils/convertMatrix2GraphMeta";
import useSetting from "./useSetting";

export default function () {
  const [ setting ] = useSetting();

  const { isLoading, data, mutate } = useSWR(
    ["/api/graph", setting],
    async ([, setting]) => {
      if (setting) {
        const res = await GraphService.fetchGraph(setting);
        return res.data.graph;
      } else return [];
    }
  );

  const checkEdgeExist = (id: string) => {
    const [start, end] = id.split(":").map(item => parseInt(item));
    if (data?.[start][end]) {
      return true;
    } else {
      return false;
    }
  };

  const refresh = () => {
    mutate();
  };

  return {
    graph: data ? convertMatrix2GraphMeta(data) : null,
    matrix: data,
    isLoading,
    refresh,
    checkEdgeExist
  };
}
