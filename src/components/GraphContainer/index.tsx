import useRandomGraph from "@/hooks/useRandomGraph";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import G6 from "@antv/g6";
import type { Graph } from "@antv/g6";
import useSetting from "@/hooks/useSetting";
import useSSPResult from "@/hooks/useSSPResult";
import elementStyle from "./elementStyle";
import { debounce } from "lodash-es";
import { Button, Tooltip } from "@fluentui/react-components";

interface IProps {
  name: string;
}

interface ElementState {
  [key: string]: Array<{
    state: "settle" | "traverse" | "default";
    step: number;
  }>
}

export interface GraphContainerRef {
  next: () => void;
  previous: () => void;
  jump: (id: number) => void;
}

const GraphContainer = forwardRef<GraphContainerRef, IProps>((props, ref) => {
  const { graph, checkEdgeExist } = useRandomGraph();
  const step = useRef<number>(-1);
  const [stepCount, setStepCount] = useState(-1);
  const graphSize = useRef({ width: 0, height: 0 });

  const [ setting ] = useSetting();

  const { result: operateSequence } = useSSPResult(props.name);
  const elementSettleState = useRef<ElementState>({});

  useImperativeHandle(ref, () => {
    return {
      next: handleNext,
      previous: handlePrevious,
      jump: handleJump
    };
  }, []);

  const g6 = useRef<Graph>();
  const g6Dom = useRef<HTMLDivElement>(null);
  const wrapperDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    handleReset();
  }, [graph]);

  useEffect(() => {
    const handleResize = debounce(() => {
      graphSize.current.height = wrapperDom.current?.clientHeight || 0;
      graphSize.current.width = wrapperDom.current?.clientWidth || 0;
      g6.current?.changeSize(graphSize.current.width, graphSize.current.height);
      g6.current?.render();
    }, 200);
    addEventListener("resize", handleResize);
    return () => {
      removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    g6.current && g6.current.destroy();
    if (graph && g6Dom.current) {
      const g6Graph = {
        nodes: graph.nodes.map(item => ({
          ...item,
          size: 10,
          labelCfg: {
            style: { fontSize: 6, fontFamily: "monospace" }
          }
        })),
        edges: graph.edges.map(item => ({
          ...item,
          label: item.value.toString(),
          style: {
            endArrow: setting.isDirected ? {
              path: G6.Arrow.vee(2, 3, 4),
            }: false
          },
          type: checkEdgeExist([...item.id.split(":")].reverse().join(":"))? "quadratic": "line",
          labelCfg: {
            style: { fontSize: 6, fontFamily: "monospace" }
          }
        }))
      };

      g6.current = new G6.Graph({
        container: g6Dom.current,
        fitView: true,
        layout: { type: "mds", },
        modes: { default: ["drag-node"] },
        defaultNode: {
          size: 20,
          style: elementStyle.node.default
        },
        defaultEdge: {
          curveOffset: 80,
          style: { ...elementStyle.edge.default, opacity: .4 }
        }
      });

      g6.current.data(g6Graph);
      g6.current.render();
    }

  }, [graph]);

  const handleHighlight = (id: string, style: any) => {
    /** element existing in graph */
    const element = g6.current?.findById(id);
    element && g6.current?.updateItem(id, { style: style });
  };

  const handlePrevious = () => {
    if (step.current - 1 < -1
      || !operateSequence
      || step.current > operateSequence.length - 1
    ) return;

    if (step.current - 1 === -1) {
      handleReset();
      step.current--;
      setStepCount(step.current);
      return;
    }

    // reset current
    const currentStep = operateSequence[step.current];
    if (currentStep.type === "reset") {
      handleReset();
    } else if (currentStep.type === "finish") {
      Object.keys(elementSettleState.current).forEach(id => {
        if (elementSettleState.current[id].slice(-1)[0].step === step.current) {
          elementSettleState.current[id].pop();
        }
      });
    } else {
      currentStep.targets.forEach(target => {
        elementSettleState.current[target.id].pop();
        const isRenderInPrevious = operateSequence[step.current - 1].targets.find(item => item.id === target.id) ? true : false;
        if (!isRenderInPrevious && elementSettleState.current[target.id].slice(-1)[0].state !== "settle") {
          handleHighlight(target.id, elementStyle[target.role]["default"]);
        } else if (!isRenderInPrevious) {
          handleHighlight(target.id, elementStyle[target.role]["settle"]);
        }
      });
    }

    // render previous
    const previousStep = operateSequence[step.current - 1];
    if (previousStep.type === "reset") {
      handleReset();
    } else if (previousStep.type !== "finish") {
      const type = previousStep.type;
      previousStep.targets.forEach(target => {
        if (elementSettleState.current[target.id] === undefined)
          elementSettleState.current[target.id] = [];
        if (elementSettleState.current[target.id].slice(-1)[0].state !== "settle") {
          elementSettleState.current[target.id].push({ state: type, step: step.current + 1});
        }
        handleHighlight(target.id, elementStyle[target.role][type]);
      });
    }
    step.current--;
    setStepCount(step.current);
  };

  const handleNext = () => {
    if (!operateSequence) return;

    if (step.current + 1 >= operateSequence.length) return;

    // reset current
    // depends on element self state
    if (step.current !== -1) {
      const currentStep = operateSequence[step.current];
      if (currentStep.type === "reset") {
        handleReset();
      } else {
        currentStep.targets.forEach(target => {
          const isRenderInNext = operateSequence[step.current + 1].targets.find(item => item.id === target.id) ? true : false;
          if (!isRenderInNext && elementSettleState.current[target.id].slice(-1)[0].state !== "settle") {
            handleHighlight(target.id, elementStyle[target.role]["default"]);
          }
        });
      }
    }

    // render next
    const nextStep = operateSequence[step.current + 1];
    if (nextStep.type === "reset") {
      handleReset();
    } else if (nextStep.type === "finish") {
      Object.keys(elementSettleState.current).forEach(id => {
        const target = elementSettleState.current[id];
        if (target.slice(-1)[0].state === "traverse" && target.slice(-1)[0].step === step.current) {
          // view finish as settle for a element
          elementSettleState.current[id].push({ state: "settle", step: step.current + 1});
          handleHighlight(id, elementStyle[id.indexOf(":") != -1 ? "edge" : "node"]["settle"]);
        }
      });
    } else {
      const type = nextStep.type;
      nextStep.targets.forEach(target => {
        if (elementSettleState.current[target.id] === undefined)
          elementSettleState.current[target.id] = [];
        elementSettleState.current[target.id].push({ state: type, step: step.current + 1});
        handleHighlight(target.id, elementStyle[target.role][type]);
      });
    }
    step.current++;
    setStepCount(step.current);
  };

  const handleReset = () => {
    elementSettleState.current = {};

    graph?.nodes.forEach(node => {
      handleHighlight(node.id, elementStyle.node["default"]);
      elementSettleState.current[node.id] = [{ state: "default", step: -1 }];
    });
    graph?.edges.forEach(edge => {
      handleHighlight(edge.id, elementStyle.edge["default"]);
      elementSettleState.current[edge.id] = [{ state: "default", step: -1 }];
    });
  };

  const handleJump = (value: number) => {
    if (!operateSequence) return;
    const originStep = step.current;
    if (value > originStep) {
      for (let i = Math.min(value, operateSequence.length); i > originStep; i--) {
        handleNext();
      }
    } else if (value < originStep) {
      for (let i = value; i < Math.min(originStep, operateSequence.length); i++) {
        handlePrevious();
      }
    }
  };

  const handleCopyResult = () => {
    const text = JSON.stringify(operateSequence);
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="b-gray-200 flex flex-col b-rd-1 shadow-default">
      <div className="h-[220px] flex of-hidden aspect-[5/3]" ref={wrapperDom}>
        <div className="flex-auto" ref={g6Dom} />
      </div>
      <div className="px-3 py-2 b-none b-t-1 b-gray200 b-t-solid text-[.9em] flex gap-1 flex-items-center">
        <span className="font-semibold text-[.9rem]">{props.name.toUpperCase()}</span>
        <span className="flex-auto" />
        <div className="flex gap-2">
          { !operateSequence
            ? <span className="bg-red50 c-red500 px-[6px] py-[1px] text-3 b-rd-1 font-medium ">UNREDAY</span>
            : <span className={`
                ${stepCount + 1 < operateSequence.length
                ? "bg-yellow50 c-yellow500"
                : "bg-green50 c-green500"
                } px-[6px] py-[1px] text-3 b-rd-1 font-medium`}
              > {stepCount + 1} / {operateSequence?.length}</span>
          }
          { operateSequence
            && <Tooltip
                content={`Copy ${props.name} running steps`}
                relationship="description"
                >
                  <Button
                    size="small"
                    appearance="transparent"
                    icon={<div className="i-fluent-mdl2-copy text-[.8rem]" />}
                    onClick={handleCopyResult}
                  />
              </Tooltip>
          }
        </div>
      </div>
    </div>
  );
});

GraphContainer.displayName = "GraphContainer";

export default GraphContainer;
