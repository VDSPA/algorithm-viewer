import ShortPathService from "@/services/ShortPathAPI";
import { useMemo } from "react";
import useSWR from "swr";
import useRandomGraph from "./useRandomGraph";
import useSetting from "./useSetting";

export default function useSSPResult(key?: string) {
  const [ setting ] = useSetting();
  const { matrix } = useRandomGraph();

  const { data, isLoading } = useSWR(
    ["/api/graph/result", setting, matrix],
    async ([, setting, matrix]) => {
      if (setting && matrix) {
        const res = await ShortPathService.calcShortPath({
          settings: {
            ...setting,
            matrix
          }
        });
        return res.data;
      } else return undefined;
    }
  );

  const resultArray = useMemo(() => {
    if (data) {
      return Object.entries(data).map(([name, steps]) => ({ name, steps }));
    } else {
      return [];
    }
  }, [data]);

  return {
    result: key? data?.[key]: undefined,
    resultArray,
    isLoading,
  };

}
