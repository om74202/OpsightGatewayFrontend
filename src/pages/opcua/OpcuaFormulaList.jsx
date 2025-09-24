
import React, { useState, useRef, useEffect,useMemo } from 'react';
import { Save, RotateCcw, Edit2, Trash2, Plus, X, Filter, Search, Check } from 'lucide-react';
import axios from 'axios';
import { capitalizeFirstLetter } from '../BrowseTags';


const protocolOrder = {
  "opc ua": 1,
  modbusrtu: 2,
  modbustcp: 3,
  siemens: 4,
  slmp: 5,
};

export const FormulaConfig = () => {
  // Mock data for demonstration - replace with your actual localStorage logic
  const serverInfo = JSON.parse(localStorage.getItem("Server"))
  const [loading,setLoading]=useState(false)
  
  const [tagsList,setTagsList]=useState([])
  const [variables, setVariables] = useState([]);
  const [expression, setExpression] = useState('');
  const [formulaName, setFormulaName] = useState('');
  const [savedFormulas, setSavedFormulas] = useState([]);
  const [testValues, setTestValues] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [result, setResult] = useState(0);
  const inputRef = useRef(null);
  const [servers,setServers]=useState([]);
  const [selectedServer,setSelectedServer]=useState({});


    const [filters, setFilters] = useState({ name: "", protocol: "", serverName: "" });
    const [count, setCount] = useState(0);
    const [editingFormulaId, setEditingFormulaId] = useState(null);
    const [editValues, setEditValues] = useState({ name: "", expression: "" });



 



  const getAllServers=async()=>{
    setLoading(true)
        try{
      const responseServers=await axios.get(`${process.env.REACT_APP_API_URL}/allServers/all`);

      const response=await axios.get(`${process.env.REACT_APP_API_URL}/allServers/customTag/get`);
      setVariables(
  responseServers.data.servers.flatMap(server => server.tags.map(tag => tag.name))
);

      setServers(responseServers.data?.servers || [])
      const c=response.data?.servers || [];
      setSavedFormulas(response.data?.data || [])
    }catch(e){
      console.log(e);
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    getAllServers();
  },[])
  useEffect(()=>{
    setTagsList(selectedServer?.tags?.map((t)=>t.name) || [])
  },[selectedServer])
  // filters






  const saveFormula = async() => {
    try{
     if (!formulaName.trim() || !expression.trim()) return;
    
    const parseResult = parseFormula(expression,tagsList);
    if (!parseResult.isValid) {
      alert(`Invalid formula: ${parseResult.error}`);
      return;
    }

    const newFormula = {
      name: formulaName,
      type:selectedServer?.protocol,
      expression: expression.trim(),
      serverId:serverInfo.id
    };
    console.log(newFormula)


      const response = await axios.post(`${process.env.REACT_APP_API_URL}/allServers/customTag/save`, newFormula);
      console.log(response.data);
    
    alert("Custom Tags Updated")
    getAllServers();

    setFormulaName('');
    setExpression('');
    setShowSuggestions(false); 
    }catch(e){
      console.log(e)
    }finally{
    }
  };


    const filteredFormulas = useMemo(() => {
    return savedFormulas.filter((formula) => {
      const nameMatch = formula.name.toLowerCase().includes(filters.name.toLowerCase());
      const protocolMatch = !filters.protocol || formula.server.type === filters.protocol;
      const serverMatch = !filters.serverName || formula.server.name === filters.serverName;
      return nameMatch && protocolMatch && serverMatch;
    });
  }, [saveFormula, filters]);


  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ name: "", protocol: "", serverName: "" });
  };

  const deleteFormula = async (id) => {
    try{
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/allServers/customTag/delete/${id}`);
      getAllServers()
    }catch(e){
      alert("Failed to delete custom tag")
    }
  };
    const startEditing = (formula) => {
    setEditingFormulaId(formula.id);
    setEditValues({ name: formula.name, expression: formula.expression });
  };


  // Parse and validate formula
const parseFormula = (input,vars=variables) => {
  try {
    console.log(variables,vars)
    let testExpression = input;
    const sortedVariables = vars.sort((a, b) => b.length - a.length);

    sortedVariables.forEach((variable) => {
      const regex = new RegExp(
        `\\b${variable.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "g"
      );
      testExpression = testExpression.replace(regex, "1");
    });

    const validChars = /^[0-9+\-*/().\s]+$/;
    if (!validChars.test(testExpression)) {
      return { isValid: false, error: "Invalid characters in formula" };
    }

    const result = Function('"use strict"; return (' + testExpression + ")")();

    // 🔍 Check for NaN / Infinity
    if (!Number.isFinite(result)) {
      return { isValid: false, error: "Formula evaluates to Infinity or NaN" };
    }

    return { isValid: true, expression: input };
  } catch (error) {
    return { isValid: false, error: "Invalid formula syntax" };
  }
};


  // Find current word being typed at cursor position
  const getCurrentWord = (text, position) => {
    let start = position;
    while (start > 0 && /[a-zA-Z0-9_]/.test(text[start - 1])) {
      start--;
    }
    
    let end = position;
    while (end < text.length && /[a-zA-Z0-9_]/.test(text[end])) {
      end++;
    }
    
    return {
      word: text.substring(start, end),
      start: start,
      end: end
    };
  };

  // Handle input change with suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    setExpression(value);
    setCursorPosition(position);
    
    // Calculate result in real-time
    const testResult = evaluateFormula(value, testValues);
    setResult(testResult);
    
    const currentWordInfo = getCurrentWord(value, position);
    const currentWord = currentWordInfo.word;
    
    if (currentWord && currentWord.length > 0 && /^[a-zA-Z]/.test(currentWord)) {
      const matchingVars = tagsList.filter(variable => 
        variable.toLowerCase().startsWith(currentWord.toLowerCase()) &&
        variable.toLowerCase() !== currentWord.toLowerCase()
      );
      
      if (matchingVars.length > 0) {
        setSuggestions(matchingVars);
        setShowSuggestions(true);
        setSelectedSuggestion(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle key down events
  const handleKeyDown = (e) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestion((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestion((prev) => prev > 0 ? prev - 1 : prev);
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        applySuggestion(suggestions[selectedSuggestion]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  // Apply selected suggestion
  const applySuggestion = (suggestion) => {
    const currentWordInfo = getCurrentWord(expression, cursorPosition);
    
    const beforeWord = expression.substring(0, currentWordInfo.start);
    const afterWord = expression.substring(currentWordInfo.end);
    
    const newValue = beforeWord + suggestion + afterWord;
    
    setExpression(newValue);
    setShowSuggestions(false);
    
    setTimeout(() => {
      const newPosition = currentWordInfo.start + suggestion.length;
      inputRef.current.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Clear formula
  const clearFormula = () => {
    setExpression('');
    setResult(0);
    setShowSuggestions(false);
  };

  // Evaluate formula with given values
  const evaluateFormula = (formulaString, values) => {
    try {
      let expression = formulaString;
      console.log(variables)
      const sortedVariables = [...variables].sort((a, b) => b.length - a.length);
      
      sortedVariables.forEach(variable => {
        const value = values[variable] || 1; // Default to 1 for demo
        const regex = new RegExp(`\\b${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        expression = expression.replace(regex, value);
      });
      
      return Function('"use strict"; return (' + expression + ')')();
    } catch (error) {
      return 0;
    }
  };


  // Cancel editing
  const cancelEditing = () => {
    setEditingFormulaId(null);
        setEditValues({ name: "", expression: "" });

  };

  // Get formula validation status
  const getFormulaStatus = (exp=expression) => {
    console.log(exp,"Testing this expression")
    if (!exp.trim()) return { isValid: true, message: '' };
    const result = parseFormula(exp);
    console.log(result,exp)
    return {
      isValid: result.isValid,
      message: result.isValid ? 'Valid formula' : result.error
    };
  };

    const saveEdit = async (formula) => {
    if (editValues.name.trim() === "" || editValues.expression.trim() === "") {
      alert("Name and Expression cannot be empty");
      return;
    }
    console.log(editValues.expression)
const status=parseFormula(editValues.expression)

if(!status.isValid){
  alert(status.error)
  return
}


    

    // check duplicate name
    const nameExists = savedFormulas.some(
      (f) => f.id !== formula.id && f.name.toLowerCase() === editValues.name.toLowerCase()
    );
    if (nameExists) {
      alert("A formula with this name already exists. Please choose a unique name.");
      return;
    }

    let api = `${process.env.REACT_APP_API_URL}/allServers/customTag/update/${formula.id}`;
    const payload = { ...formula, name: editValues.name, expression: editValues.expression };

    try {
      await axios.put(api, payload);
      setCount(count + 1);
      cancelEditing();
    } catch (e) {
      console.log(e);
    }finally{
      getAllServers()
    }
  };

  const formulaStatus = getFormulaStatus();

    const protocols = [...new Set(savedFormulas.map((f) => f.server.type))];
  const serverNames = [...new Set(savedFormulas.map((f) => f.server.name))];

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">
            <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <h2 className="font-semibold">Server Selection</h2>
        </div>
        <p className="text-gray-500 text-sm">
          Select a Server to add custom tags.
        </p>
        <select
          value={selectedServer?.name || selectedServer?.serverName || ""}
          onChange={(e) => {
            const selected = servers.find(
              (s) => s.name === e.target.value || s.serverName === e.target.value
            );
            if (selected) {
              setSelectedServer(selected);
              
              localStorage.setItem("Server",JSON.stringify(selected))
              console.log(selected)
            }
          }}
          className="border rounded-md p-2 w-64 focus:ring focus:ring-indigo-200"
        >
          <option value="">Select Server</option>
          {servers.map((server) => (
            <option key={server.serverId || server.id} value={server.name || server.serverName}>
              {server.name || server.serverName} -> ({capitalizeFirstLetter((server.protocol || server.type))})
            </option>
          ))}
        </select>

      </div>

      {/* Create Custom Tag Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-2">

        <div className="space-y-4-2">
          {/* Name Input */}
          <div className='flex '>
          <div className='w-1/4 mx-6'>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="new"
              value={formulaName}
              onChange={(e) => setFormulaName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Formula Input */}
          <div className="relative w-3/4 mx-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
            <textarea
              ref={inputRef}
              value={expression}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter formula: {TagName} + 10 * 2"
              rows={3}
              className={`w-full px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                expression && !formulaStatus.isValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute  left-0 w-3/4 mx-6 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion}
                    className={`px-4 py-2 cursor-pointer ${
                      index === selectedSuggestion ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <span className="font-mono">{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>


                    {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={saveFormula}
              disabled={!formulaName.trim() || !expression.trim() || !formulaStatus.isValid}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-md hover: disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {loading?"Saving...":"Save Custom Tag"}
            </button>
            <button
              onClick={clearFormula}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Clear All
            </button>
          </div>



          {/* Test Formula */}
          <div className="bg-gray-50 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Try: {expression || 'ServerStatus + Location1'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Result:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">{result}</span>
                <span className="text-xs text-gray-500">Real-time calculation</span>
              </div>
            </div>
          </div>

          {/* Formula Status */}
          {expression && (
            <div className={`text-sm ${formulaStatus.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {formulaStatus.message}
            </div>
          )}


        </div>
      </div>

      {/* Created Custom Tags Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-2">Created Custom Tags</h2>
        {/* <p className="text-gray-600 text-sm mb-4">
          Manage your custom tags. Showing {savedFormulas.length} custom tag(s).
        </p> */}
        
        {loading === true ? (
  // 🔹 Skeleton Table
  <div className="animate-pulse">
    <table className="min-w-full border border-gray-200 rounded-lg">
      <thead className="bg-gray-100"></thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="px-4 py-2 border text-center">
              <div className="h-4 w-4 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-32 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-40 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
):
         savedFormulas.length === 0 ? (
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
              ({filteredFormulas.length} of {saveFormula.length} formulas shown)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
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
              {protocols.map((protocol) => (
                <option key={protocol} value={protocol}>
                  {capitalizeFirstLetter(protocol)}
                </option>
              ))}
            </select>

            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.serverName}
              onChange={(e) => handleFilterChange("serverName", e.target.value)}
            >
              <option value="">All Servers</option>
              {serverNames.map((server) => (
                <option key={server} value={server}>
                  {server}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Formulas Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Protocol
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Expression
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Server ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFormulas.map((formula, index) => (
                  <tr
                    key={formula.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors`}
                  >
                    {/* Name */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {editingFormulaId === formula.id ? (
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="border px-2 py-1 rounded text-sm"
                        />
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
                      {editingFormulaId === formula.id ? (
                        <input
                          type="text"
                          value={editValues.expression}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              expression: e.target.value,
                            }))
                          }
                          className="border px-2 py-1 rounded text-sm w-full"
                        />
                      ) : (
                        formula.expression
                      )}
                    </td>

                    {/* Server */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-sm text-gray-900">
                      {formula.server.name}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                      {editingFormulaId === formula.id ? (
                        <>
                          <button
                            onClick={() => saveEdit(formula)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(formula)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteFormula(formula.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

{loading === true ? (
  // 🔹 Skeleton Table
  <div className="animate-pulse">
    <table className="min-w-full border border-gray-200 rounded-lg">
      <thead className="bg-gray-100"></thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="hover:bg-gray-50">
            <td className="px-4 py-2 border text-center">
              <div className="h-4 w-4 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-32 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-40 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </td>
            <td className="px-4 py-2 border">
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : !loading && savedFormulas.length === 0 ? (
  // 🔹 No Data State
  <div className="text-center py-12">
    <div className="text-gray-500 text-lg">
      No custom  tags match your current filters
    </div>
    <button
      onClick={clearFilters}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      Clear Filters to Show All Custom Tags
    </button>
  </div>
) : (
  // 🔹 Your real table will go here when data is present
  <div></div>
)}
        </div>
      </div>
    </div>
        )}
      </div>
    </div>
  );
};



