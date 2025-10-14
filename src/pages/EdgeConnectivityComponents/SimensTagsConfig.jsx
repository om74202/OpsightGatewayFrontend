// import React, { useState, useCallback, useEffect, useRef } from "react";
// import {
//   Play,
//   RefreshCw,
//   Save,
//   CheckCircle,
//   Wifi,
//   WifiOff,
//   ChevronDown,
//   ChevronUp,
//   AlertCircle,
// } from "lucide-react";
// import { useNotify } from "../../context/ConfirmContext";
// import { applyScaling } from "../../functions/tags";
// import axios from "axios";

// const Datatypes = ["INT","DINT", "REAL", "BOOL"];
// const DatatypesGlobal = ["INT","DINT", "DWORD","REAL", "BOOL"];

// const ServerSection = React.memo(
//   ({
//     setIsExpanded,
//     removeTag,
//     browsedTags=[],
//     addTag,
//     isLoading,
//     isExpanded,
//     server,
//     tags,
//     handleInputChange,
//     updateTagProperties,
//     globalTags,
//   }) => (
//     <div>
//       <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
//         {/* Header */}
//         <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => {
//                   isExpanded ? setIsExpanded(false) : setIsExpanded(true);
//                 }}
//                 className="p-1 hover:bg-gray-200 rounded transition-colors"
//               >
//                 {isExpanded ? (
//                   <ChevronUp className="w-5 h-5 text-gray-600" />
//                 ) : (
//                   <ChevronDown className="w-5 h-5 text-gray-600" />
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {isExpanded && (
//           <div className={`p-4`}>
//             <div className={`mb-3`}>
//               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4"></div>

//               <div className="mb-4">
//                 <h6 className="text-sm font-semibold text-gray-700 mb-2">
//                   Tags
//                 </h6>

//                 {(tags || []).map((tag) => (
//                   <div
//                     key={tag.id}
//                     className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-2"
//                   >
//                       {['type', 'db', 'offset', 'bit'].map((field) =>
//                           field === 'type' ? (
//                             <div>
//                                <label className="block text-sm font-medium text-gray-700 mb-1">{field}<span className="text-red-500">*</span></label>
//                             <select
//                               key={field}
//                               value={tag[field]}
//                               onChange={(e)=>handleInputChange('tag',tag.id,field,e.target.value)}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//                             >
//                               {Datatypes.map((fc) => (
//                                 <option key={fc} value={fc}>
//                                   {fc}
//                                 </option>
//                               ))}
//                             </select>
//                             </div>
//                           ) : (
//                            <div>
//                              <label className="block text-sm font-medium text-gray-700 mb-1">{field}<span className="text-red-500">*</span></label>
//                             <input
//                               key={field}
//                               placeholder={field}
//                               value={tag[field]}
//                               onChange={(e)=>handleInputChange('tag',tag.id,field,e.target.value)}
//                               className="px-3 py-2 border border-gray-300 rounded text-sm"
//                             />
//                            </div>
//                           )
//                         )}
//                     <button
//                       className="text-sm text-red-600 hover:underline"
//                       onClick={() => {
//                         removeTag("tag", tag.id);
//                       }}
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 ))}
//                 <button
//                   onClick={() => {
//                     addTag("tag");
//                   }}
//                   className="text-blue-600 text-sm hover:underline mt-1"
//                 >
//                   + Add Tag
//                 </button>

//                 <div className="mt-4">
//                   <h6 className="text-sm font-semibold text-gray-700 mb-2">
//                     Global Tags
//                   </h6>
//                   {(globalTags || []).map((tag) => (
//                     <div
//                       key={tag.id}
//                       className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-2"
//                     >
//                       {['type', 'area', 'offset', 'bit'].map((field) =>
//                           field === 'type' ? (
//                              <div>
//                               <label className="block text-sm font-medium text-gray-700 mb-1">{field}<span className="text-red-500">*</span></label>
//                             <select
//                               key={field}
//                               value={tag[field]}
//                               onChange={(e)=>handleInputChange('globalTag',tag.id,'type',e.target.value)}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
//                             >
//                               {DatatypesGlobal.map((fc) => (
//                                 <option key={fc} value={fc}>
//                                   {fc}
//                                 </option>
//                               ))}
//                             </select>
//                              </div>
//                           ) : (
//                              <div>
//                                <label className="block text-sm font-medium text-gray-700 mb-1">{field}<span className="text-red-500">*</span></label>
//                             <input
//                               key={field}
//                               placeholder={field}
//                               value={tag[field]}
//                               onChange={(e)=>handleInputChange('globalTag',tag.id,field,e.target.value)}
                              
//                               className="px-3 py-2 border border-gray-300 rounded text-sm"
//                             />
//                              </div>
//                           )
//                         )}

//                       <button
//                         onClick={() => {
//                           removeTag("globalTag", tag.id);
//                         }}
//                         className="text-sm text-red-600 hover:underline"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   ))}
//                   <button
//                     onClick={() => {
//                       addTag("globalTag");
//                     }}
//                     className="text-blue-600 text-sm hover:underline mt-1"
//                   >
//                     + Add Global Tag
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

// <div>
//   <div className="w-full px-5">
//     <h4 className="text-md font-medium text-gray-700 mb-3">Tag Data</h4>

//     {isLoading ? (
//       // Skeleton loader
//       <div className="overflow-x-auto border border-gray-200 rounded-md">
//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               {['Check', 'Id', 'Name', 'Datatype', 'Scaling', 'Value'].map((col) => (
//                 <th
//                   key={col}
//                   className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                 >
//                   {col}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {[...Array(5)].map((_, i) => (
//               <tr key={i} className="hover:bg-gray-50">
//                 {[...Array(6)].map((_, j) => (
//                   <td key={j} className="px-4 py-3">
//                     <div className="h-4 bg-gray-300 rounded animate-pulse w-full"></div>
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     ) : browsedTags.length > 0 ? (
//       <div className="overflow-x-auto border border-gray-200 rounded-md">
//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datatype</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scaling</th>
//               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {browsedTags.map((tag) => (
//               <tr key={tag.id} className="hover:bg-gray-50">
//                 <td className="px-4 py-3">
//                   <input
//                     type="checkbox"
//                     onClick={(e) => updateTagProperties(tag.id,'status', e.target.checked ? 'pass':'fail')}
//                     className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                   />
//                 </td>
//                 <td className="px-4 py-3 text-sm text-gray-900 font-mono">{tag.id}</td>
//                 <td className="px-4 py-3">
//                   <input
//                     type="text"
//                     value={tag.name}
//                     onChange={(e) => updateTagProperties(tag.id,'name', e.target.value)}
//                     className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                   />
//                 </td>
//                 <td className="px-4 py-3 text-sm text-gray-900 font-mono">{tag.id?.split('_')[0] || ""}</td>
//                 <td className="px-4 py-3">
//                   <input
//                     type="text"
//                     value={tag.scaling}
//                     onChange={(e) => updateTagProperties(tag.id,'scaling', e.target.value)}
//                     className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                   />
//                 </td>
//                 <td className="px-4 py-3 text-sm text-gray-900 font-mono">{applyScaling(tag?.scaling || "", tag.value)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     ) : (
//       <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center text-gray-500">
//         <WifiOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
//         <p className="text-sm">No tags available. Click "Browse Tags" to load tags from the server.</p>
//       </div>
//     )}
//   </div>
// </div>

//       </div>
//     </div>
//   )
// );

// export const SimensTagsConfig = ({serverInfo}) => {
//   const [isLoading,setIsLoading]=useState(false)
//   const notify=useNotify()
//   const [tags, setTags] = useState([
//         {
//       id: 1,
//       type: "INT",
//       db:0,
//       offset: 0,
//       bit: 0,
//     },
//   ]);
//     const wsRef = useRef(null);
//   const [globalTags, setGlobalTags] = useState([
//     {
//       id: 1,
//       type: "INT",
//       area: "",
//       offset: 0,
//       bit: 0,
//     },
//   ]);
//   const [browsedTags, setBrowsedTags] = useState([]);
//   const [isExpanded, setIsExpanded] = useState(true);
//   const [count,setCount]=useState(0);


//   const handleInputChange = (name, id, field, value) => {
//   // Define fields that should always be integers
//   const intFields = ['offset', 'bit', 'db'];

//   const updateField = (prevTags) =>
//     prevTags.map(tag =>
//       tag.id === id
//         ? {
//             ...tag,
//             [field]: intFields.includes(field) ? parseInt(value || 0, 10) : value,
//           }
//         : tag
//     );

//   if (name === 'tag') {
//     console.log(field,value)
//     setTags(updateField);
//   } else if (name === 'globalTag') {
//     setGlobalTags(updateField);
//   }
//   };




//   const addTag = (name) => {
//     if (name === "tag") {
//       let last = tags[tags.length - 1]?.id || 0;
//       const newTag = {
//         id: ++last,
//         type: "",
//         db: 0,
//         offset: 0,
//         bit: 0,
//       };
//       setTags((prev) => [...prev, newTag]);
//     } else {
//       let last = globalTags[globalTags.length - 1].id;
//       const newTag = {
//         id: ++last,
//         type: "",
//         area: "",
//         offset: 0,
//         bit: 0,
//       };
//       setGlobalTags((prev) => [...prev, newTag]);
//     }
//     console.log(tags);
//   };

//   const removeTag = (name, id) => {
//     const removeById = (tags) =>
//       tags.length > 1 ? tags.filter((tag) => tag.id !== id) : tags;

//     if (name === "tag") {
//       setTags(removeById);
//     } else {
//       setGlobalTags(removeById);
//     }
//   };

//   const disConnectServer = async () => {
//     try {
//       const response = await axios.post(
//         `/siemen-plc/disconnect`
//       );
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const saveTags=async()=>{
    
//     try{
//       console.log(browsedTags)
//       const payload = browsedTags
//   .filter(node => node.status === 'pass')
//   .map(({ name, scaling="", id }) => ({
//     name,
//     dataType:id?.split('_')[0],
//     scaling,
//     address:id,
//     serverId: serverInfo.id
//   }));

//       const response=await axios.post(`${process.env.REACT_APP_API_URL}/allServers/tags/add`,{tags:payload}) 
//       if(response.data.status!=="success"){
//         notify.error(response.data.message || "failed to add Tags")
//       }
//       notify.success("Tags saved successfully")
//     }catch(e){
//       console.log(e);
      
//     }
//   }


//   function updateTagProperties(id, field, value) {
//     setBrowsedTags((prev) => {
//       const index = prev.findIndex((tag) => tag.id === id);

//       if (index !== -1) {
//         // Update existing tag
//         return prev.map((tag) =>
//           tag.id === id ? { ...tag, [field]: value } : tag
//         );
//       } else {
//         // Add new tag
//         return [...prev, { id, [field]: value }];
//       }
//     });
//   }


//   const browseTags = async () => {
//             if( tags[0].db===0 || tags[0].db===""){
//       alert("Please enter the  DB of  Tags ")
//       return
//     }

//         if( tags[0].bit<0 || tags[0].offset<0 ){
//       alert("Please enter greater than 0 bits and offset")
//       return
//     }
//     setIsLoading(true)
//     try{
//         const payload={
//             serverInfo:{name:serverInfo.name,frequency:serverInfo.frequency,...serverInfo.data},
//             result:{tags,global_tags:globalTags}
//         }
//         console.log(payload)
//         const response=await axios.post(`/siemen-plc/start-background-read/`,payload)
//         setCount(count+1)
//     }catch(e){
//         console.log(e);
//     }finally{
//       setIsLoading(false)
//     }
//   };







// useEffect(() => {
//   if (count <= 0) {
//     // Close existing connection if count goes to 0
//     if (wsRef.current) {
//       wsRef.current.close();
//       wsRef.current = null;
//     }
//     return;
//   }

//   // Prevent duplicate connection
//   if (wsRef.current) return;

//   const ws = new WebSocket(`${process.env.REACT_APP_API_WEBSOCKET_URL}`);
//   wsRef.current = ws;

//   ws.onopen = () => {
//     console.log("WebSocket connected");
//   };

//   ws.onmessage = (event) => {
//     try {
//       const data = JSON.parse(event.data);
//       const name = data.stream;

//       if (name === "Siemen_stream") {
//         const transformedData = Object.entries(data?.data || {}).map(
//           ([id, value]) => ({ id, value })
//         );

//         setBrowsedTags((prevTags) => {
//           const updatedTags = [...prevTags];

//           transformedData.forEach((newTag) => {
//             const index = updatedTags.findIndex((tag) => tag.id === newTag.id);

//             if (index !== -1) {
//               // If tag exists, update its value
//               updatedTags[index] = { ...updatedTags[index], value: newTag.value };
//             } else {
//               // If tag is new, add it
//               updatedTags.push({ ...newTag, name: newTag.id });
//             }
//           });

//           return updatedTags;
//         });
//       }
//     } catch (err) {
//       console.error("Error parsing WebSocket data", err);
//     }
//   };

//   ws.onerror = (err) => {
//     console.error("WebSocket error:", err);
//   };

//   ws.onclose = () => {
//     console.log("WebSocket closed");
//     wsRef.current = null; // cleanup ref
//   };

//   // Cleanup if count changes or component unmounts
//   return () => {
//     if (wsRef.current) {
//       wsRef.current.close();
//       wsRef.current = null;
//     }
//   };
// }, [count]);


//   return (
//     <div>
//       <div className="flex justify-end">
//       <button
//         onClick={() => {
//           disConnectServer();
//         }}
//         type="button"
//         className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium 
//                   rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900
//                   disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
//         disabled={browseTags.length === 0}
//       >
//         Disconnect Server
//       </button>

//         <div className="flex gap-2">
//           <button
//             onClick={() => browseTags()}
//             className="flex items-center  px-3 py-1 max-h-10 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
//           >
//             <Play className="w-4 h-4" />
//             Browse Tags
//           </button>
//           <button
//             onClick={() => saveTags()}
//             className="flex items-center  px-3 py-1 max-h-10 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
//           >
//             <Play className="w-4 h-4" />
//             Save Tags
//           </button>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
//         <ServerSection
//           serverInfo={serverInfo}
//           tags={tags}
//           isLoading={isLoading}
//           removeTag={removeTag}
//           addTag={addTag}
//           setIsExpanded={setIsExpanded}
//           browsedTags={browsedTags}
//           isExpanded={isExpanded}
//           globalTags={globalTags}
//           updateTagProperties={updateTagProperties}
//           handleInputChange={handleInputChange}
//           browseTags={browseTags}
//         />
//       </div>
//     </div>
//   );
// };
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Save as SaveIcon,
  WifiOff,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNotify } from "../../context/ConfirmContext";
import { applyScaling } from "../../functions/tags";
import axios from "axios";

const Datatypes = ["INT", "DINT", "REAL", "BOOL"];
const DatatypesGlobal = ["INT", "DINT", "DWORD", "REAL", "BOOL"];

/* -------------------------------------------------------------------------- */
/*                        Server section (form-driven UI)                      */
/* -------------------------------------------------------------------------- */
const ServerSection = React.memo(function ServerSection({
  // UI
  isExpanded,
  setIsExpanded,
  isLoading,
  // RHF plumbing
  register,
  errors,
  tagsFields,
  appendTag,
  removeTag,
  globalFields,
  appendGlobal,
  removeGlobal,
  // Browsed tag table
  browsedTags,
  updateBrowsedTag,
}) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              Siemens Tags
              {browsedTags.length > 0 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {browsedTags.length} results
                </span>
              )}
            </h3>
          </div>
        </div>
      </div>

      {/* Form body */}
      {isExpanded && (
        <div className="p-4">
          {/* Process-Image/DB Tags */}
          <div className="mb-4">
            <h6 className="text-sm font-semibold text-gray-700 mb-2">Tags</h6>

            {tagsFields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-2"
              >
                {/* type (select) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    type<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    {...register(`tags.${idx}.type`, {
                      required: "Type is required",
                    })}
                  >
                    {Datatypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors?.tags?.[idx]?.type && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.tags[idx].type.message}
                    </p>
                  )}
                </div>

                {/* db */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    db<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="px-3 py-2 border border-gray-300 rounded text-sm w-full"
                    type="number"
                    {...register(`tags.${idx}.db`, {
                      valueAsNumber: true,
                      required: "DB is required",
                      min: { value: 0, message: "DB must be >= 0" },
                    })}
                  />
                  {errors?.tags?.[idx]?.db && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.tags[idx].db.message}
                    </p>
                  )}
                </div>

                {/* offset */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    offset<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="px-3 py-2 border border-gray-300 rounded text-sm w-full"
                    type="number"
                    {...register(`tags.${idx}.offset`, {
                      valueAsNumber: true,
                      required: "Offset is required",
                      min: { value: 0, message: "Offset must be >= 0" },
                    })}
                  />
                  {errors?.tags?.[idx]?.offset && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.tags[idx].offset.message}
                    </p>
                  )}
                </div>

                {/* bit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    bit<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="px-3 py-2 border border-gray-300 rounded text-sm w-full"
                    type="number"
                    {...register(`tags.${idx}.bit`, {
                      valueAsNumber: true,
                      required: "Bit is required",
                      min: { value: 0, message: "Bit must be >= 0" },
                    })}
                  />
                  {errors?.tags?.[idx]?.bit && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.tags[idx].bit.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeTag(idx)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                appendTag({ type: "INT", db: 0, offset: 0, bit: 0 })
              }
              className="text-blue-600 text-sm hover:underline mt-1"
            >
              + Add Tag
            </button>
          </div>

          {/* Global Tags */}
          <div className="mt-4">
            <h6 className="text-sm font-semibold text-gray-700 mb-2">
              Global Tags
            </h6>

            {globalFields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-2"
              >
                {/* type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    type<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    {...register(`globalTags.${idx}.type`, {
                      required: "Type is required",
                    })}
                  >
                    {DatatypesGlobal.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors?.globalTags?.[idx]?.type && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.globalTags[idx].type.message}
                    </p>
                  )}
                </div>

                {/* area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    area<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="px-3 py-2 border border-gray-300 rounded text-sm w-full"
                    placeholder="e.g., M, Q, I"
                  />
                  {errors?.globalTags?.[idx]?.area && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.globalTags[idx].area.message}
                    </p>
                  )}
                </div>

                {/* offset */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    offset<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="px-3 py-2 border border-gray-300 rounded text-sm w-full"
                    type="number"
                    {...register(`globalTags.${idx}.offset`, {
                      valueAsNumber: true,
                      required: "Offset is required",
                      min: { value: 0, message: "Offset must be >= 0" },
                    })}
                  />
                  {errors?.globalTags?.[idx]?.offset && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.globalTags[idx].offset.message}
                    </p>
                  )}
                </div>

                {/* bit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    bit<span className="text-red-500">*</span>
                  </label>
                  <input
                    className="px-3 py-2 border border-gray-300 rounded text-sm w-full"
                    type="number"
                    {...register(`globalTags.${idx}.bit`, {
                      valueAsNumber: true,
                      required: "Bit is required",
                      min: { value: 0, message: "Bit must be >= 0" },
                    })}
                  />
                  {errors?.globalTags?.[idx]?.bit && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.globalTags[idx].bit.message}
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeGlobal(idx)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                appendGlobal({ type: "INT", area: "", offset: 0, bit: 0 })
              }
              className="text-blue-600 text-sm hover:underline mt-1"
            >
              + Add Global Tag
            </button>
          </div>
        </div>
      )}

      {/* Browsed Tags Table */}
      <div className="w-full px-5 pb-4">
        <h4 className="text-md font-medium text-gray-700 mb-3">Tag Data</h4>

        {isLoading ? (
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Check", "Id", "Name", "Datatype", "Scaling", "Value"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {[...Array(6)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-300 rounded animate-pulse w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : browsedTags.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Id
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datatype
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scaling
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {browsedTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        onChange={(e) =>
                          updateBrowsedTag(tag.id, "status", e.target.checked ? "pass" : "fail")
                        }
                        className="h-4 w-4 text-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {tag.id}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={tag.name}
                        onChange={(e) =>
                          updateBrowsedTag(tag.id, "name", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {tag.id?.split("_")[0] || ""}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={tag.scaling || ""}
                        onChange={(e) =>
                          updateBrowsedTag(tag.id, "scaling", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                      {applyScaling(tag?.scaling || "", tag.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center text-gray-500">
            <WifiOff className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              No tags available. Click &quot;Browse Tags&quot; to load tags from the
              server.
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                            Main (exported) page                             */
/* -------------------------------------------------------------------------- */
export const SimensTagsConfig = ({ serverInfo }) => {
  const notify = useNotify();
  const wsRef = useRef(null);

  // UI
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [browsedTags, setBrowsedTags] = useState([]);
  const [count, setCount] = useState(0); // WS session trigger
    console.log(process.env.REACT_APP_API_WEBSOCKET_URL,"Connecting to this url")


  // RHF setup
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      // arrays for RHF
      tags: [
        {
          type: "INT",
          db: 0,
          offset: 0,
          bit: 0,
        },
      ],
      globalTags: [
        {
          type: "INT",
          area: "",
          offset: 0,
          bit: 0,
        },
      ],
    },
    mode: "onSubmit",
  });

  const {
    fields: tagsFields,
    append: appendTag,
    remove: removeTagIndex,
  } = useFieldArray({
    control,
    name: "tags",
  });

  const {
    fields: globalFields,
    append: appendGlobal,
    remove: removeGlobalIndex,
  } = useFieldArray({
    control,
    name: "globalTags",
  });

  /* -------------------------- Browsed tags helpers ------------------------- */
  const updateBrowsedTag = useCallback((id, field, value) => {
    setBrowsedTags((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return [...prev, { id, [field]: value }];
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  /* -------------------------------- Actions -------------------------------- */
  const disConnectServer = async () => {
    try {
      await axios.post(`/siemen-plc/disconnect`);
      notify.success("Disconnected");
      wsRef.current?.close();
    } catch (e) {
      console.log(e);
      notify.error("Failed to disconnect");
    }
  };

  // Browse with RHF validation
  const onBrowse = async (values) => {
    try {
      // Extra safety: ensure at least one tag row exists
      if (!values.tags?.length && !values.globalTags?.length) {
        notify.error("Please add at least one Tag or Global Tag");
        return;
      }

      setIsLoading(true);

      // Build payload
      const payload = {
        serverInfo: {
          name: serverInfo.name,
          frequency: serverInfo.frequency,
          ...(serverInfo?.data || {}),
        },
        result: {
          tags: values.tags?.map((t, idx) => ({
            id: idx + 1,
            type: t.type,
            db: Number(t.db),
            offset: Number(t.offset),
            bit: Number(t.bit),
          })),
          global_tags: values.globalTags?.map((t, idx) => ({
            id: idx + 1,
            type: t.type,
            area: t.area,
            offset: Number(t.offset),
            bit: Number(t.bit),
          })),
        },
      };

      await axios.post(`/siemen-plc/start-background-read/`, payload);
      setCount((c) => c + 1);
      notify.success("Browsing started");
    } catch (e) {
      console.log(e);
      notify.error("Failed to start browsing");
    } finally {
      setIsLoading(false);
    }
  };

  // Save: only ensure name is not empty for selected (status === 'pass')
  const onSave = async () => {
    try {
      const payload = (browsedTags || [])
        .filter((node) => node.status === "pass")
        .map(({ name, scaling = "", id }) => ({
          name: String(name || "").trim(),
          dataType: id?.split("_")[0],
          scaling,
          address: id,
          serverId: serverInfo.id,
        }));

      if (payload.length === 0) {
        notify.error("No selected tags to save");
        return;
      }

      // name validation
      const hasEmpty = payload.some((t) => !t.name);
      if (hasEmpty) {
        notify.error("Please provide a name for all selected tags");
        return;
      }

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/allServers/tags/add`,
        { tags: payload }
      );

      if (res?.data?.status !== "success") {
        notify.error(res?.data?.message || "Failed to save tags");
        return;
      }

      notify.success("Tags saved successfully");
    } catch (e) {
      console.log(e);
      notify.error("Failed to save tags");
    }
  };

  /* ------------------------------- WebSocket ------------------------------- */
  useEffect(() => {

    if (wsRef.current) return;

    const ws = new WebSocket(`${process.env.REACT_APP_API_WEBSOCKET_URL}`);
    wsRef.current = ws;

    ws.onopen = () => {
      // console.log("WS connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.stream !== "Siemen_stream") return;

        const transformed = Object.entries(msg?.data || {}).map(([id, value]) => ({
          id,
          value,
        }));

        setBrowsedTags((prev) => {
          const next = [...prev];
          transformed.forEach((n) => {
            const i = next.findIndex((t) => t.id === n.id);
            if (i === -1) {
              next.push({ ...n, name: n.id }); // default name = id
            } else {
              next[i] = { ...next[i], value: n.value };
            }
          });
          return next;
        });
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    ws.onerror = (err) => console.error("WS error:", err);
    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [count]);

  /* --------------------------------- UI ----------------------------------- */
  return (
    <div>
      <div className="flex justify-end gap-2 mb-3">
        <button
          type="button"
          onClick={disConnectServer}
          className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium 
                     rounded-lg text-sm px-5 py-2.5 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
          disabled={browsedTags.length === 0}
        >
          Disconnect Server
        </button>

        <button
          type="button"
          onClick={handleSubmit(onBrowse)} // RHF validation
          className="flex items-center px-3 py-2 max-h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          <Play className="w-4 h-4 mr-1" />
          Browse Tags
        </button>

        <button
          type="button"
          onClick={onSave}
          className="flex items-center px-3 py-2 max-h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          <SaveIcon className="w-4 h-4 mr-1" />
          Save Tags
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <ServerSection
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          isLoading={isLoading}
          register={register}
          errors={errors}
          tagsFields={tagsFields}
          appendTag={appendTag}
          removeTag={removeTagIndex}
          globalFields={globalFields}
          appendGlobal={appendGlobal}
          removeGlobal={removeGlobalIndex}
          browsedTags={browsedTags}
          updateBrowsedTag={updateBrowsedTag}
        />
      </div>
    </div>
  );
};
