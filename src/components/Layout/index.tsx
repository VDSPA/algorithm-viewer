import { ReactNode } from "react";

interface IProps {
  children: ReactNode;
}

const Layout = (props: IProps) => {
  return (
    <main className="h-screen font-sans flex flex-col box-border">
      <header className="h-16 flex flex-row flex-items-center px-8 flex-gap-1 flex-none">
        <a href="./" className="decoration-none color-black">
          <h1 className="text-4 m-0">
            <span className="font-200 op50 block">SummersDay</span>
            <span className="font-400 block">Algorithm Viewer</span>
          </h1>
        </a>
        <div className="flex-auto" />
        <div className="flex flex-row" >
          <span className="i-fluent-mdl2-settings" />
          <div className="i-mdi-alarm text-orange-400" />
        </div>
      </header>
      <div className="flex-items-center of-x-auto min-w-[1000px] flex-none pt-1 box-border" style={{height: "calc(100vh - 64px)"}}>
        { props.children }
      </div>
    </main>
  );
};

export default Layout;
