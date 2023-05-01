import useSWR from "swr";
import GraphService from "@/services/GraphAPI";
import convertMatrix2GraphMeta from "@/utils/convertMatrix2GraphMeta";

export default function (settings: GraphAPI.Setting) {
  const { isLoading, data } = useSWR(
    ["/api/graph", settings],
    ([, settings]) => GraphService.fetchGraph(settings)
  );

  return {
    graph: data ? convertMatrix2GraphMeta(data.data.graph) : null,
    isLoading
  };
}

