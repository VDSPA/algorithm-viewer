import useRandomGraph from "@/hooks/useRandomGraph";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import G6 from "@antv/g6";
import type { Graph, ModelConfig, Item } from "@antv/g6";
import useSetting from "@/hooks/useSetting";
import useSSPResult from "@/hooks/useSSPResult";
import elementStyle from "./elementStyle";
import { debounce } from "lodash-es";
import { Button, Tooltip } from "@fluentui/react-components";

interface IProps {
  name: string;
}

export interface GraphContainerRef {
  next: () => void;
  previous: () => void;
  jump: (id: number) => void;
}

const GraphContainer = forwardRef<GraphContainerRef, IProps>((props, ref) => {
  const { graph, matrix, checkEdgeExist } = useRandomGraph();
  const step = useRef<number>(-1);
  const graphSize = useRef({ width: 0, height: 0 });

  const [ setting ] = useSetting();

  const { result: operateSequence } = useSSPResult(props.name);
  const tempElement = useRef<Item | boolean | undefined>(undefined);

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
    if (g6.current) {
      g6.current.destroy();
    }
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

  const handleHighlight = (id: string, style: any, allowAdd = true) => {
    /** element existing in graph */
    const element = g6.current?.findById(id);
    if (element) {
      g6.current?.updateItem(id, {
        style: style
      });
    } else if (allowAdd && matrix) {
      let model: ModelConfig | undefined = undefined;
      const type = id.indexOf(":") >= 0 ? "edge" : "node";
      if (type === "edge") {
        const source = id.split(":")[0];
        const target = id.split(":")[1];
        const value = matrix[parseInt(source)][parseInt(target)];
        model = {
          id,
          source: id.split(":")[0],
          target: id.split(":")[1],
          value: value === 0 ? "INF" : value,
          curveOffset: 80,
          style: {
            ...style,
            endArrow: setting.isDirected ? {
              path: G6.Arrow.vee(2, 3, 4),
            }: false,
          },
          type: "quadratic"
        };
        tempElement.current = g6.current?.addItem(type, model);
        console.log(tempElement.current);
      } else if (type === "node") {
        model = { id, label: id.toString() };
        tempElement.current = g6.current?.addItem(type, model);
      }
    }
  };

  const handlePrevious = () => {
    if (step.current - 1 < -1
      || !operateSequence
      || step.current > operateSequence.length - 1
    ) return;

    if (step.current - 1 === -1) {
      handleReset();
      return;
    }

    handleRemoveExtraItem();
    // reset current
    const currentStep = operateSequence[step.current];
    if (currentStep.type === "reset") {
      handleReset();
    } else {
      currentStep.targets.forEach(target => {
        handleHighlight(target.id, elementStyle[target.role]["default"], false);
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

    handleRemoveExtraItem();
    // reset previous
    if (step.current != -1) {
      const previousStep = operateSequence[step.current];
      if (previousStep.type === "settle") {
        previousStep.targets.forEach(target => {
          handleHighlight(target.id, elementStyle[target.role]["settle"], false);
        });
      } else if (previousStep.type === "reset") {
        handleReset();
      } else {
        previousStep.targets.forEach(target => {
          handleHighlight(target.id, elementStyle[target.role]["default"], false);
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
    handleRemoveExtraItem();

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

  const handleRemoveExtraItem = () => {
    if (tempElement.current) {
      g6.current?.removeItem((tempElement.current as Item).getID());
      tempElement.current = undefined;
    }
  };

  const handleCopyResult = () => {
    const text = JSON.stringify(operateSequence);
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="b-gray-200 flex flex-col b-rd-1 shadow-default">
      <div className="h-[250px] flex of-hidden aspect-[5/3]" ref={wrapperDom}>
        <div className="flex-auto" ref={g6Dom} />
      </div>
      <div className="px-3 py-2 b-none b-t-1 b-gray200 b-t-solid text-[.9em] flex gap-1 flex-items-center">
        <span className="font-semibold text-[.9rem]">{props.name.toUpperCase()}</span>
        <span className="flex-auto" />
        <div className="flex gap-2">
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
          { !operateSequence
            ? <span className="bg-red50 c-red500 px-[6px] py-[1px] text-3 b-rd-1 font-medium ">UNREDAY</span>
            : <span className="bg-green50 c-green500 px-[6px] py-[1px] text-3 b-rd-1 font-medium">REDAY</span>
          }
        </div>
      </div>
    </div>
  );
});

GraphContainer.displayName = "GraphContainer";

export default GraphContainer;
