import useRandomGraph from "@/hooks/useRandomGraph";

interface IProps {
  name: string;
}

const GraphContainer = (props: IProps) => {

  const { graph } = useRandomGraph({ isDirected: true });

  return (
    <div className="b-gray-200 b-solid b-rd-1 flex flex-col">
      <div className="flex-auto">
        { /** canvas */}
      </div>
      <div className="px-3 py-2 b-none b-t-1 b-gray200 b-t-solid text-[.9em]">
        <span>{props.name}</span>
      </div>
    </div>
  );
};

export default GraphContainer;

