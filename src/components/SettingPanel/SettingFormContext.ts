import { createContext, MutableRefObject } from "react";

interface ISettingFormContext {
  formData: MutableRefObject<GraphAPI.Setting> | null;
}

const SettingFormContext = createContext<ISettingFormContext>({
  formData: null
});

export default SettingFormContext;
