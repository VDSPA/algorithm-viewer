import GraphContainer from "@/components/GraphContainer";

const ViewerPage = () => {
  const algorithms = [
    { name: "bfs" },
    { name: "dfs" },
    { name: "dijkstra" },
    { name: "floyd" },
  ];

  return (
    <section className="px-8 h[100%] flex flex-col">
      <div className="flex-auto grid grid-cols-2 grid-rows-2 grid-gap-4">
        {algorithms.map(item => (
          <GraphContainer name={item.name} key={item.name}/>
        ))}
      </div>
      <div className="py-12 px-8">
      </div>
    </section>
  );
};

export default ViewerPage;
