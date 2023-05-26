import ShortPathService from "@/services/ShortPathAPI";
import { CalcShortPathResult } from "@/services/ShortPathAPI/calcShortPath";
import { useMemo, useState } from "react";
import useSWR from "swr";

export default function useSSPResult(key?: string) {
  const [loading, setLoading] = useState(false);

  const { data, mutate } = useSWR<CalcShortPathResult["data"]>("/api/graph/result");

  const resultArray = useMemo(() => {
    if (data) {
      return Object.entries(data).map(([name, steps]) => ({ name, steps }));
    } else {
      return [];
    }
  }, [data]);

  const fetchNewResult = async (setting: GraphAPI.Setting, matrix: GraphAPI.Matrix) => {
    setLoading(true);
    const res = await ShortPathService.calcShortPath({
      settings: {
        ...setting,
        matrix
      }
    });
    mutate(res.data);
    setLoading(false);
  };

  return {
    result: key? data?.[key]: undefined,
    resultArray,
    loading,
    trigger: fetchNewResult
  };

}
