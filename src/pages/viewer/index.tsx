import GraphContainer from "@/components/GraphContainer";
import ProgressBar from "@/components/ProgressBar";
import useSSPResult from "@/hooks/useSSPResult";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GraphContainerRef } from "@/components/GraphContainer";
import SettingPanel from "@/components/SettingPanel";
import { Button, Divider } from "@fluentui/react-components";
import KeyboardLabel from "@/components/KeyboardLabel";

const algorithms = [
  { name: "bfs" },
  { name: "dfs" },
  { name: "dijkstra" },
  { name: "floyd" },
];

const ViewerPage = () => {
  const [step, setStep] = useState(-1);
  const [isPlay, setIsPlay] = useState(false);
  const timer = useRef<NodeJS.Timer>();
  const stepRef = useRef(-1);

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
    stepRef.current = value - 1;
    graphManager.current.forEach(item => item.ref?.jump(stepRef.current));
    setStep(stepRef.current);
  };

  const handleClickBack = () => {
    graphManager.current.forEach((item, index) => {
      if (stepRef.current < resultArray[index].steps.length)
        item.ref?.previous();
    });
    if (stepRef.current - 1 > -2) {
      stepRef.current--;
      setStep(stepRef.current);
      return true;
    } else false;
  };

  const handleClickForward = useCallback(() => {
    graphManager.current.forEach(item => item.ref?.next());
    if (stepRef.current + 1 < maxLength) {
      stepRef.current++;
      setStep(stepRef.current);
      return true;
    } else false;
  }, [maxLength]);

  const handleClickPlay = useCallback(() => {
    if (isPlay) {
      // stop
      setIsPlay(false);
      clearInterval(timer.current);
    } else {
      // start
      setIsPlay(true);
      timer.current = setInterval(() => {
        const res = handleClickForward();
        if (!res) {
          setIsPlay(false);
          clearInterval(timer.current);
        }
      }, 800);
    }
  }, [isPlay, handleClickForward]);

  const handleKeyboardEvent = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space") {
      handleClickPlay();
    } else if (e.code === "ArrowRight") {
      handleClickForward();
    } else if (e.code === "ArrowLeft") {
      handleClickBack();
    }

  }, [handleClickPlay, handleClickForward, handleClickBack]);

  useEffect(() => {
    if (maxLength > 0) {
      addEventListener("keydown", handleKeyboardEvent);
    } else {
      removeEventListener("keydown", handleKeyboardEvent);
    }
    return () => {
      removeEventListener("keydown", handleKeyboardEvent);
    };
  }, [maxLength, handleKeyboardEvent]);

  return (
    <section className="px-8 h[100%] flex gap-4 flex-justify-center">
      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-2 grid-rows-2 grid-gap-4">
          {graphManager.current.map(item => (
            <GraphContainer ref={ref => item.ref = ref} name={item.name} key={item.name}/>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-auto flex-col gap-4 py-4 px-6 b-rd-2 shadow-default">
            { maxLength > 0 ?
              <>
                <ProgressBar
                  max={maxLength}
                  onChange={handleSlide} step={step + 1}
                  marks={resultArray.map(item =>
                    ({ label: `${item.name} end`, value: item.steps.length }))
                  }
                />
                <Divider />
                <div className="flex gap-2 flex-items-center">
                  <div className="c-primary font-bold b-rd-1 p-l-2">
                    <span> { step + 1 } </span> / <span> { maxLength } </span>
                  </div>
                  <div className="flex-auto" />
                  <div className="flex gap-2">
                    <Button appearance="primary" size="small" onClick={handleClickPlay}>
                      { !isPlay ? "Play" : "Pause" }
                    </Button>
                    <Button appearance="subtle" size="small" onClick={handleClickBack}>Step back</Button>
                    <Button size="small" onClick={handleClickForward}>Step forward</Button>
                  </div>
                </div>
              </>
              : <span className="c-primary font-bold b-rd-1">Please create a graph and click RUN ALGORITHMS button.</span>
            }
          </div>
          { maxLength > 0 &&
            <div className="flex flex-auto gap-2 flex-justify-end py-1">
              <KeyboardLabel label="Play / Pause" keys={["Space"]} />
              <KeyboardLabel label="Forward" keys={["Right"]} />
              <KeyboardLabel label="Back" keys={["Left"]} />
            </div>
          }
        </div>
      </section>
      <section className="flex-none w-72">
        <SettingPanel />
      </section>
    </section>
  );
};

export default ViewerPage;
