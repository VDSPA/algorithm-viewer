import GraphContainer from "@/components/GraphContainer";
import ProgressBar from "@/components/ProgressBar";
import useSSPResult from "@/hooks/useSSPResult";
import { useMemo, useRef } from "react";
import type { GraphContainerRef } from "@/components/GraphContainer";
import SettingPanel from "@/components/SettingPanel";

const algorithms = [
  { name: "bfs" },
  { name: "dfs" },
  { name: "dijkstra" },
  { name: "floyd" },
];

const ViewerPage = () => {
  const step = useRef<number>(-1);

  const graphManager = useRef<{
    name: string,
    ref: GraphContainerRef | null
  }[]>(
    algorithms.map(item => ({
      name: item.name,
      ref: null
    }))
  );

  const { resultArray } = useSSPResult();

  const maxLength = useMemo(() => {
    let max = -1;
    resultArray.forEach(item => {
      if (item.steps.length > max) {
        max = item.steps.length;
      }
    });
    return max;
  }, [resultArray]);

  const handleSlide = (value: number) => {
    graphManager.current.forEach(item => item.ref?.jump(value));
    step.current = value;
  };

  return (
    <section className="px-8 h[100%] flex gap-4">
      <section className="flex-auto flex flex-col">
        <div className="flex-auto grid grid-cols-2 grid-rows-2 grid-gap-4">
          {graphManager.current.map(item => (
            <GraphContainer ref={ref => item.ref = ref} name={item.name} key={item.name}/>
          ))}
        </div>
        <div className="py-12 px-8">
          <ProgressBar max={maxLength} onChange={handleSlide} defaultStep={step.current}/>
        </div>
      </section>
      <section className="flex-none w-72">
        <SettingPanel />
      </section>
    </section>
  );
};

export default ViewerPage;
