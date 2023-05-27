import { Card, Divider } from "@fluentui/react-components";
import { useRef } from "react";
import AlgorithmSetting from "./AlgotithmSetting";
import GraphSetting from "./GraphSetting";
import SettingFormContext from "./SettingFormContext";

const SettingPanel = () => {
  const formData = useRef<GraphAPI.Setting>({
    size: "small",
    isDirected: false,
    start: 0
  });

  return (
    <SettingFormContext.Provider value={{ formData }}>
      <Card>
        <h1 className="m-2">Settings</h1>

        <Divider appearance="brand"> Graph Setting </Divider>
        <GraphSetting />

        <Divider appearance="brand"> Algorithm Setting </Divider>
        <AlgorithmSetting />

      </Card>
    </SettingFormContext.Provider>
  );
};

export default SettingPanel;
