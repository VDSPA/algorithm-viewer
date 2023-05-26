import { Field, Select, Button, SelectOnChangeData } from "@fluentui/react-components";
import useRandomGraph from "@/hooks/useRandomGraph";
import useSSPResult from "@/hooks/useSSPResult";
import { useContext } from "react";
import SettingFormContext from "./SettingFormContext";

const AlgorithmSetting = () => {
  const { matrix } = useRandomGraph();
  const { formData } = useContext(SettingFormContext);

  const { trigger } = useSSPResult();

  const handleSelectStartPot = (_: any, value: SelectOnChangeData) => {
    formData && (formData.current.start = parseInt(value.value));
  };

  const handleRun = () => {
    // console.log(formData?.current);
    if (formData && matrix) {
      trigger(formData?.current, matrix);
    }
  };

  return (
    <>
      <Field label="Select a start pot">
        <Select disabled={ matrix === undefined} onChange={handleSelectStartPot}>
          { matrix?.map((_, index)  =>
            <option key={index} value={index}>{index}</option>
          )}
        </Select>
      </Field>

      <Button appearance="primary" onClick={handleRun}>Run algorithms</Button>
    </>
  );
};

export default AlgorithmSetting;
