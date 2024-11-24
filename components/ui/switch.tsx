import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div
        className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 
        ${checked ? "peer-checked:bg-blue-600" : ""}`}
      ></div>
      <div
        className={`absolute w-5 h-5 bg-white rounded-full transition-all transform top-0.5 left-0.5 
        ${checked ? "translate-x-5" : ""}`}
      ></div>
    </label>
  );
};

export default Switch;
