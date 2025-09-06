
import React, { useState, useRef, useEffect } from 'react';
import { Save, RotateCcw, Edit2, Trash2, Plus, X } from 'lucide-react';
import axios from 'axios';

export const FormulaConfig = () => {
  // Mock data for demonstration - replace with your actual localStorage logic
  const serverInfo = { serverId: 'server-1' };
  
  
  const [variables, setVariables] = useState([]);
  const [expression, setExpression] = useState('');
  const [formulaName, setFormulaName] = useState('');
  const [savedFormulas, setSavedFormulas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [totalFormulas,setTotalFormulas]=useState([]);
  const [testValues, setTestValues] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [result, setResult] = useState(0);
  const inputRef = useRef(null);
  const [servers,setServers]=useState([]);
  const [selectedServer,setSelectedServer]=useState({});



    useEffect(() => {
    setVariables(selectedServer?.tags?.map((v)=>v.name) || []);
  }, [selectedServer]);



  const getAllServers=async()=>{
        try{
      const response=await axios.get(`${process.env.REACT_APP_API_URL}/gateway/getAllServers`);
      setServers(response.data?.servers || [])
      
      setTotalFormulas(
  response.data?.formulas || []
);
    }catch(e){
      console.log(e);
    }
  }


  const getAllFormulas=async()=>{
        try{
      const response=await axios.get(`${process.env.REACT_APP_API_URL}/gateway/getAllFormulas`);      
      setTotalFormulas(response.data?.formulas || [] )
    }catch(e){
      console.log(e);
    }
  }

  useEffect(()=>{
    getAllServers();
  },[])
  useEffect(()=>{
    console.log(selectedServer)
    setSavedFormulas(
  totalFormulas.filter((f) => f.type === (selectedServer?.protocol)) || []
);

  },[selectedServer])






  const saveFormula = async() => {
    try{
     if (!formulaName.trim() || !expression.trim()) return;
    
    const parseResult = parseFormula(expression);
    if (!parseResult.isValid) {
      alert(`Invalid formula: ${parseResult.error}`);
      return;
    }

    const newFormula = {
      id: editingId || Date.now(),
      name: formulaName,
      type:selectedServer?.protocol,
      expression: expression.trim(),
      variables: [...variables],
      serverId:serverInfo.serverId
    };
    console.log(newFormula)

    if (editingId) {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/gateway/updateFormula/${editingId}`, newFormula);
      setEditingId(null);
    } else {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/gateway/saveFormula`, newFormula);
      console.log(response.data);
    }
    getAllFormulas();
    setFormulaName('');
    setExpression('');
    setShowSuggestions(false); 
    }catch(e){
      console.log(e)
    }
  };

  const deleteFormula = async (id) => {
    setSavedFormulas(prev => prev.filter(f => f.id !== id));
  };


  // Parse and validate formula
const parseFormula = (input) => {
  try {
    let testExpression = input;
    const sortedVariables = variables.sort((a, b) => b.length - a.length);

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
      const matchingVars = variables.filter(variable => 
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

  // Edit formula
  const editFormula = (savedFormula) => {
    setFormulaName(savedFormula.name);
    setExpression(savedFormula.expression);
    setEditingId(savedFormula.id);
    setShowSuggestions(false);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setFormulaName('');
    setExpression('');
    setShowSuggestions(false);
  };

  // Get formula validation status
  const getFormulaStatus = () => {
    if (!expression.trim()) return { isValid: true, message: '' };
    const result = parseFormula(expression);
    console.log(result,expression)
    return {
      isValid: result.isValid,
      message: result.isValid ? 'Valid formula' : result.error
    };
  };

  // // Insert tag into formula
  // const insertTag = (tagName) => {
  //   const cursorPos = inputRef.current?.selectionStart || expression.length;
  //   const beforeCursor = expression.substring(0, cursorPos);
  //   const afterCursor = expression.substring(cursorPos);
  //   const newExpression = beforeCursor + tagName + afterCursor;
  //   setExpression(newExpression);
    
  //   // Calculate result
  //   const testResult = evaluateFormula(newExpression, testValues);
  //   setResult(testResult);
    
  //   setTimeout(() => {
  //     inputRef.current?.focus();
  //     const newPos = cursorPos + tagName.length;
  //     inputRef.current?.setSelectionRange(newPos, newPos);
  //   }, 0);
  // };

  const formulaStatus = getFormulaStatus();

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 min-h-screen">
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
          <h2 className="font-semibold">Protocol Selection</h2>
        </div>
        <p className="text-gray-500 text-sm">
          Select a protocol to add custom tags.
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
          <option value="">Select Protocol</option>
          {servers.map((server) => (
            <option key={server.serverId || server.id} value={server.name || server.serverName}>
              {server.name || server.serverName}
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
              Save Custom Tag
            </button>
            <button
              onClick={clearFormula}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Clear All
            </button>
            {editingId && (
              <button
                onClick={cancelEdit}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
              >
                Cancel Edit
              </button>
            )}
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
        
        {savedFormulas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Plus className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p>No custom tags created yet</p>
            <p className="text-sm">Create your first custom tag using the form above</p>
          </div>
        ) : (
          <div className="">
            {savedFormulas.map((savedFormula) => (
              <div key={savedFormula.id} className="border border-gray-200 rounded-lg p-2 hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{savedFormula.name}</h3>
                      {/* <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Result: {evaluateFormula(savedFormula.expression, testValues)}
                      </span> */}
                    </div>
                    <div className="bg-gray-50 rounded-md p-2 mb-2">
                      <code className="text-sm text-gray-700 font-mono">{savedFormula.expression}</code>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {savedFormula.variables?.map((variable) => (
                        <span key={variable.name} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {variable.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => editFormula(savedFormula)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteFormula(savedFormula.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};



