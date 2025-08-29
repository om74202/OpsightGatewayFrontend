import React, { useState, useRef, useEffect } from 'react';
import { Save, RotateCcw, Edit2, Trash2, Plus, X } from 'lucide-react';
import axios from 'axios';

export const FormulaConfig = () => {
  const serverInfo = JSON.parse(localStorage.getItem("Server"));
  const tags= JSON.parse(localStorage.getItem("tags")) || [];
  const [variables, setVariables] = useState(tags.map(tag=>tag.name));
  const [expression, setExpression] = useState('');
  const [formulaName, setFormulaName] = useState('');
  const [savedFormulas, setSavedFormulas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [testValues, setTestValues] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [newVariableName, setNewVariableName] = useState('');
  const [count,setCount]=useState(0)
  const inputRef = useRef(null);

  // Add new variable
  const addVariable = () => {
    if (newVariableName.trim() && !variables.includes(newVariableName.trim())) {
      setVariables(prev => [...prev, newVariableName.trim()]);
      setNewVariableName('');
    }
  };

  // Remove variable
  const removeVariable = (variableToRemove) => {
    if (variables.length > 1) {
      setVariables(prev => prev.filter(v => v !== variableToRemove));
      // Remove from test values
      setTestValues(prev => {
        const newValues = { ...prev };
        delete newValues[variableToRemove];
        return newValues;
      });
    }
  };






    const getFormulas=async()=>{
    try{
        const response=await axios.get(`${process.env.REACT_APP_API_URL}/opcua/getFormulas`)
        const variables =response.data?.formulas || []
        setSavedFormulas(variables)
    }catch(e){
        console.log(e)
    }
  }

  useEffect(()=>{
    getFormulas()
  },[count])
  // Parse and validate formula
  const parseFormula = (input) => {
    try {
      // Replace variable names with placeholders for validation
      let testExpression = input;
      
      // Sort variables by length (longest first) to avoid partial replacements
      const sortedVariables = [...variables].sort((a, b) => b.length - a.length);
      
      sortedVariables.forEach((variable) => {
        // Use word boundaries to ensure we match complete variable names
        const regex = new RegExp(`\\b${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        testExpression = testExpression.replace(regex, '1');
      });
      
      // Basic validation - check if it's a valid mathematical expression
      // Allow numbers, operators, parentheses, decimal points, and spaces
      const validChars = /^[0-9+\-*/().\s]+$/;
      if (!validChars.test(testExpression)) {
        return { isValid: false, error: 'Invalid characters in formula' };
      }
      
      // Try to evaluate to check syntax
      Function('"use strict"; return (' + testExpression + ')')();
      return { isValid: true, expression: input };
    } catch (error) {
      return { isValid: false, error: 'Invalid formula syntax' };
    }
  };

  // Find current word being typed at cursor position
  const getCurrentWord = (text, position) => {
    // Find the start of the current word
    let start = position;
    while (start > 0 && /[a-zA-Z0-9_]/.test(text[start - 1])) {
      start--;
    }
    
    // Find the end of the current word
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
    
    // Get current word at cursor position
    const currentWordInfo = getCurrentWord(value, position);
    const currentWord = currentWordInfo.word;
    
    // Show suggestions if typing a potential variable name
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
    
    // Set cursor position after the suggestion
    setTimeout(() => {
      const newPosition = currentWordInfo.start + suggestion.length;
      inputRef.current.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Clear formula
  const clearFormula = () => {
    setExpression('');
    setShowSuggestions(false);
  };

  // Evaluate formula with given values
  const evaluateFormula = (formulaString, values) => {
    try {
      let expression = formulaString;
      
      // Sort variables by length (longest first) to avoid partial replacements
      const sortedVariables = [...variables].sort((a, b) => b.length - a.length);
      
      // Replace variables with their values
      sortedVariables.forEach(variable => {
        const value = values[variable] || 0;
        // Use word boundaries to ensure we match complete variable names
        const regex = new RegExp(`\\b${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        expression = expression.replace(regex, value);
      });
      
      return Function('"use strict"; return (' + expression + ')')();
    } catch (error) {
      return 'Error';
    }
  };

  // Save formula
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
      expression: expression.trim(),
      variables: [...variables],
      serverId:serverInfo.serverId
    };
    console.log(newFormula)

    if (editingId) {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/opcua/updateFormula/${editingId}`, newFormula);
      setEditingId(null);
    } else {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/opcua/saveFormula`, newFormula);
      console.log(response.data);
    }
    getFormulas();

    setFormulaName('');
    setExpression('');
    setShowSuggestions(false); 
    }catch(e){
      console.log(e)
    }
  };

  // Edit formula
  const editFormula = (savedFormula) => {
    setFormulaName(savedFormula.name);
    setExpression(savedFormula.expression);
    setEditingId(savedFormula.id);
    setShowSuggestions(false);
  };

  // Delete formula
// Delete
const deleteFormula = async (id) => {
  try {
    await axios.delete(`${process.env.REACT_APP_API_URL}/opcua/deleteFormula/${id}`);
    getFormulas();
  } catch (err) {
    console.error("Failed to delete formula:", err);
    alert("Error deleting formula");
  }
};

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setFormulaName('');
    setExpression('');
    setShowSuggestions(false);
  };

  // Update test values
  const updateTestValue = (variable, value) => {
    setTestValues(prev => ({
      ...prev,
      [variable]: parseFloat(value) || 0
    }));
  };

  // Get formula validation status
  const getFormulaStatus = () => {
    if (!expression.trim()) return { isValid: true, message: '' };
    const result = parseFormula(expression);
    return {
      isValid: result.isValid,
      message: result.isValid ? 'Valid formula' : result.error
    };
  };

  // Handle new variable input key press
  const handleNewVariableKeyPress = (e) => {
    if (e.key === 'Enter') {
      addVariable();
    }
  };

  const formulaStatus = getFormulaStatus();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      
      {/* Variables Management Section */}
      {/* <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        
        
        
        <div className="mb-4">
          <label className="font-medium block mb-2">Current tags:</label>
          <div className="flex flex-wrap gap-2">
            {variables.map(variable => (
              <div key={variable} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                <span>{variable}</span>
                {variables.length > 1 && (
                  <button
                    onClick={() => removeVariable(variable)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Remove variable"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          
        </div>
      </div> */}

      {/* Formula Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-4 ">        
        <div className='flex justify-between items-center'>
                  <div className="">
          <div className="flex flex-col">
            <input
            type="text"
            placeholder="Formula name"
            value={formulaName}
            onChange={(e) => setFormulaName(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
            <input
              ref={inputRef}
              type="text"
              value={expression}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Example: variable1 + price * (temp - 2) / count"
              className={`px-3 py-2  font-mono border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                expression && !formulaStatus.isValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className=" left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1">
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
          
          {/* Formula Status */}
          {expression && (
            <div className={`mt-2 text-sm ${formulaStatus.isValid ? 'text-green-600' : 'text-red-600'}`}>
              {formulaStatus.message}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2 ">
          <button
            onClick={clearFormula}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-1"
          >
            <RotateCcw size={16} /> Clear
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Cancel Edit
            </button>
          )}
                  {/* Save Button */}
        <button
          onClick={saveFormula}
          disabled={!formulaName.trim() || !expression.trim() || !formulaStatus.isValid}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Save size={16} /> {editingId ? 'Update Formula' : 'Save Formula'}
        </button>
        </div>
        </div>


      </div>



      {/* Saved Formulas Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Saved Formulas ({savedFormulas.length})</h2>
        {savedFormulas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No saved formulas yet</p>
        ) : (
          <div className="space-y-4">
            {savedFormulas.map((savedFormula) => (
              
              <div key={savedFormula.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg">{savedFormula.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editFormula(savedFormula)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteFormula(savedFormula.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md mb-2">
                  <div className="font-mono text-lg">{savedFormula.expression}</div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

