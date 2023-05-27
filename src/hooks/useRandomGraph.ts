import useSWR from "swr";
import GraphService from "@/services/GraphAPI";
import convertMatrix2GraphMeta from "@/utils/convertMatrix2GraphMeta";
import { useMemo, useState } from "react";

export default function () {
  const [loading, setLoading] = useState(false);

  const { data, mutate } = useSWR<GraphAPI.Matrix>("/api/graph");

  const graph = useMemo(() => {
    return data ? convertMatrix2GraphMeta(data) : null;
  }, [data]);

  const checkEdgeExist = (id: string) => {
    const [start, end] = id.split(":").map(item => parseInt(item));
    if (data?.[start][end]) {
      return true;
    } else {
      return false;
    }
  };

  const fetchNewGraph = async (value: GraphAPI.Setting) => {
    setLoading(false);
    console.log("start");
    const res = await GraphService.fetchGraph(value);
    mutate(res.data.graph);
    setLoading(true);
  };

  return {
    graph,
    matrix: data,
    loading,
    trigger: fetchNewGraph,
    checkEdgeExist
  };
}
