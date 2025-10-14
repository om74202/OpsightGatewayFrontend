







import React, { useEffect, useState } from 'react';
import { Mail, Tag, Search, Filter, Plus, Trash2, X, AlertCircle, Settings } from 'lucide-react';
import { useEdges } from 'reactflow';
import axios from 'axios';
import { useConfirm, useNotify } from "../../context/ConfirmContext";
import { useForm } from 'react-hook-form'; // ✅ ADDED

export const Main = () => {
  // Available variables/tags with type
  const [allVariables, setAllVariables] = useState([]);
  const notifiy=useNotify()
  const confirm=useConfirm()

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterProtocol, setFilterProtocol] = useState('All'); // this is actually serverName
  const [emailRules, setEmailRules] = useState([]);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [senderSettings, setSenderSettings] = useState({
    smtpHost:'',
    port:'',
    secure:false,
    email: '',
    apiToken: ''
  });

  // --- react-hook-form for Rule Form ---
  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      condition: 'Greater than',
      triggerValue: '',
      triggerValueMax: '',
      frequency: 'immediate',
      emails: [''],
      subject: '',
      description: ''
    }
  });

  // --- react-hook-form for Settings Modal ---
  const {
    register: registerSettings,
    handleSubmit: handleSubmitSettings,
    setError: setSettingsError,
    reset: resetSettings,
    formState: { errors: settingsErrors }
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      smtpHost: '',
      port: '',
      email: '',
      apiToken: ''
    }
  });

  const getVariables=async()=>{
    try{
      const response=await axios.get(`${process.env.REACT_APP_API_URL}/allServers/all`);
      const response2=await axios.get(`${process.env.REACT_APP_API_URL}/emailNotification/rules`);
      setEmailRules(response2.data?.rules || [])
      setSenderSettings(response2.data?.notificationConfig || {email:"",apiToken:""})

      const servers=response.data?.servers?.filter((s)=>s.Active===true)
      const variables = servers.flatMap((s) =>
        [
          ...(s.tags || []).map(tag => ({ ...tag, serverName: s.name })),
          ...(s.customTags || []).map(ct => ({ ...ct, serverName: s.name })),
        ]
      );
      setAllVariables(variables || [])
    }catch(e){
      console.log(e)
    }
  }

  useEffect(()=>{
    getVariables()
  },[])

  // When opening/setting a rule, sync the form defaults with it
  useEffect(() => {
    if (currentRule) {
      reset({
        name: currentRule.name || '',
        condition: currentRule.condition || 'Greater than',
        triggerValue: currentRule.triggerValue ?? '',
        triggerValueMax: currentRule.triggerValueMax ?? '',
        frequency: currentRule.frequency ?? 'immediate',
        emails: currentRule.emails?.length ? currentRule.emails : [''],
        subject: currentRule.subject || '',
        description: currentRule.description || ''
      });
    }
  }, [currentRule, reset]);

  // Also keep settings form in sync when the modal opens/changes
  useEffect(() => {
    resetSettings({
      smtpHost: senderSettings.smtpHost || '',
      port: senderSettings.port || '',
      email: senderSettings.email || '',
      apiToken: senderSettings.apiToken || ''
    });
  }, [senderSettings, resetSettings]);

  // Get unique server names for filter (labeled "protocol" in UI)
  const serverNames = ['All', ...new Set(allVariables.map(v => v.serverName).filter(Boolean))];

  // Filter variables — FIXED
  const filteredVariables = allVariables.filter(variable => {
    const nameStr = (variable.name || '').toLowerCase();
    const protocolStr = (variable.protocol || '').toLowerCase();
    const serverStr = (variable.serverName || '').toLowerCase();

    const matchesSearch =
      nameStr.includes(searchTerm.toLowerCase()) ||
      protocolStr.includes(searchTerm.toLowerCase()) ||
      serverStr.includes(searchTerm.toLowerCase());

    // determine Tag vs Custom Tag correctly
    const typeLabel = variable?.expression ? 'Custom Tag' : 'Tag';
    const matchesType = filterType === 'All' || typeLabel === filterType;

    // this dropdown is serverName-based
    const matchesServer = filterProtocol === 'All' || variable.serverName === filterProtocol;

    return matchesSearch && matchesType && matchesServer;
  });

  const conditionOptions = [
    { label: "Greater than", template: "x > {val}" },
    { label: "Less than", template: "x < {val}" },
    { label: "Equal to", template: "x == {val}" },
    { label: "Not equal to", template: "x != {val}" },
    { label: "Between", template: "x > {min} and x < {max}" },
    { label: "Outside range", template: "x < {min} or x > {max}" }
  ];
  function buildPythonCondition(rule,type) {
    let opt
    let triggerValue=rule.triggerValue;
    let triggerValueMax=rule.triggerValueMax;
    opt = conditionOptions.find(o => o.label === rule.condition);
    if (!opt) return "";
    let expr = opt.template;
    expr = expr.replace("{val}", triggerValue);
    expr = expr.replace("{min}", triggerValue);
    expr = expr.replace("{max}", triggerValueMax);
    expr = expr.replace(/x/g, rule.variable.name);
    return expr;
  }
  function parsePythonCondition(expr) {
    for (const opt of conditionOptions) {
      let pattern = opt.template
        .replace("x", "(?<var1>\\w+)")
        .replace("x", "(?<var2>\\w+)")
        .replace("{val}", "(?<val>[0-9.]+)")
        .replace("{min}", "(?<min>[0-9.]+)")
        .replace("{max}", "(?<max>[0-9.]+)");
      const regex = new RegExp("^" + pattern + "$");
      const match = expr?.match?.(regex);
      if (match) {
        const groups = match.groups || {};
        const varName = groups.var1 || groups.var2;
        return {
          condition: opt.label,
          variable: { name: varName },
          triggerValue: groups.val || groups.min || null,
          triggerValueMax: groups.max || null,
        };
      }
    }
  }

  const frequencyOptions = [
    { value: 0, label: 'Immediate' },
    { value: 5, label: 'Every 5 minutes' },
    { value: 15, label: 'Every 15 minutes' },
    { value: 30, label: 'Every 30 minutes' },
    { value: 60, label: 'Every 60 minutes' },
    { value: 90, label: 'Every 90 minutes' }
  ];

  const startNewRule = () => {
    const fresh = {
      name: '',
      variable: null,
      condition: 'Greater than',
      conditionExpression:'',
      triggerValue: '',
      triggerValueMax: '',
      frequency: 'immediate',
      emails: [''],
      subject: '',
      description: '',
      includeAllTags: false
    };
    setCurrentRule(fresh);
    setShowRuleForm(true);
    reset({
      name: '',
      condition: 'Greater than',
      triggerValue: '',
      triggerValueMax: '',
      frequency: 'immediate',
      emails: [''],
      subject: '',
      description: ''
    });
  };

  const editRule = (rule) => {
    const parsed= parsePythonCondition(rule.condition)
    setCurrentRule((prev)=>({
      ...rule,
      condition:parsed?.condition || rule.condition,
      triggerValue:parsed?.triggerValue || rule.triggerValue,
      triggerValueMax:parsed?.triggerValueMax || rule.triggerValueMax,
    }));
    setShowRuleForm(true);
  };

  // ===== Submit handlers using react-hook-form =====
  const onSubmitRule = async (formValues) => {
    // Ensure a variable is selected
    if (!currentRule?.variable) {
      setError('name', { type: 'manual', message: 'Select a variable from the left panel before saving.' });
      return;
    }

    // If Between/Outside require triggerValueMax
    if ((formValues.condition === 'Between' || formValues.condition === 'Outside range') && (formValues.triggerValueMax === '' || formValues.triggerValueMax === null)) {
      setError('triggerValueMax', { type: 'manual', message: 'Max value is required for this condition.' });
      return;
    }

    // Merge form values into the rule payload
    const merged = {
      ...currentRule,
      ...formValues,
      variable: currentRule.variable,
      emails: (formValues.emails || []).map(e => (e || '').trim())
    };

    let url=`${process.env.REACT_APP_API_URL}/emailNotification/rule/add`;
    const isEditing = !!(currentRule?.id && emailRules.find(r => r.id === currentRule.id));
    if (isEditing) {
      url=`${process.env.REACT_APP_API_URL}/emailNotification/rule/update/${currentRule.id}`;
    }

    try{
      const payload = { ...merged, conditionExpression: buildPythonCondition(merged) };
      const response=await axios.post(url, payload);
      notifiy.success("Rule saved successfully !")
      setShowRuleForm(false);
      getVariables();
      setCurrentRule(null);
    }catch(e){
      console.log(e)
      notifiy.error("Failed to reach server ")
    }
  };

  const deleteRule = async(id) => {
    try{
      const ok = await confirm("Are you sure you want to delete this Rule? ");
      if (!ok) return;
      const response=await axios.delete(`${process.env.REACT_APP_API_URL}/emailNotification/rule/delete/${id}`);
      if(response.data?.ok){
      notifiy.success("Rules deleted successfully !")
        getVariables();
      }else{
        notifiy.error("Failed to delete the rule.")
      }
    }catch(e){
      console.log(e);
    }
  };

  const cancelRule = () => {
    setShowRuleForm(false);
    setCurrentRule(null);
  };

  const updateCurrentRule = (field, value) => {
    setCurrentRule({ ...currentRule, [field]: value });
  };

  const addRecipient = () => {
    const next = [...(currentRule?.emails || []), ''];
    setCurrentRule(r => ({ ...r, emails: next }));
    // also update form values to keep in sync
    const formEmails = watch('emails') || [];
    reset({ ...watch(), emails: [...formEmails, ''] });
  };

  const updateRecipient = (index, value) => {
    const newRecipients = [...currentRule.emails];
    newRecipients[index] = value;
    updateCurrentRule('emails', newRecipients);
  };

  const removeRecipient = (index) => {
    const filtered = currentRule.emails.filter((_, i) => i !== index);
    updateCurrentRule('emails', filtered);
    const formEmails = (watch('emails') || []).filter((_, i) => i !== index);
    reset({ ...watch(), emails: formEmails });
  };

  const selectVariable = (variable) => {
    updateCurrentRule('variable', variable);
  };

  const updateSenderSettings = (field, value) => {
    let newValue=value;
    if(field==='port'){
      newValue=isNaN(parseInt(value))?"":parseInt(value)
    }
    setSenderSettings({ ...senderSettings, [field]: newValue });
  };

  const onSubmitSenderSettings = async (values) => {
    try{
      const payload = {
        ...senderSettings,
        ...values,
        port: isNaN(parseInt(values.port)) ? '' : parseInt(values.port, 10)
      };

      if (!payload.email || !payload.apiToken || !payload.smtpHost || payload.port === '') {
        // Should be covered by RHF, but keep a guard:
        return;
      }

      const response=await axios.put(`${process.env.REACT_APP_API_URL}/emailNotification/config/update/config-1`, payload);
      alert('Sender settings saved successfully!');
      setShowSettings(false);
    }catch(e){
      console.log(e)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Notification </h1>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            title="Email Settings"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Variables List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800 mb-4">Available Variables</h2>
              
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search variables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="space-y-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Types</option>
                  <option value="Tag">Tag</option>
                  <option value="Custom Tag">Custom Tag</option> {/* ✅ FIXED value */}
                </select>

                <select
                  value={filterProtocol}
                  onChange={(e) => setFilterProtocol(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {serverNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Showing {filteredVariables.length} of {allVariables.length} variables
              </div>
            </div>

            {/* Variables List */}
            <div className="overflow-y-auto max-h-[600px]">
              {filteredVariables.map(variable => (
                <div
                  key={variable.id}
                  onClick={() => showRuleForm && selectVariable(variable)}
                  className={`p-4 border-b border-gray-100 transition-colors ${
                    showRuleForm ? 'cursor-pointer hover:bg-blue-50' : ''
                  } ${
                    currentRule?.variable?.id === variable.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 text-sm">{variable.name}</h3>
                      <p className="text-xs text-gray-500">{variable.serverName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      !variable.expression  
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {variable.expression ? 'Custom Tag' : 'Tag'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Rules Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Rule Form */}
            {showRuleForm ? (
              <form
                onSubmit={handleSubmit(onSubmitRule)}  // ✅ use RHF submit
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {currentRule?.id && emailRules.find(r => r.id === currentRule.id) ? 'Edit' : 'Create'} Email Rule
                  </h2>
                  <button
                    type="button"
                    onClick={cancelRule}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Rule Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., High Temperature Alert"
                    {...register('name', { required: 'Rule name is required' })}
                    onChange={(e) => updateCurrentRule('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                  {!currentRule?.variable && <p className="text-xs text-amber-600 mt-1">Select a variable from the left panel.</p>}
                </div>

                {/* Selected Variable Display */}
                {currentRule?.variable ? (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-blue-800 mb-1">Monitoring Variable</div>
                        <div className="font-semibold text-gray-800">{currentRule.variable.name}</div>
                        <div className="text-sm text-gray-600">{currentRule.variable.protocol}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateCurrentRule('variable', null)}
                        className="p-1 hover:bg-blue-100 rounded"
                      >
                        <X className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Select a variable from the left panel</span>
                    </div>
                  </div>
                )}

                {/* Trigger Condition */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger Condition <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      {...register('condition', { required: true })}
                      value={watch('condition')}
                      onChange={(e) => {
                        updateCurrentRule('condition', e.target.value);
                        // if switching away from range, clear max
                        if (!(e.target.value === 'Between' || e.target.value === 'Outside range')) {
                          reset({ ...watch(), triggerValueMax: '' , condition: e.target.value });
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {conditionOptions.map(opt => (
                        <option key={opt.label} value={opt.label}>{opt.label}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Value"
                      {...register('triggerValue', {
                        required: 'Value is required',
                        validate: (v) => (v === '' || isNaN(Number(v))) ? 'Enter a number' : true
                      })}
                      onChange={(e) => updateCurrentRule('triggerValue', e.target.value)}
                      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.triggerValue ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {(watch('condition') === 'Between' || watch('condition') === 'Outside range') && (
                      <input
                        type="number"
                        placeholder="Max value"
                        {...register('triggerValueMax', {
                          required: 'Max value is required for this condition',
                          validate: (v) => {
                            if (v === '' || isNaN(Number(v))) return 'Enter a number';
                            const min = Number(watch('triggerValue'));
                            const max = Number(v);
                            if (isNaN(min)) return true; // min already has its own error
                            return max >= min || 'Max must be ≥ Min';
                          }
                        })}
                        onChange={(e) => updateCurrentRule('triggerValueMax', e.target.value)}
                        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.triggerValueMax ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                  </div>
                  {(errors.triggerValue || errors.triggerValueMax) && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.triggerValue?.message || errors.triggerValueMax?.message}
                    </p>
                  )}
                </div>

                {/* Frequency */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check Frequency</label>
                  <select
                    {...register('frequency', { required: true })}
                    value={watch('frequency')}
                    onChange={(e) => updateCurrentRule('frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {frequencyOptions.map(freq => (
                      <option key={freq.value} value={freq.value}>{freq.label}</option>
                    ))}
                  </select>
                </div>

                {/* Recipients */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                  {(currentRule?.emails || []).map((email, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="email"
                        placeholder="email@example.com"
                        defaultValue={email}
                        {...register(`emails.${index}`, {
                          required: 'Email is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Enter a valid email'
                          }
                        })}
                        onChange={(e) => updateRecipient(index, e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.emails?.[index] ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {currentRule.emails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRecipient(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {errors.emails && typeof errors.emails === 'object' && (
                    <p className="text-xs text-red-600 -mt-1 mb-2">
                      {Object.values(errors.emails)?.[0]?.message}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={addRecipient}
                    className="text-blue-500 text-sm hover:text-blue-600 font-medium"
                  >
                    + Add Recipient
                  </button>
                </div>

                {/* Subject */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                  <input
                    type="text"
                    placeholder="Alert: {variable_name} exceeded threshold"
                    {...register('subject')}
                    onChange={(e) => updateCurrentRule('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Email Body */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
                  <textarea
                    rows={4}
                    placeholder="Variable {variable_name} has reached {current_value}..."
                    {...register('description')}
                    onChange={(e) => updateCurrentRule('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Save Rule
                  </button>
                  <button
                    type="button"
                    onClick={cancelRule}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Active Rules List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Active Email Rules</h2>
                    <button
                      onClick={startNewRule}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Rule
                    </button>
                  </div>

                  {emailRules.length === 0 ? (
                    <div className="text-center py-12">
                      <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No email rules configured yet</p>
                      <button
                        onClick={startNewRule}
                        className="text-blue-500 hover:text-blue-600 font-medium"
                      >
                        Create your first rule
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {emailRules.map(rule => (
                        <div key={rule.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-800">{rule.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Monitoring: <span className="font-medium">{rule.variable?.name}</span>
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => editRule(rule)}
                                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteRule(rule.id)}
                                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Condition:</span>
                              <div className="font-medium text-gray-800">{rule.condition} {rule.triggerValue}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Frequency:</span>
                              <div className="font-medium text-gray-800">
                                {frequencyOptions.find(f => f.value === rule.frequency)?.label}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Recipients:</span>
                              <div className="font-medium text-gray-800">
                                {rule.emails.filter(e => e.trim()).length}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <div className="font-medium text-green-600">Active</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary Stats */}
                {emailRules.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-blue-600 text-2xl font-bold">{emailRules.length}</div>
                        <div className="text-blue-800 text-sm font-medium">Active Rules</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-green-600 text-2xl font-bold">
                          {new Set(emailRules.map(r => r.variable?.id)).size}
                        </div>
                        <div className="text-green-800 text-sm font-medium">Monitored Variables</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-purple-600 text-2xl font-bold">
                          {emailRules.reduce((total, rule) => total + rule.emails.filter(e => e.trim()).length, 0)}
                        </div>
                        <div className="text-purple-800 text-sm font-medium">Total Recipients</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Email Sender Settings</h2>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmitSettings(onSubmitSenderSettings)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP host <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your email SMTP host"
                      {...registerSettings('smtpHost', { required: 'SMTP host is required' })}
                      onChange={(e) => updateSenderSettings('smtpHost', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${settingsErrors.smtpHost ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {settingsErrors.smtpHost && <p className="text-xs text-red-600 mt-1">{settingsErrors.smtpHost.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP port <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your email SMTP port"
                      {...registerSettings('port', {
                        required: 'SMTP port is required',
                        validate: (v) => (!/^\d+$/.test(String(v)) ? 'Enter a valid number' : true)
                      })}
                      onChange={(e) => updateSenderSettings('port', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${settingsErrors.port ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {settingsErrors.port && <p className="text-xs text-red-600 mt-1">{settingsErrors.port.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="noreply@yourcompany.com"
                      {...registerSettings('email', {
                        required: 'Sender email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Enter a valid email'
                        }
                      })}
                      onChange={(e) => updateSenderSettings('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${settingsErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {settingsErrors.email && <p className="text-xs text-red-600 mt-1">{settingsErrors.email.message}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      This email will appear as the sender for all notifications
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Token <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your email API token"
                      {...registerSettings('apiToken', { required: 'API token is required' })}
                      onChange={(e) => updateSenderSettings('apiToken', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${settingsErrors.apiToken ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {settingsErrors.apiToken && <p className="text-xs text-red-600 mt-1">{settingsErrors.apiToken.message}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      Your API token is stored securely and used only for sending email notifications.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800">
                        Your API token is stored securely and used only for sending email notifications.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      Save Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSettings(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
