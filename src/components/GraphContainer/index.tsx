import useRandomGraph from "@/hooks/useRandomGraph";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import G6 from "@antv/g6";
import type { Graph } from "@antv/g6";
import useSetting from "@/hooks/useSetting";
import useSSPResult from "@/hooks/useSSPResult";
import elementStyle from "./elementStyle";

interface IProps {
  name: string;
}

export interface GraphContainerRef {
  next: () => void;
  previous: () => void;
  jump: (id: number) => void;
}

const GraphContainer = forwardRef<GraphContainerRef, IProps>((props, ref) => {
  const { graph, checkEdgeExist } = useRandomGraph();
  const step = useRef<number>(-1);

  const [ setting ] = useSetting({
    isDirected: true,
  });

  const { result: operateSequence } = useSSPResult(props.name);

  useImperativeHandle(ref, () => {
    return {
      next: handleNext,
      previous: handlePrevious,
      jump: handleJump
    };
  }, []);

  const g6 = useRef<Graph>();
  const g6Dom = useRef<HTMLDivElement>(null);

  useEffect(() => {

    if (!g6.current && graph && g6Dom.current) {
      const g6Graph = {
        nodes: graph.nodes.map(item => ({
          ...item,
          size: 10,
          labelCfg: {
            style: {
              fontSize: 6,
              fontFamily: "monospace"
            }
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
            style: {
              fontSize: 6,
              fontFamily: "monospace"
            }
          }
        }))
      };

      g6.current = new G6.Graph({
        container: g6Dom.current,
        fitView: true,
        layout: {
          type: "mds",
        },
        modes: {
          default: ["drag-node"]
        },
        defaultNode: {
          size: 20,
          style: elementStyle.node.default
        },
        defaultEdge: {
          curveOffset: 80,
          style: {
            ...elementStyle.edge.default,
            opacity: .4
          }
        }
      });

      g6.current.data(g6Graph);
      g6.current.render();
    }

  }, [graph]);

  const handleHighlight = (id: string, style: any) => {
    try {
      g6.current?.updateItem(id, {
        style: style
      });
    } catch (e: Error) {
      if (props.name === "floyd") {
        const type = id.indexOf(":") >=0 ? "edge" : "node";
        const model = {
          id,
          source: type === "edge" ? id.split(":")[0] : undefined,
          target: type === "edge" ? id.split(":")[1] : undefined,
        };

      }
      console.error(e);
    }
  };

  const handlePrevious = () => {
    if (step.current - 1 < 0
      || !operateSequence
      || step.current > operateSequence.length - 1
    ) return;

    // reset current
    const currentStep = operateSequence[step.current];
    if (currentStep.type === "reset") {
      handleReset();
    } else {
      currentStep.targets.forEach(target => {
        handleHighlight(target.id, elementStyle[target.role]["default"]);
      });
    }

    // render previous
    const previousStep = operateSequence[step.current - 1];
    if (previousStep.type === "reset") {
      handleReset();
    } else {
      const type = previousStep.type;
      previousStep.targets.forEach(target => {
        handleHighlight(target.id, elementStyle[target.role][type]);
      });
    }
    step.current--;
  };

  const handleNext = () => {
    if (!operateSequence) return;

    if (step.current + 1 >= operateSequence.length) return;

    // reset previous
    if (step.current != -1) {
      const previousStep = operateSequence[step.current];
      if (previousStep.type === "settle") {
        previousStep.targets.forEach(target => {
          handleHighlight(target.id, elementStyle[target.role]["settle"]);
        });
      } else if (previousStep.type === "reset") {
        handleReset();
      } else {
        previousStep.targets.forEach(target => {
          handleHighlight(target.id, elementStyle[target.role]["default"]);
        });
      }
    }

    // render current
    const currentStep = operateSequence[step.current + 1];
    if (currentStep.type === "reset") {
      handleReset();
    } else {
      const type = currentStep.type;
      currentStep.targets.forEach(target => {
        handleHighlight(target.id, elementStyle[target.role][type]);
      });
    }
    step.current++;
  };

  const handleReset = () => {
    graph?.nodes.forEach(node => {
      handleHighlight(node.id, elementStyle.node["default"]);
    });
    graph?.edges.forEach(edge => {
      handleHighlight(edge.id, elementStyle.edge["default"]);
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

  return (
    <div className="b-gray-200 b-solid b-rd-1 flex flex-col">
      <div className="flex-auto">
        <div className="h-[100%]" ref={g6Dom} />
      </div>
      <div className="px-3 py-2 b-none b-t-1 b-gray200 b-t-solid text-[.9em] flex gap-1">
        <span>{props.name.toUpperCase()}</span>
        <span className="flex-auto" />
        { !operateSequence
          ? <span className="b-solid bg-red50 c-red500 b-red500 px-[4px] py-[1px] text-3 b-rd-1">UNREDAY</span>
          : <span className="b-solid bg-green50 c-green500 b-green500 px-[4px] py-[1px] text-3 b-rd-1">REDAY</span>
        }
      </div>
      <div className="px-2 py-1 flex gap-1">
        <button onClick={handleNext}>next</button>
        <button onClick={handlePrevious}>previous</button>
      </div>
    </div>
  );
});

GraphContainer.displayName = "GraphContainer";

export default GraphContainer;
