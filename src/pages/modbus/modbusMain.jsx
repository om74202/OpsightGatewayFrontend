import { useState } from "react";

import { ModbusConfigTags } from "./ModbusConfigTags";
import { ModbusTagsList } from "./ModbusTagsList";


export const ModbusMain=()=>{
    const [activeTab, setActiveTab] = useState("Tags")
      const renderContent = () => {
    switch (activeTab) {
      case "Browse Tags":
        return (
          <div className="">
            <ModbusConfigTags/>
          </div>
        );
      case "Tags":
        return (
          <div className="p-4">
            <ModbusTagsList/>
          </div>
        );
      case "Formulas":
        return (
          <div className="p-4">
            
          </div>
        );
      default:
        return <div className="p-4">Select a tab to see content</div>;
    }
  };

  return (
    <div>
        <div className="flex justify-start mb-4">
       
       
            <button
              className={`px-4 py-2 w-full font-semibold disabled:text-gray-400 ${
                activeTab === "Browse Tags"
                  ? "border-blue-600 border-b-2 text-blue-600"
                  : "border-gray-200 border-b-2 text-gray-700"
              }`}
              onClick={() => setActiveTab("Browse Tags")}
            >
              Browse Tags
            </button>
      
        <button
          className={`px-4 py-2 w-full font-semibold disabled:text-gray-400 ${
            activeTab === "Tags"
                  ? "border-blue-600 border-b-2 text-blue-600"
              : "border-gray-200 border-b-2 text-gray-700"
          }`}
          onClick={() => setActiveTab("Tags")}
        >
          Tags 
        </button>
        <button
          className={`px-4 py-2 w-full font-semibold  ${
            activeTab === "Formulas"
            ? "border-blue-600 border-b-2 text-blue-600"
              : "border-gray-200 border-b-2 text-gray-700"
          }`}
          onClick={() => setActiveTab("Formulas")}
        >
          Formulas
        </button>
      </div>
      <div className="content">{renderContent()}</div>
    </div>
  )
}