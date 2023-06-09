import { Field, Select, Button, SelectOnChangeData } from "@fluentui/react-components";
import useRandomGraph from "@/hooks/useRandomGraph";
import useSSPResult from "@/hooks/useSSPResult";
import { useCallback, useContext, useEffect } from "react";
import SettingFormContext from "./SettingFormContext";

const AlgorithmSetting = () => {
  const { matrix } = useRandomGraph();
  const { formData } = useContext(SettingFormContext);

  const { trigger } = useSSPResult();

  const handleSelectStartPot = (_: any, value: SelectOnChangeData) => {
    formData && (formData.current.start = parseInt(value.value));
  };

  const handleViewMatrix = () => {
    const text = JSON.stringify(matrix);
    navigator.clipboard.writeText(text);
  };

  const handleRun = useCallback(() => {
    if (formData && matrix) {
      trigger(formData?.current, matrix);
    }
  }, [formData, matrix, trigger]);

  const handleKeyboardEvent = useCallback((e: KeyboardEvent) => {
    if (e.code === "KeyR" && e.ctrlKey) {
      handleRun();
    }
  }, [handleRun]);

  useEffect(() => {
    addEventListener("keydown", handleKeyboardEvent);

    return () => {
      removeEventListener("keydown", handleKeyboardEvent);
    };
  }, [handleKeyboardEvent]);

  return (
    <>
      <Field label="Select a start pot">
        <Select disabled={matrix === undefined} onChange={handleSelectStartPot}>
          { matrix?.map((_, index)  =>
            <option key={index} value={index}>{index}</option>
          )}
        </Select>
      </Field>

      <Button
        appearance="primary"
        disabled={matrix === undefined}
        onClick={handleRun}
      >Run algorithms</Button>

      <Button
        appearance="transparent"
        size="small"
        disabled={matrix === undefined}
        onClick={handleViewMatrix}
        icon={<div className="i-fluent-mdl2-copy text-3" />}
      >Copy Matrix Data</Button>
    </>
  );
};

export default AlgorithmSetting;
