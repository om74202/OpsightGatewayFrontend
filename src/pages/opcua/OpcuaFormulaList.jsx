
// import React, { useState, useRef, useEffect,useMemo } from 'react';
// import { Save, RotateCcw, Edit2, Trash2, Plus, X, Filter, Search, Check } from 'lucide-react';
// import axios from 'axios';
// import { capitalizeFirstLetter } from '../BrowseTags';
// import { useForm, Controller } from 'react-hook-form';

// import { useConfirm, useNotify } from '../../context/ConfirmContext';


// const protocolOrder = {
//   "opc ua": 1,
//   modbusrtu: 2,
//   modbustcp: 3,
//   siemens: 4,
//   slmp: 5,
// };

// export const FormulaConfig = () => {


//   // Mock data for demonstration - replace with your actual localStorage logic
//   const notify=useNotify()
//   const serverInfo = JSON.parse(localStorage.getItem("Server"))
//   const confirm=useConfirm()
//   const [loading,setLoading]=useState(false)
  
//   const [tagsList,setTagsList]=useState([])
//   const [variables, setVariables] = useState([]);
//   const [expression, setExpression] = useState('');
//   const [formulaName, setFormulaName] = useState('');
//   const [savedFormulas, setSavedFormulas] = useState([]);
//   const [testValues, setTestValues] = useState({});
//   const [suggestions, setSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [selectedSuggestion, setSelectedSuggestion] = useState(0);
//   const [cursorPosition, setCursorPosition] = useState(0);
//   const [result, setResult] = useState(0);
//   const inputRef = useRef(null);
//   const [servers,setServers]=useState([]);
//   const [selectedServer,setSelectedServer]=useState({});
//     const {
//   control,
//   handleSubmit,
//   formState: { errors, isValid, isSubmitting },
// } = useForm({
//   mode: 'onChange',
//   defaultValues: {
//     name: formulaName || '',
//     formula: expression || '',
//   },
// });


//     const [filters, setFilters] = useState({ name: "", protocol: "", serverName: "" });
//     const [count, setCount] = useState(0);
//     const [editingFormulaId, setEditingFormulaId] = useState(null);
//     const [editValues, setEditValues] = useState({ name: "", expression: "" });



 



//   const getAllServers=async()=>{
//     setLoading(true)
//         try{
//       const responseServers=await axios.get(`${process.env.REACT_APP_API_URL}/allServers/all`);

//       const response=await axios.get(`${process.env.REACT_APP_API_URL}/allServers/customTag/get`);
//       setVariables(
//   responseServers.data.servers.flatMap(server => server.tags.map(tag => tag.name))
// );

//       setServers(responseServers.data?.servers || [])
//       const c=response.data?.servers || [];
//       setSavedFormulas(response.data?.data || [])
//     }catch(e){
//       console.log(e);
//     }finally{
//       setLoading(false)
//     }
//   }

//   useEffect(()=>{
//     getAllServers();
//   },[])
//   useEffect(()=>{
//     setTagsList(selectedServer?.tags?.map((t)=>t.name) || [])
//   },[selectedServer])
//   // filters






//   const saveFormula = async() => {
//     try{
//      if (!formulaName.trim() || !expression.trim()) return;
    
//     const parseResult = parseFormula(expression,tagsList);
//     if (!parseResult.isValid) {
//       alert(`Invalid formula: ${parseResult.error}`);
//       return;
//     }

//     const newFormula = {
//       name: formulaName,
//       type:selectedServer?.protocol,
//       expression: expression.trim(),
//       serverId:serverInfo.id
//     };
//     console.log(newFormula)


//       const response = await axios.post(`${process.env.REACT_APP_API_URL}/allServers/customTag/save`, newFormula);
//       console.log(response.data);
    
//     alert("Custom Tags Updated")
//     getAllServers();

//     setFormulaName('');
//     setExpression('');
//     setShowSuggestions(false); 
//     }catch(e){
//       console.log(e)
//     }finally{
//     }
//   };


//     const filteredFormulas = useMemo(() => {
//     return savedFormulas.filter((formula) => {
//       const nameMatch = formula.name.toLowerCase().includes(filters.name.toLowerCase());
//       const protocolMatch = !filters.protocol || formula.server.type === filters.protocol;
//       const serverMatch = !filters.serverName || formula.server.name === filters.serverName;
//       return nameMatch && protocolMatch && serverMatch;
//     });
//   }, [saveFormula, filters]);


//   const handleFilterChange = (filterType, value) => {
//     setFilters((prev) => ({ ...prev, [filterType]: value }));
//   };

//   const clearFilters = () => {
//     setFilters({ name: "", protocol: "", serverName: "" });
//   };

//   const deleteFormula = async (id) => {
//     try{
//       const ok=await confirm("Are you sure you want to delete this custom tag?")
//       if(!ok){
//         return;
//       }
//       const response = await axios.delete(`${process.env.REACT_APP_API_URL}/allServers/customTag/delete/${id}`);
//       getAllServers()
//       notify.success("Custom tag deleted successfully!");
//     }catch(e){
//       notify.error("Failed to delete custom tag")
//     }
//   };
//     const startEditing = (formula) => {
//     setEditingFormulaId(formula.id);
//     setEditValues({ name: formula.name, expression: formula.expression });
//   };


//   // Parse and validate formula
// const parseFormula = (input,vars=variables) => {
//   try {
//     console.log(variables,vars)
//     let testExpression = input;
//     const sortedVariables = vars.sort((a, b) => b.length - a.length);

//     sortedVariables.forEach((variable) => {
//       const regex = new RegExp(
//         `\\b${variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
//         "g"
//       );
//       testExpression = testExpression.replace(regex, "1");
//     });

//     const validChars = /^[0-9+\-*/().\s]+$/;
//     if (!validChars.test(testExpression)) {
//       return { isValid: false, error: "Invalid characters in formula" };
//     }

//     const result = Function('"use strict"; return (' + testExpression + ")")();

//     // 🔍 Check for NaN / Infinity
//     if (!Number.isFinite(result)) {
//       return { isValid: false, error: "Formula evaluates to Infinity or NaN" };
//     }

//     return { isValid: true, expression: input };
//   } catch (error) {
//     return { isValid: false, error: "Invalid formula syntax" };
//   }
// };


//   // Find current word being typed at cursor position
//   const getCurrentWord = (text, position) => {
//     let start = position;
//     while (start > 0 && /[a-zA-Z0-9_]/.test(text[start - 1])) {
//       start--;
//     }
    
//     let end = position;
//     while (end < text.length && /[a-zA-Z0-9_]/.test(text[end])) {
//       end++;
//     }
    
//     return {
//       word: text.substring(start, end),
//       start: start,
//       end: end
//     };
//   };

//   // Handle input change with suggestions
//   const handleInputChange = (e) => {
//     const value = e.target.value;
//     const position = e.target.selectionStart;
//     setExpression(value);
//     setCursorPosition(position);
    
//     // Calculate result in real-time
//     const testResult = evaluateFormula(value, testValues);
//     setResult(testResult);
    
//     const currentWordInfo = getCurrentWord(value, position);
//     const currentWord = currentWordInfo.word;
    
//     if (currentWord && currentWord.length > 0 && /^[a-zA-Z]/.test(currentWord)) {
//       const matchingVars = tagsList.filter(variable => 
//         variable.toLowerCase().startsWith(currentWord.toLowerCase()) &&
//         variable.toLowerCase() !== currentWord.toLowerCase()
//       );
      
//       if (matchingVars.length > 0) {
//         setSuggestions(matchingVars);
//         setShowSuggestions(true);
//         setSelectedSuggestion(0);
//       } else {
//         setShowSuggestions(false);
//       }
//     } else {
//       setShowSuggestions(false);
//     }
//   };

//   // Handle key down events
//   const handleKeyDown = (e) => {
//     if (showSuggestions) {
//       if (e.key === 'ArrowDown') {
//         e.preventDefault();
//         setSelectedSuggestion((prev) => 
//           prev < suggestions.length - 1 ? prev + 1 : prev
//         );
//       } else if (e.key === 'ArrowUp') {
//         e.preventDefault();
//         setSelectedSuggestion((prev) => prev > 0 ? prev - 1 : prev);
//       } else if (e.key === 'Tab' || e.key === 'Enter') {
//         e.preventDefault();
//         applySuggestion(suggestions[selectedSuggestion]);
//       } else if (e.key === 'Escape') {
//         setShowSuggestions(false);
//       }
//     }
//   };

//   // Apply selected suggestion
//   const applySuggestion = (suggestion) => {
//     const currentWordInfo = getCurrentWord(expression, cursorPosition);
    
//     const beforeWord = expression.substring(0, currentWordInfo.start);
//     const afterWord = expression.substring(currentWordInfo.end);
    
//     const newValue = beforeWord + suggestion + afterWord;
    
//     setExpression(newValue);
//     setShowSuggestions(false);
    
//     setTimeout(() => {
//       const newPosition = currentWordInfo.start + suggestion.length;
//       inputRef.current.setSelectionRange(newPosition, newPosition);
//     }, 0);
//   };

//   // Clear formula
//   const clearFormula = () => {
//     setExpression('');
//     setResult(0);
//     setShowSuggestions(false);
//   };

//   // Evaluate formula with given values
//   const evaluateFormula = (formulaString, values) => {
//     try {
//       let expression = formulaString;
//       console.log(variables)
//       const sortedVariables = [...variables].sort((a, b) => b.length - a.length);
      
//       sortedVariables.forEach(variable => {
//         const value = values[variable] || 1; // Default to 1 for demo
//         const regex = new RegExp(`\\b${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
//         expression = expression.replace(regex, value);
//       });
      
//       return Function('"use strict"; return (' + expression + ')')();
//     } catch (error) {
//       return 0;
//     }
//   };


//   // Cancel editing
//   const cancelEditing = () => {
//     setEditingFormulaId(null);
//         setEditValues({ name: "", expression: "" });

//   };

//   // Get formula validation status
//   const getFormulaStatus = (exp=expression) => {
//     console.log(exp,"Testing this expression")
//     if (!exp.trim()) return { isValid: true, message: '' };
//     const result = parseFormula(exp);
//     console.log(result,exp)
//     return {
//       isValid: result.isValid,
//       message: result.isValid ? 'Valid formula' : result.error
//     };
//   };

//     const saveEdit = async (formula) => {
//     if (editValues.name.trim() === "" || editValues.expression.trim() === "") {
//       alert("Name and Expression cannot be empty");
//       return;
//     }
//     console.log(editValues.expression)
// const status=parseFormula(editValues.expression)

// if(!status.isValid){
//   alert(status.error)
//   return
// }


    

//     // check duplicate name
//     const nameExists = savedFormulas.some(
//       (f) => f.id !== formula.id && f.name.toLowerCase() === editValues.name.toLowerCase()
//     );
//     if (nameExists) {
//       notify.error("A formula with this name already exists. Please choose a unique name.");
//       return;
//     }

//     let api = `${process.env.REACT_APP_API_URL}/allServers/customTag/update/${formula.id}`;
//     const payload = { ...formula, name: editValues.name, expression: editValues.expression };

//     try {
//       await axios.put(api, payload);
//       notify.success("Custom tag saved successfully!");
//       setCount(count + 1);
//       cancelEditing();
//     } catch (e) {
//       console.log(e);
//       notify.error("Failed to save custom tag");

//     }finally{
//       getAllServers()
//     }
//   };

//   const formulaStatus = getFormulaStatus();

//     const protocols = [...new Set(savedFormulas.map((f) => f.server.type))];
//   const serverNames = [...new Set(savedFormulas.map((f) => f.server.name))];

//   return (
//     <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">
//             <div className="bg-white rounded-xl border p-4 shadow-sm">
//         <div className="flex items-center gap-2 mb-2">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5 text-gray-500"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//             strokeWidth={2}
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
//             />
//           </svg>
//           <h2 className="font-semibold">Server Selection</h2>
//         </div>
//         <p className="text-gray-500 text-sm">
//           Select a Server to add custom tags.
//         </p>
//         <select
//           value={selectedServer?.name || selectedServer?.serverName || ""}
//           onChange={(e) => {
//             const selected = servers.find(
//               (s) => s.name === e.target.value || s.serverName === e.target.value
//             );
//             if (selected) {
//               setSelectedServer(selected);
              
//               localStorage.setItem("Server",JSON.stringify(selected))
//               console.log(selected)
//             }
//           }}
//           className="border rounded-md p-2 w-64 focus:ring focus:ring-indigo-200"
//         >
//           <option value="">Select Server</option>
//           {servers.map((server) => (
//             <option key={server.serverId || server.id} value={server.name || server.serverName}>
//               {server.name || server.serverName} ->  ({capitalizeFirstLetter((server.protocol || server.type))})
//             </option>
//           ))}
//         </select>

//       </div>

//       {/* Create Custom Tag Section */}
//       <div className="bg-white rounded-lg border border-gray-200 p-6 mb-2">

//         <div className="space-y-4-2">
//           {/* Name Input */}
//           <div className='flex '>
// {/* Name Input (validated) */}
// <div className="w-1/4 mx-6">
//   <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>

//   <Controller
//     name="name"
//     control={control}
//     rules={{
//       required: 'Name is required',
//       validate: (v) => v.trim().length > 0 || 'Name cannot be empty',
//       minLength: { value: 2, message: 'Name must be at least 2 characters' },
//     }}
//     render={({ field }) => (
//       <>
//         <input
//           type="text"
//           placeholder="new"
//           value={formulaName}
//           onChange={(e) => {
//             setFormulaName(e.target.value);   // keep your state updates
//             field.onChange(e.target.value);   // inform RHF
//           }}
//           aria-invalid={!!errors.name || undefined}
//           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
//             errors.name ? 'border-red-400' : 'border-gray-300'
//           }`}
//         />
//         {errors.name && (
//           <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
//         )}
//       </>
//     )}
//   />
// </div>

// {/* Formula Input (validated, keeps your parseFormula logic) */}
// <div className="relative w-3/4 mx-6">
//   <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>

//   <Controller
//     name="formula"
//     control={control}
//     rules={{
//       required: 'Formula is required',
//       // Use your existing parser so validation logic stays identical
//       validate: () => {
//         if (!expression.trim()) return 'Formula is required';
//         const res = parseFormula(expression, tagsList);
//         return res.isValid || res.error; // message from your parser
//       },
//     }}
//     render={({ field }) => (
//       <>
//         <textarea
//           ref={inputRef}
//           value={expression}
//           onChange={(e) => {
//             handleInputChange(e);        // your existing behavior
//             field.onChange(e.target.value); // inform RHF
//           }}
//           onKeyDown={handleKeyDown}
//           placeholder="Enter formula: {TagName} + 10 * 2"
//           rows={3}
//           aria-invalid={!!errors.formula || (!formulaStatus.isValid && !!expression) || undefined}
//           className={`w-full px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none ${
//             errors.formula || (expression && !formulaStatus.isValid)
//               ? 'border-red-300 bg-red-50'
//               : 'border-gray-300'
//           }`}
//         />
//         {/* RHF error (more specific than the generic status below) */}
//         {errors.formula && (
//           <p className="mt-1 text-xs text-red-600">{String(errors.formula.message)}</p>
//         )}

//         {/* Suggestions Dropdown (unchanged) */}
//         {showSuggestions && suggestions.length > 0 && (
//           <div className="absolute left-0 w-3/4 mx-6 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1">
//             {suggestions.map((suggestion, index) => (
//               <div
//                 key={suggestion}
//                 className={`px-4 py-2 cursor-pointer ${
//                   index === selectedSuggestion ? 'bg-blue-100' : 'hover:bg-gray-100'
//                 }`}
//                 onClick={() => applySuggestion(suggestion)}
//               >
//                 <span className="font-mono">{suggestion}</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </>
//     )}
//   />
// </div>

//           </div>


//                     {/* Action Buttons */}
//           <div className="flex gap-3 pt-1">
//             <button
//               onClick={handleSubmit(saveFormula)}
//               disabled={!formulaName.trim() || !expression.trim() || !formulaStatus.isValid}
//               className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-md hover: disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
//             >
//               {loading?"Saving...":"Save Custom Tag"}
//             </button>
//             <button
//               onClick={clearFormula}
//               className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
//             >
//               Clear All
//             </button>
//           </div>



//           {/* Test Formula */}
//           <div className="bg-gray-50 rounded-md">
//             <div className="flex items-center gap-2 mb-2">
//               <span className="text-sm font-medium text-gray-700">Try: {expression || 'ServerStatus + Location1'}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-gray-600">Result:</span>
//               <div className="flex items-center gap-2">
//                 <span className="text-2xl font-bold text-blue-600">{result}</span>
//                 <span className="text-xs text-gray-500">Real-time calculation</span>
//               </div>
//             </div>
//           </div>

//           {/* Formula Status */}
//           {expression && (
//             <div className={`text-sm ${formulaStatus.isValid ? 'text-green-600' : 'text-red-600'}`}>
//               {formulaStatus.message}
//             </div>
//           )}


//         </div>
//       </div>

//       {/* Created Custom Tags Section */}
//       <div className="bg-white rounded-lg border border-gray-200 p-6">
//         <h2 className="text-lg font-semibold mb-2">Created Custom Tags</h2>
//         {/* <p className="text-gray-600 text-sm mb-4">
//           Manage your custom tags. Showing {savedFormulas.length} custom tag(s).
//         </p> */}
        
//         {loading === true ? (
//   // 🔹 Skeleton Table
//   <div className="animate-pulse">
//     <table className="min-w-full border border-gray-200 rounded-lg">
//       <thead className="bg-gray-100"></thead>
//       <tbody>
//         {Array.from({ length: 5 }).map((_, i) => (
//           <tr key={i} className="hover:bg-gray-50">
//             <td className="px-4 py-2 border text-center">
//               <div className="h-4 w-4 bg-gray-300 rounded"></div>
//             </td>
//             <td className="px-4 py-2 border">
//               <div className="h-4 w-32 bg-gray-300 rounded"></div>
//             </td>
//             <td className="px-4 py-2 border">
//               <div className="h-4 w-40 bg-gray-300 rounded"></div>
//             </td>
//             <td className="px-4 py-2 border">
//               <div className="h-4 w-20 bg-gray-300 rounded"></div>
//             </td>
//             <td className="px-4 py-2 border">
//               <div className="h-4 w-20 bg-gray-300 rounded"></div>
//             </td>
//             <td className="px-4 py-2 border">
//               <div className="h-4 w-20 bg-gray-300 rounded"></div>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// ):
//          savedFormulas.length === 0 ? (
//           <div className="text-center py-12 text-gray-500">
//             <Plus className="w-12 h-12 mx-auto text-gray-300 mb-4" />
//             <p>No custom tags created yet</p>
//             <p className="text-sm">Create your first custom tag using the form above</p>
//           </div>
//         ) : (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto">
//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-sm p-2 mb-1">
//           <div className="flex items-center gap-2 mb-4">
//             <Filter className="text-gray-600" size={20} />
//             <h2 className="text-xl font-semibold text-gray-800">Formula Filters</h2>
//             <span className="text-sm text-gray-500">
//               ({filteredFormulas.length} of {savedFormulas.length} formulas shown)
//             </span>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             <div className="relative">
//               <Search
//                 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                 size={16}
//               />
//               <input
//                 type="text"
//                 placeholder="Search by name..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 value={filters.name}
//                 onChange={(e) => handleFilterChange("name", e.target.value)}
//               />
//             </div>

//             <select
//               className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={filters.protocol}
//               onChange={(e) => handleFilterChange("protocol", e.target.value)}
//             >
//               <option value="">All Protocols</option>
//               {protocols.map((protocol) => (
//                 <option key={protocol} value={protocol}>
//                   {capitalizeFirstLetter(protocol)}
//                 </option>
//               ))}
//             </select>

//             <select
//               className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               value={filters.serverName}
//               onChange={(e) => handleFilterChange("serverName", e.target.value)}
//             >
//               <option value="">All Servers</option>
//               {serverNames.map((server) => (
//                 <option key={server} value={server}>
//                   {server}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Formulas Table */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                     Name
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                     Protocol
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                     Expression
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                     Server ID
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredFormulas.map((formula, index) => (
//                   <tr
//                     key={formula.id}
//                     className={`${
//                       index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                     } hover:bg-blue-50 transition-colors`}
//                   >
//                     {/* Name */}
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       {editingFormulaId === formula.id ? (
//                         <input
//                           type="text"
//                           value={editValues.name}
//                           onChange={(e) =>
//                             setEditValues((prev) => ({ ...prev, name: e.target.value }))
//                           }
//                           className="border px-2 py-1 rounded text-sm"
//                         />
//                       ) : (
//                         <div className="text-sm font-medium text-gray-900">{formula.name}</div>
//                       )}
//                     </td>

//                     {/* Protocol */}
//                     <td className="px-4 py-3 whitespace-nowrap">
//                       <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
//                         {capitalizeFirstLetter(formula.server.type)}
//                       </span>
//                     </td>

//                     {/* Expression */}
//                     <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-900">
//                       {editingFormulaId === formula.id ? (
//                         <input
//                           type="text"
//                           value={editValues.expression}
//                           onChange={(e) =>
//                             setEditValues((prev) => ({
//                               ...prev,
//                               expression: e.target.value,
//                             }))
//                           }
//                           className="border px-2 py-1 rounded text-sm w-full"
//                         />
//                       ) : (
//                         formula.expression
//                       )}
//                     </td>

//                     {/* Server */}
//                     <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-900">
//                       {formula.server.name}
//                     </td>

//                     {/* Actions */}
//                     <td className="px-4 py-3 whitespace-nowrap flex gap-2">
//                       {editingFormulaId === formula.id ? (
//                         <>
//                           <button
//                             onClick={() => saveEdit(formula)}
//                             className="text-green-600 hover:text-green-800"
//                           >
//                             <Check size={16} />
//                           </button>
//                           <button
//                             onClick={cancelEditing}
//                             className="text-gray-600 hover:text-gray-800"
//                           >
//                             <X size={16} />
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           <button
//                             onClick={() => startEditing(formula)}
//                             className="text-blue-600 hover:text-blue-800"
//                           >
//                             <Edit2 size={16} />
//                           </button>
//                           <button
//                             onClick={() => deleteFormula(formula.id)}
//                             className="text-red-600 hover:text-red-800"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

// {loading === true ? (
//   // 🔹 Skeleton Table
//   <div className="animate-pulse">
//     <table className="min-w-full border border-gray-200 rounded-lg">
//       <thead className="bg-gray-100"></thead>
//       <tbody>
//         {Array.from({ length: 5 }).map((_, i) => (
//           <tr key={i} className="hover:bg-gray-50">
//             <td className="px-4 py-2 border text-center">
//               <div className="h-4 w-4 bg-gray-300 rounded"></div>
//             </td>
//             <td className="px-4 py-2 border">
//               <div className="h-4 w-32 bg-gray-300 rounded"></div>
//             </td>
//             <td className="px-4 py-2 border">
//               <div className="h-4 w-40 bg-gray-300 rounded"></div>
//             </td>
//             <td className="px-4 py-2 border">
//               <div className="h-4 w-20 bg-gray-300 rounded"></div>
//             </td>
//             <td className="px-4 py-2 border">
//               <div className="h-4 w-20 bg-gray-300 rounded"></div>
//             </td>
//             <td className="px-4 py-2 border">
//               <div className="h-4 w-20 bg-gray-300 rounded"></div>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// ) : !loading && savedFormulas.length === 0 ? (
//   // 🔹 No Data State
//   <div className="text-center py-12">
//     <div className="text-gray-500 text-lg">
//       No custom  tags match your current filters
//     </div>
//     <button
//       onClick={clearFilters}
//       className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//     >
//       Clear Filters to Show All Custom Tags
//     </button>
//   </div>
// ) : (
//   // 🔹 Your real table will go here when data is present
//   <div></div>
// )}
//         </div>
//       </div>
//     </div>
//         )}
//       </div>
//     </div>
//   );
// };

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Edit2, Trash2, Plus, X, Filter, Search, Check } from "lucide-react";
import axios from "axios";
import { capitalizeFirstLetter } from "../BrowseTags";
import { useForm, Controller, useForm as useRowForm } from "react-hook-form";
import { useConfirm, useNotify } from "../../context/ConfirmContext";

const protocolOrder = {
  "opc ua": 1,
  modbusrtu: 2,
  modbustcp: 3,
  siemens: 4,
  slmp: 5,
};

export const FormulaConfig = () => {
  const notify = useNotify();
  const confirm = useConfirm();

  const serverInfo = JSON.parse(localStorage.getItem("Server"));
  const [loading, setLoading] = useState(false);

  const [tagsList, setTagsList] = useState([]);
  const [variables, setVariables] = useState([]);
  const [expression, setExpression] = useState("");
  const [formulaName, setFormulaName] = useState("");
  const [savedFormulas, setSavedFormulas] = useState([]);
  const [testValues, setTestValues] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [result, setResult] = useState(0);
  const inputRef = useRef(null);
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState({});

  // Create form (top)
  const {
    control,
    handleSubmit,
    formState: { errors, isValid: isCreateValid, isSubmitting: isCreateSubmitting },
    reset: resetCreate,
    setValue,        // 👈 used to sync formula on suggestion accept
    trigger,         // 👈 used if you want to force re-validate
    getValues,       // optional
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      formula: "",
    },
  });

  // Edit row form (used only for the currently edited row)
  const {
    register: registerRow,
    handleSubmit: handleSubmitRow,
    reset: resetRow,
    clearErrors: clearRowErrors,
    formState: { errors: rowErrors, isSubmitting: isRowSubmitting },
  } = useRowForm({
    mode: "onChange",
    defaultValues: {
      rowName: "",
      rowExpr: "",
    },
  });

  const [filters, setFilters] = useState({ name: "", protocol: "", serverName: "" });
  const [editingFormulaId, setEditingFormulaId] = useState(null);

  const getAllServers = async () => {
    setLoading(true);
    try {
      const responseServers = await axios.get(`${process.env.REACT_APP_API_URL}/allServers/all`);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/allServers/customTag/get`);

      setVariables(responseServers.data.servers.flatMap((s) => s.tags.map((t) => t.name)));
      setServers(responseServers.data?.servers || []);
      setSavedFormulas(response.data?.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllServers();
  }, []);

  useEffect(() => {
    setTagsList(selectedServer?.tags?.map((t) => t.name) || []);
  }, [selectedServer]);

  // ---------- Helpers ----------
  const parseFormula = (input, vars = variables) => {
    try {
      let testExpression = input;

      const sortedVariables = [...vars].sort((a, b) => b.length - a.length);
      sortedVariables.forEach((variable) => {
        const regex = new RegExp(`\\b${variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
        testExpression = testExpression.replace(regex, "1");
      });

      const validChars = /^[0-9+\-*/().\s]+$/;
      if (!validChars.test(testExpression)) {
        return { isValid: false, error: "Invalid characters in formula" };
      }

      const result = Function('"use strict"; return (' + testExpression + ")")();
      if (!Number.isFinite(result)) {
        return { isValid: false, error: "Formula evaluates to Infinity or NaN" };
      }

      return { isValid: true, expression: input };
    } catch {
      return { isValid: false, error: "Invalid formula syntax" };
    }
  };

  const getCurrentWord = (text, position) => {
    let start = position;
    while (start > 0 && /[a-zA-Z0-9_]/.test(text[start - 1])) start--;
    let end = position;
    while (end < text.length && /[a-zA-Z0-9_]/.test(text[end])) end++;
    return { word: text.substring(start, end), start, end };
  };

  const evaluateFormula = (formulaString, values) => {
    try {
      let exp = formulaString;
      const sortedVariables = [...variables].sort((a, b) => b.length - a.length);
      sortedVariables.forEach((variable) => {
        const v = values[variable] || 1;
        const regex = new RegExp(`\\b${variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
        exp = exp.replace(regex, v);
      });
    return Function('"use strict"; return (' + exp + ")")();
    } catch {
      return 0;
    }
  };

  // ---------- Create form interactions ----------
  const handleInputChange = (e) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    setExpression(value);
    setCursorPosition(position);

    const testResult = evaluateFormula(value, testValues);
    setResult(testResult);

    const { word } = getCurrentWord(value, position);
    if (word && /^[a-zA-Z]/.test(word)) {
      const matching = tagsList.filter(
        (v) => v.toLowerCase().startsWith(word.toLowerCase()) && v.toLowerCase() !== word.toLowerCase()
      );
      if (matching.length > 0) {
        setSuggestions(matching);
        setShowSuggestions(true);
        setSelectedSuggestion(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // 👉 ensure accepting a suggestion updates RHF value immediately
  const applySuggestion = (suggestion) => {
    const { start, end } = getCurrentWord(expression, cursorPosition);
    const beforeWord = expression.substring(0, start);
    const afterWord = expression.substring(end);
    const newValue = beforeWord + suggestion + afterWord;

    setExpression(newValue);                               // UI state
    setValue("formula", newValue, {                        // RHF value
      shouldValidate: true,
      shouldDirty: true,
    });
    setShowSuggestions(false);

    // optional: re-evaluate live result
    setResult(evaluateFormula(newValue, testValues));

    // keep caret right after the inserted suggestion
    setTimeout(() => {
      const newPos = start + suggestion.length;
      inputRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestion((p) => (p < suggestions.length - 1 ? p + 1 : p));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestion((p) => (p > 0 ? p - 1 : p));
    } else if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      applySuggestion(suggestions[selectedSuggestion]);     // 👈 updates RHF + state
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const clearFormula = () => {
    setExpression("");
    setResult(0);
    setShowSuggestions(false);
    resetCreate({ name: "", formula: "" });
    setFormulaName("");
  };

  const getFormulaStatus = (exp = expression) => {
    if (!exp.trim()) return { isValid: true, message: "" };
    const r = parseFormula(exp, tagsList);
    return { isValid: r.isValid, message: r.isValid ? "Valid formula" : r.error };
  };
  const formulaStatus = getFormulaStatus();

  // ---------- Create: save ----------
  const saveFormula = async (values) => {
    try {
      const newFormula = {
        name: values.name.trim(),
        type: selectedServer?.protocol,
        expression: values.formula.trim(),
        serverId: serverInfo.id,
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/allServers/customTag/save`, newFormula);
      notify.success("Custom tags updated");
      await getAllServers();

      setFormulaName("");
      setExpression("");
      resetCreate({ name: "", formula: "" });
      setShowSuggestions(false);
    } catch (e) {
      console.log(e);
      notify.error("Failed to save custom tag");
    }
  };

  // ---------- Filters ----------
  const filteredFormulas = useMemo(() => {
    return savedFormulas.filter((f) => {
      const nameMatch = f.name.toLowerCase().includes(filters.name.toLowerCase());
      const protocolMatch = !filters.protocol || f.server.type === filters.protocol;
      const serverMatch = !filters.serverName || f.server.name === filters.serverName;
      return nameMatch && protocolMatch && serverMatch;
    });
  }, [savedFormulas, filters]);

  const handleFilterChange = (k, v) => setFilters((p) => ({ ...p, [k]: v }));
  const clearFilters = () => setFilters({ name: "", protocol: "", serverName: "" });

  // ---------- Edit row ----------
  const startEditing = (formula) => {
    setEditingFormulaId(formula.id);
    clearRowErrors();
    resetRow({
      rowName: formula.name,
      rowExpr: formula.expression,
    });
  };

  const cancelEditing = () => {
    setEditingFormulaId(null);
    clearRowErrors();
    resetRow({ rowName: "", rowExpr: "" });
  };

  const validateUniqueRowName = useCallback(
    (value, currentId) => {
      const exists = savedFormulas.some(
        (f) => f.id !== currentId && (f.name || "").toLowerCase() === (value || "").toLowerCase()
      );
      return exists ? "A formula with this name already exists. Please choose a unique name." : true;
    },
    [savedFormulas]
  );

  const validateRowExpr = useCallback(
    (value) => {
      if (!value?.trim()) return "Expression is required";
      const res = parseFormula(value, variables);
      return res.isValid || res.error;
    },
    [variables]
  );

  const saveEdit = async (formula, values) => {
    try {
      const payload = { ...formula, name: values.rowName.trim(), expression: values.rowExpr.trim() };
      await axios.put(`${process.env.REACT_APP_API_URL}/allServers/customTag/update/${formula.id}`, payload);
      notify.success("Custom tag saved successfully!");
      setEditingFormulaId(null);
      await getAllServers();
    } catch (e) {
      console.log(e);
      notify.error("Failed to save custom tag");
    }
  };

  const deleteFormula = async (id) => {
    const ok = await confirm("Are you sure you want to delete this custom tag?");
    if (!ok) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/allServers/customTag/delete/${id}`);
      notify.success("Custom tag deleted successfully!");
      await getAllServers();
    } catch (e) {
      notify.error("Failed to delete custom tag");
    }
  };

  const protocols = [...new Set(savedFormulas.map((f) => f.server.type))];
  const serverNames = [...new Set(savedFormulas.map((f) => f.server.name))];

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Server selection */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <h2 className="font-semibold">Server Selection</h2>
        </div>
        <p className="text-gray-500 text-sm">Select a Server to add custom tags.</p>
        <select
          value={selectedServer?.name || selectedServer?.serverName || ""}
          onChange={(e) => {
            const selected = servers.find((s) => s.name === e.target.value || s.serverName === e.target.value);
            if (selected) {
              setSelectedServer(selected);
              localStorage.setItem("Server", JSON.stringify(selected));
            }
          }}
          className="border rounded-md p-2 w-64 focus:ring focus:ring-indigo-200"
        >
          <option value="">Select Server</option>
          {servers.map((s) => (
            <option key={s.serverId || s.id} value={s.name || s.serverName}>
              {s.name || s.serverName} -> ({capitalizeFirstLetter(s.protocol || s.type)})
            </option>
          ))}
        </select>
      </div>

      {/* Create Custom Tag */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-2">
        <div className="space-y-4-2">
          <div className="flex">
            {/* Name */}
            <div className="w-1/4 mx-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: "Name is required",
                  validate: (v) => (v?.trim()?.length ? true : "Name cannot be empty"),
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                }}
                render={({ field }) => (
                  <>
                    <input
                      type="text"
                      placeholder="new"
                      value={formulaName}
                      onChange={(e) => {
                        setFormulaName(e.target.value);
                        field.onChange(e.target.value);
                      }}
                      aria-invalid={!!errors.name || undefined}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? "border-red-400" : "border-gray-300"
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                  </>
                )}
              />
            </div>

            {/* Formula */}
            <div className="relative w-3/4 mx-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
              <Controller
                name="formula"
                control={control}
                rules={{
                  required: "Formula is required",
                  // ✅ validate against the latest RHF value, not the stale state
                  validate: (val) => {
                    const trimmed = (val || "").trim();
                    if (!trimmed) return "Formula is required";
                    const res = parseFormula(trimmed, tagsList);
                    return res.isValid || res.error;
                  },
                }}
                render={({ field }) => (
                  <>
                    <textarea
                      ref={inputRef}
                      value={expression}
                      onChange={(e) => {
                        handleInputChange(e);        // update UI + live result
                        field.onChange(e.target.value); // keep RHF in sync on typing
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter formula: TagA + 10 * 2"
                      rows={3}
                      aria-invalid={!!errors.formula || undefined}
                      className={`w-full px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                        errors.formula ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {errors.formula && <p className="mt-1 text-xs text-red-600">{String(errors.formula.message)}</p>}

                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute left-0 w-3/4 mx-6 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1">
                        {suggestions.map((s, i) => (
                          <div
                            key={s}
                            className={`px-4 py-2 cursor-pointer ${i === selectedSuggestion ? "bg-blue-100" : "hover:bg-gray-100"}`}
                            onClick={() => applySuggestion(s)}      // ✅ also updates RHF
                          >
                            <span className="font-mono">{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSubmit(saveFormula)}
              disabled={!isCreateValid || isCreateSubmitting}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isCreateSubmitting ? "Saving..." : "Save Custom Tag"}
            </button>
            <button onClick={clearFormula} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
              Clear All
            </button>
          </div>

          {/* Live result & status */}
          <div className="bg-gray-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Result:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">{result}</span>
                <span className="text-xs text-gray-500">Real-time calculation</span>
              </div>
            </div>
          </div>

          {/* Optional overall status (uses state) */}
          {expression && (
            <div className={`text-sm ${getFormulaStatus(expression).isValid ? "text-green-600" : "text-red-600"}`}>
              {getFormulaStatus(expression).message}
            </div>
          )}
        </div>
      </div>

      {/* Created Custom Tags */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-2">Created Custom Tags</h2>

        {loading ? (
          <div className="animate-pulse">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-2 border">
                        <div className="h-4 w-24 bg-gray-300 rounded" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : savedFormulas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Plus className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p>No custom tags created yet</p>
            <p className="text-sm">Create your first custom tag using the form above</p>
          </div>
        ) : (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm p-2 mb-1">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="text-gray-600" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">Formula Filters</h2>
                  <span className="text-sm text-gray-500">
                    ({filteredFormulas.length} of {savedFormulas.length} formulas shown)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search by name..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={filters.name}
                      onChange={(e) => handleFilterChange("name", e.target.value)}
                    />
                  </div>

                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.protocol}
                    onChange={(e) => handleFilterChange("protocol", e.target.value)}
                  >
                    <option value="">All Protocols</option>
                    {[...new Set(savedFormulas.map((f) => f.server.type))].map((p) => (
                      <option key={p} value={p}>
                        {capitalizeFirstLetter(p)}
                      </option>
                    ))}
                  </select>

                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.serverName}
                    onChange={(e) => handleFilterChange("serverName", e.target.value)}
                  >
                    <option value="">All Servers</option>
                    {[...new Set(savedFormulas.map((f) => f.server.name))].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Protocol</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expression</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Server</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredFormulas.map((formula, index) => {
                        const isEditing = editingFormulaId === formula.id;
                        return (
                          <tr key={formula.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors align-top`}>
                            {/* Name */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isEditing ? (
                                <div className="flex flex-col">
                                  <input
                                    type="text"
                                    className="border px-2 py-1 rounded text-sm"
                                    {...registerRow("rowName", {
                                      required: "Name is required",
                                      validate: (v) => validateUniqueRowName(v, formula.id),
                                    })}
                                  />
                                  {rowErrors.rowName && <span className="text-xs text-red-600 mt-1">{rowErrors.rowName.message}</span>}
                                </div>
                              ) : (
                                <div className="text-sm font-medium text-gray-900">{formula.name}</div>
                              )}
                            </td>

                            {/* Protocol */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {capitalizeFirstLetter(formula.server.type)}
                              </span>
                            </td>

                            {/* Expression */}
                            <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-900">
                              {isEditing ? (
                                <div className="flex flex-col">
                                  <input
                                    type="text"
                                    className="border px-2 py-1 rounded text-sm w-full"
                                    {...registerRow("rowExpr", {
                                      validate: validateRowExpr,
                                      required: "Expression is required",
                                    })}
                                  />
                                  {rowErrors.rowExpr && <span className="text-xs text-red-600 mt-1">{rowErrors.rowExpr.message}</span>}
                                </div>
                              ) : (
                                formula.expression
                              )}
                            </td>

                            {/* Server */}
                            <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-900">{formula.server.name}</td>

                            {/* Actions */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={handleSubmitRow((vals) => saveEdit(formula, vals))}
                                    className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                    disabled={isRowSubmitting}
                                    title="Save"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button onClick={cancelEditing} className="text-gray-600 hover:text-gray-800" title="Cancel">
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => startEditing(formula)} className="text-blue-600 hover:text-blue-800" title="Edit">
                                    <Edit2 size={16} />
                                  </button>
                                  <button onClick={() => deleteFormula(formula.id)} className="text-red-600 hover:text-red-800" title="Delete">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {loading ? (
                  <div className="animate-pulse">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                      <tbody>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            {Array.from({ length: 6 }).map((__, j) => (
                              <td key={j} className="px-4 py-2 border">
                                <div className="h-4 w-24 bg-gray-300 rounded" />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : !loading && savedFormulas.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">No custom tags match your current filters</div>
                    <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                      Clear Filters to Show All Custom Tags
                    </button>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
