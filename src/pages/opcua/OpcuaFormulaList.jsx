

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Edit2, Trash2, Plus, X, Filter, Search, Check, Info } from "lucide-react";
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

const PYTHON_RESERVED_WORDS = new Set([
  "if",
  "elif",
  "else",
  "and",
  "or",
  "not",
  "True",
  "False",
  "None",
  "time",
  "start",
  "stop",
  "in",
  "is",
  "return",
  "for",
  "while",
  "break",
  "continue",
  "pass",
  "lambda",
  "yield",
  "try",
  "except",
  "finally",
  "raise",
  "import",
  "from",
  "as",
  "with",
  "class",
  "def",
  "del",
  "global",
  "nonlocal",
  "assert",
  "async",
  "await",
]);

const PYTHON_ALLOWED_BUILTINS = new Set([
  "abs",
  "min",
  "max",
  "round",
  "int",
  "float",
    "start",
  "stop",
  "str",
  "len",
  "sum",
  "range",
  "bool",
  "pow",
  "all",
  "any",
  "math",
  "datetime",
  "time",
  "timedelta",
  "result",
]);

const FORMULA_INFO_TEXT =
  "Formulas let you derive custom values using tag names, numbers, and math operators (e.g., TagA * 1.5 + 10).";

const stripStringLiterals = (source) => {
  if (!source) return "";
  return source.replace(/(['"])((?:\\.|(?!\1)[\s\S])*)\1/g, " ");
};

const findUnknownIdentifiers = (source, allowedSet) => {
  if (!allowedSet || allowedSet.size === 0) return [];
  const sanitized = stripStringLiterals(source);
  const matches = sanitized.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) || [];
  const unknown = new Set();
  matches.forEach((name) => {
    if (PYTHON_RESERVED_WORDS.has(name) || PYTHON_ALLOWED_BUILTINS.has(name)) return;
    if (allowedSet.has(name)) return;
    unknown.add(name);
  });
  return Array.from(unknown);
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
  const [conditionSuggestions, setConditionSuggestions] = useState([]);
  const [showConditionSuggestions, setShowConditionSuggestions] = useState(false);
  const [selectedConditionSuggestion, setSelectedConditionSuggestion] = useState(0);
  const [conditionCursorPosition, setConditionCursorPosition] = useState(0);
  const [result, setResult] = useState(0);
  const inputRef = useRef(null);
  const conditionInputRef = useRef(null);
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
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      formula: "",
      condition: "",
      monitoringDuration: "",
    },
  });

  // Edit row form (used only for the currently edited row)
  const {
    register: registerRow,
    handleSubmit: handleSubmitRow,
    reset: resetRow,
    clearErrors: clearRowErrors,
    watch: watchRow,
    formState: { errors: rowErrors, isSubmitting: isRowSubmitting },
  } = useRowForm({
    mode: "onChange",
    defaultValues: {
      rowName: "",
      rowExpr: "",
      rowCond: "",
      rowDuration: "",
    },
  });

  const [filters, setFilters] = useState({ name: "", protocol: "", serverName: "" });
  const [editingFormulaId, setEditingFormulaId] = useState(null);
  const conditionValue = watch("condition", "");
  const requiresMonitoringDuration = Boolean((conditionValue || "").trim());
  const rowConditionValue = watchRow("rowCond");
  const requiresRowDuration = Boolean((rowConditionValue || "").trim());
  const rowNameValue = watchRow("rowName");
  const trimmedCreateName = useMemo(() => (formulaName || "").trim(), [formulaName]);
  const trimmedRowName = useMemo(() => (rowNameValue || "").trim(), [rowNameValue]);
  const availableTagsForCreate = useMemo(() => {
    const base = new Set(tagsList);
    if (trimmedCreateName) base.add(trimmedCreateName);
    return Array.from(base);
  }, [tagsList, trimmedCreateName]);

  const customTagSuggestions = useMemo(() => {
    const selectedId = selectedServer?.id ?? selectedServer?.serverId;
    const selectedName = selectedServer?.name ?? selectedServer?.serverName;

    const names = savedFormulas
      .filter((formula) => {
        if (!formula?.name) return false;
        const server = formula.server || {};
        const serverId = server.id ?? server.serverId ?? formula.serverId;
        const serverName = server.name ?? server.serverName;
        if (!selectedId && !selectedName) return true;
        const matchesId = selectedId != null && serverId === selectedId;
        const matchesName = Boolean(selectedName) && serverName === selectedName;
        return matchesId || matchesName;
      })
      .map((formula) => formula.name.trim())
      .filter(Boolean);

    return Array.from(new Set(names));
  }, [savedFormulas, selectedServer]);

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
    const baseTags = (selectedServer?.tags || []).map((t) => t.name).filter(Boolean);
    const merged = Array.from(new Set([...baseTags, ...customTagSuggestions]));
    setTagsList(merged);
  }, [selectedServer, customTagSuggestions]);

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

  const editingFormula = useMemo(
    () => savedFormulas.find((f) => f.id === editingFormulaId) || null,
    [savedFormulas, editingFormulaId]
  );

  const getFormulaServerIdentity = (formula) => {
    if (!formula) return { id: null, name: null };
    const server = formula.server || {};
    const id = server.id ?? server.serverId ?? formula.serverId ?? null;
    const name = server.name ?? server.serverName ?? formula.serverName ?? null;
    return { id, name };
  };

  const buildAllowedIdentifiersForCreate = useCallback(() => {
    const allowed = new Set();
    variables.forEach((tag) => {
      const trimmed = typeof tag === "string" ? tag.trim() : "";
      if (trimmed) allowed.add(trimmed);
    });
    tagsList.forEach((tag) => {
      const trimmed = typeof tag === "string" ? tag.trim() : "";
      if (trimmed) allowed.add(trimmed);
    });
    if (trimmedCreateName) {
      allowed.add(trimmedCreateName);
    }
    return allowed;
  }, [variables, tagsList, trimmedCreateName]);

  const buildAllowedIdentifiersForEdit = useCallback(() => {
    const allowed = new Set();
    variables.forEach((tag) => {
      const trimmed = typeof tag === "string" ? tag.trim() : "";
      if (trimmed) allowed.add(trimmed);
    });

    if (!editingFormula) {
      savedFormulas.forEach((formula) => {
        const trimmed = typeof formula?.name === "string" ? formula.name.trim() : "";
        if (trimmed) allowed.add(trimmed);
      });
      return allowed;
    }

    const { id: targetId, name: targetName } = getFormulaServerIdentity(editingFormula);
    savedFormulas.forEach((formula) => {
      const trimmedName = typeof formula?.name === "string" ? formula.name.trim() : "";
      if (!trimmedName) return;
      const { id, name } = getFormulaServerIdentity(formula);
      const idMatches = targetId != null && id === targetId;
      const nameMatches = targetName && name === targetName;
      if (idMatches || nameMatches) {
        allowed.add(trimmedName);
      }
    });

    if (trimmedRowName) {
      allowed.add(trimmedRowName);
    }

    return allowed;
  }, [variables, savedFormulas, editingFormula, trimmedRowName]);

  const validateConditionValue = (value, allowedSetBuilder) => {
    const raw = typeof value === "string" ? value : "";
    const trimmed = raw.trim();
    if (!trimmed) return true;

    const allowedSet = typeof allowedSetBuilder === "function" ? allowedSetBuilder() : null;
    const normalized = trimmed.replace(/\t/g, "    ").replace(/\r\n/g, "\n");
    const lines = normalized.split("\n");
    let i = 0;
    let clauseCount = 0;
    let seenElse = false;
    let baseIndent = null;
    const unknownIdentifiers = new Set();

    while (i < lines.length) {
      const currentLine = lines[i];
      if (!currentLine.trim()) {
        i++;
        continue;
      }

      const indentMatch = currentLine.match(/^\s*/);
      const indent = indentMatch ? indentMatch[0].length : 0;
      const stripped = currentLine.trim();

      const isIf = /^if\s+/.test(stripped);
      const isElif = /^elif\s+/.test(stripped);
      const isElse = /^else\b/.test(stripped);

      if (!isIf && !isElif && !isElse) {
        return "Only if/elif/else clauses are allowed";
      }

      if (seenElse && !isElse) {
        return "Else clause must be last";
      }

      if (isElse && seenElse) {
        return "Only one else clause is allowed";
      }

      if (clauseCount === 0 && !isIf) {
        return "Condition must start with an if clause";
      }

      if (baseIndent === null) {
        baseIndent = indent;
      } else if (indent !== baseIndent) {
        return "Clause indentation must be consistent";
      }

      const colonIndex = stripped.indexOf(":");
      if (colonIndex === -1) {
        return "Each clause must end with a colon";
      }

      const header = stripped.slice(0, colonIndex).trim();
      const afterColon = stripped.slice(colonIndex + 1).trim();
      const inlineBody = afterColon.length > 0;

      if (isIf || isElif) {
        const conditionText = header.replace(/^if\s+|^elif\s+/, "").trim();
        if (!conditionText) {
          return `${isIf ? "If" : "Elif"} clause must include a condition`;
        }
        if (allowedSet && allowedSet.size > 0) {
          findUnknownIdentifiers(conditionText, allowedSet).forEach((name) => unknownIdentifiers.add(name));
        }
      } else {
        if (header !== "else") {
          return "Else clause format is invalid";
        }
        seenElse = true;
      }

      clauseCount++;
      i++;

      if (inlineBody) {
        continue;
      }

      let bodyFound = false;
      while (i < lines.length) {
        const bodyLine = lines[i];
        const bodyTrim = bodyLine.trim();
        if (!bodyTrim) {
          i++;
          continue;
        }

        const bodyIndentMatch = bodyLine.match(/^\s*/);
        const bodyIndent = bodyIndentMatch ? bodyIndentMatch[0].length : 0;

        if (bodyIndent <= indent) {
          break;
        }

        bodyFound = true;
        i++;
      }

      if (!bodyFound && !inlineBody) {
        const clauseLabel = isElse ? "Else" : isElif ? "Elif" : "If";
        return `${clauseLabel} clause must contain at least one statement`;
      }
    }

    if (clauseCount === 0) {
      return "Condition must include an if clause";
    }

    if (unknownIdentifiers.size > 0) {
      return `Unknown tags referenced in condition: ${Array.from(unknownIdentifiers).join(", ")}`;
    }

    return true;
  };

  const validateCreateCondition = useCallback(
    (value) => validateConditionValue(value, buildAllowedIdentifiersForCreate),
    [buildAllowedIdentifiersForCreate]
  );

  const validateEditCondition = useCallback(
    (value) => validateConditionValue(value, buildAllowedIdentifiersForEdit),
    [buildAllowedIdentifiersForEdit]
  );

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
      const matching = availableTagsForCreate.filter(
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

  const handleConditionChange = (e, onChange) => {
    const value = e.target.value;
    const position = e.target.selectionStart;
    setConditionCursorPosition(position);
    onChange(value);

    const { word } = getCurrentWord(value, position);
    if (word && /^[a-zA-Z]/.test(word)) {
      const matching = availableTagsForCreate.filter(
        (v) => v.toLowerCase().startsWith(word.toLowerCase()) && v.toLowerCase() !== word.toLowerCase()
      );
      if (matching.length > 0) {
        setConditionSuggestions(matching);
        setShowConditionSuggestions(true);
        setSelectedConditionSuggestion(0);
      } else {
        setShowConditionSuggestions(false);
      }
    } else {
      setShowConditionSuggestions(false);
    }
  };

  const applyConditionSuggestion = (suggestion) => {
    const currentValue = (conditionInputRef.current?.value || "");
    const { start, end } = getCurrentWord(currentValue, conditionCursorPosition);
    const beforeWord = currentValue.substring(0, start);
    const afterWord = currentValue.substring(end);
    const newValue = beforeWord + suggestion + afterWord;

    const newPos = start + suggestion.length;

    setValue("condition", newValue, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setConditionCursorPosition(newPos);
    setShowConditionSuggestions(false);
    setSelectedConditionSuggestion(0);

    setTimeout(() => {
      conditionInputRef.current?.setSelectionRange(newPos, newPos);
      conditionInputRef.current?.focus();
    }, 0);
  };
   

  const handleConditionKeyDown = (e) => {
    if (!showConditionSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedConditionSuggestion((p) => (p < conditionSuggestions.length - 1 ? p + 1 : p));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedConditionSuggestion((p) => (p > 0 ? p - 1 : p));
    } else if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      applyConditionSuggestion(conditionSuggestions[selectedConditionSuggestion]);
    } else if (e.key === "Escape") {
      setShowConditionSuggestions(false);
    }
  };

  const clearFormula = () => {
    setExpression("");
    setResult(0);
    setShowSuggestions(false);
    resetCreate({ name: "", formula: "", condition: "", monitoringDuration: "" });
    setFormulaName("");
  };

  const getFormulaStatus = (exp = expression) => {
    if (!exp.trim()) return { isValid: true, message: "" };
    const r = parseFormula(exp, buildAllowedIdentifiersForCreate());
    return { isValid: r.isValid, message: r.isValid ? "Valid formula" : r.error };
  };
  const formulaStatus = getFormulaStatus();

  // ---------- Create: save ----------
  const saveFormula = async (values) => {
    try {
      const trimmedCondition = (values.condition || "").trim();
      const rawDuration = trimmedCondition ? parseInt(values.monitoringDuration, 10) : null;
      const durationSeconds = Number.isNaN(rawDuration) ? null : rawDuration;
      const newFormula = {
        name: values.name.trim(),
        type: selectedServer?.protocol,
        expression: values.formula.trim(),
        condition: trimmedCondition,
        serverId: serverInfo.id,
        monitoringDuration: durationSeconds,
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/allServers/customTag/save`, newFormula);
      notify.success("Custom tags updated");
      await getAllServers();

      setFormulaName("");
      setExpression("");
      resetCreate({ name: "", formula: "", condition: "", monitoringDuration: "" });
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
      rowCond: formula?.condition || "",
      rowDuration: formula?.monitoringDuration != null ? String(formula.monitoringDuration) : "",
    });
  };

  const cancelEditing = () => {
    setEditingFormulaId(null);
    clearRowErrors();
    resetRow({ rowName: "", rowExpr: "", rowCond: "", rowDuration: "" });
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
      const allowed = Array.from(buildAllowedIdentifiersForEdit());
      const res = parseFormula(value, allowed);
      return res.isValid || res.error;
    },
    [buildAllowedIdentifiersForEdit]
  );

  const saveEdit = async (formula, values) => {
    try {
      const trimmedCondition = (values.rowCond || "").trim();
      const rawDuration = trimmedCondition ? parseInt(values.rowDuration, 10) : null;
      const durationSeconds = Number.isNaN(rawDuration) ? null : rawDuration;
      const payload = {
        ...formula,
        name: values.rowName.trim(),
        expression: values.rowExpr.trim(),
        condition: trimmedCondition,
        monitoringDuration: durationSeconds,
      };
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
          <div className="flex  ">
            {/* Name */}
            <div className="w-full md:w-1/4 mx-1">
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
            <div className="relative w-full md:w-1/4 mx-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="inline-flex items-center gap-1">
                  <span
                    className="relative group flex items-center cursor-help"
                    tabIndex={0}
                    aria-label={FORMULA_INFO_TEXT}
                  >
                    <Info className="w-4 h-4 text-gray-500" aria-hidden="true" />
                    <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-60 -translate-x-1/2 rounded bg-gray-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                      {FORMULA_INFO_TEXT}
                    </span>
                  </span>
                  Formula
                </span>
              </label>
              <Controller
                name="formula"
                control={control}
                rules={{
                  required: "Formula is required",
                  // ✅ validate against the latest RHF value, not the stale state
                  validate: (val) => {
                    const trimmed = (val || "").trim();
                    if (!trimmed) return "Formula is required";
                    const res = parseFormula(trimmed, buildAllowedIdentifiersForCreate());
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

            <div className="relative w-full md:w-1/2 mx-1 h-full mt-4 md:mt-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <Controller
                name="condition"
                control={control}
                rules={{
                  validate: validateCreateCondition,
                }}
                render={({ field }) => (
                  <>
                    <textarea
                      name={field.name}
                      value={field.value || ""}
                      onChange={(e) => handleConditionChange(e, field.onChange)}
                      onBlur={field.onBlur}
                      onKeyDown={handleConditionKeyDown}
                      ref={(node) => {
                        field.ref(node);
                        conditionInputRef.current = node;
                      }}
                      rows={4}
                      placeholder={`if sensor_value > 50:\n    result = 1\nelse:\n    result = 0`}
                      aria-invalid={!!errors.condition || undefined}
                      className={`w-full px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                        errors.condition ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {errors.condition && <p className="mt-1 text-xs text-red-600">{String(errors.condition.message)}</p>}
                    {showConditionSuggestions && conditionSuggestions.length > 0 && (
                      <div className="absolute left-0 w-3/4 mx-6 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1">
                        {conditionSuggestions.map((s, i) => (
                          <div
                            key={s}
                            className={`px-4 py-2 cursor-pointer ${i === selectedConditionSuggestion ? "bg-blue-100" : "hover:bg-gray-100"}`}
                            onClick={() => applyConditionSuggestion(s)}
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

          {requiresMonitoringDuration && (
            <div className="w-full md:w-1/4 mx-1 mt-4 md:mt-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Monitoring Duration (s)</label>
              <Controller
                name="monitoringDuration"
                control={control}
                shouldUnregister
                rules={{
                  validate: (value) => {
                    if (!requiresMonitoringDuration) return true;
                    if (value === undefined || value === null || value === "") {
                      return "Monitoring duration is required when condition is provided";
                    }
                    const parsed = Number(value);
                    if (!Number.isInteger(parsed)) {
                      return "Monitoring duration must be a whole number";
                    }
                    if (parsed <= 0) {
                      return "Monitoring duration must be greater than 0";
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 30"
                      aria-invalid={!!errors.monitoringDuration || undefined}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.monitoringDuration ? "border-red-400 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {errors.monitoringDuration && (
                      <p className="mt-1 text-xs text-red-600">{String(errors.monitoringDuration.message)}</p>
                    )}
                  </>
                )}
              />
            </div>
          )}

          

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
              <span className="text-sm text-gray-600">Calculation with dummy values:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">{result}</span>
                <span className="text-xs text-gray-500">Sample calculation</span>
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
                    {Array.from({ length: 7 }).map((__, j) => (
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
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Protocol</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Expression</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Condition</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Monitoring Duration (s)</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Server</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredFormulas.map((formula, index) => {
                        const isEditing = editingFormulaId === formula.id;
                        return (
                          <tr key={formula.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors align-top`}>
                            {/* Name */}
                            <td className="px-2 py-3 whitespace-nowrap">
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
                            <td className="px-2 py-3 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {capitalizeFirstLetter(formula.server.type)}
                              </span>
                            </td>

                            {/* Expression */}
                            <td className="px-2 py-3 max-w-12 whitespace-nowrap font-mono text-sm text-gray-900">
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
                            {/* Condition */}
                            <td className={`px-2 py-3 max-w-16 ${isEditing ? "" : "overflow-hidden"}  whitespace-nowrap font-mono text-sm text-gray-900`}>
                              {isEditing ? (
                                <div className="flex flex-col">
                                  <input
                                    type="text"
                                    className="border px-2 py-1 rounded text-sm w-full"
                                    {...registerRow("rowCond", {
                                      validate: validateEditCondition,
                                    })}
                                  />
                                  {rowErrors.rowCond && <span className="text-xs  text-red-600 mt-1">{rowErrors.rowCond.message}</span>}
                                </div>
                              ) : (
                                formula.condition
                              )}
                            </td>
                            <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                              {isEditing ? (
                                <div className="flex flex-col items-stretch">
                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    className="border px-2 py-1 rounded text-sm"
                                    placeholder="30"
                                    {...registerRow("rowDuration", {
                                      validate: (value) => {
                                        if (!requiresRowDuration) return true;
                                        if (value === undefined || value === null || value === "") {
                                          return "Duration required when condition present";
                                        }
                                        const parsed = Number(value);
                                        if (!Number.isInteger(parsed)) {
                                          return "Duration must be a whole number";
                                        }
                                        if (parsed <= 0) {
                                          return "Duration must be greater than 0";
                                        }
                                        return true;
                                      },
                                    })}
                                  />
                                  {rowErrors.rowDuration && (
                                    <span className="text-xs text-red-600 mt-1">{rowErrors.rowDuration.message}</span>
                                  )}
                                </div>
                              ) : formula.monitoringDuration != null && formula.monitoringDuration !== undefined ? (
                                `${formula.monitoringDuration} s`
                              ) : (
                                "—"
                              )}
                            </td>

                            {/* Server */}
                            <td className="px-2 py-3 whitespace-nowrap font-mono text-sm text-gray-900">{formula.server.name}</td>

                            {/* Actions */}
                            <td className="px-2 py-3 whitespace-nowrap">
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
                            {Array.from({ length: 7 }).map((__, j) => (
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
