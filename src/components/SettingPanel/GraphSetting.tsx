import { Field, Select, Checkbox, Button, SelectOnChangeData, CheckboxOnChangeData } from "@fluentui/react-components";
import useRandomGraph from "@/hooks/useRandomGraph";
import { useContext } from "react";
import useSetting from "@/hooks/useSetting";
import SettingFormContext from "./SettingFormContext";

const GraphSetting = () => {
  const { trigger } = useRandomGraph();
  const { formData } = useContext(SettingFormContext);

  const [,setSetting] = useSetting();

  const handleGraphSizeChange = (_: any, value: SelectOnChangeData) => {
    formData && (formData.current.size = value.value);
  };

  const handleDirectedChange = (_: any, value: CheckboxOnChangeData) => {
    formData && (formData.current.isDirected = value.checked as boolean);
  };

  const handleClickNewGraph = () => {
    if (formData) {
      setSetting({
        ...formData.current
      });
      trigger(formData.current);
    }
  };

  return (
    <>
      <Field label="Graph Size">
        <Select onChange={handleGraphSizeChange}>
          <option value="small">Small</option>
          <option value="middle">Middle</option>
          <option value="large">Large</option>
        </Select>
      </Field>

      <Field>
        <Checkbox
          value="isDirected"
          label="Directed"
          onChange={handleDirectedChange}
        />
      </Field>

      <Button onClick={handleClickNewGraph}>New Graph</Button>
    </>
  );

};

export default GraphSetting;
