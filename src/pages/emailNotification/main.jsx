import React, { useState } from 'react';
import { Mail, Tag, ChevronDown, Plus, Trash2 } from 'lucide-react';

export const Main = () => {
  // Dummy data for available tags
  const availableTags = [
    { id: 1, name: 'Temperature', protocol: 'Sensor Data', value: '25°C' },
    { id: 2, name: 'Humidity', protocol: 'Sensor Data', value: '65%' },
    { id: 3, name: 'Pressure', protocol: 'Industrial', value: '1013 hPa' },
    { id: 4, name: 'CPU Usage', protocol: 'System Monitor', value: '45%' },
    { id: 5, name: 'Memory Usage', protocol: 'System Monitor', value: '78%' },
    { id: 6, name: 'Network Speed', protocol: 'Network', value: '100 Mbps' },
  ];

  const [selectedTags, setSelectedTags] = useState([]);
  const [emailRules, setEmailRules] = useState([{
    id: 1,
    ruleName: '',
    recipients: [''],
    subject: '',
    emailBody: '',
    triggerTag: '',
    condition: 'Greater than',
    triggerValue: '',
    frequency: 'Immediate'
  }]);

  const conditionOptions = [
    'Greater than',
    'Less than',
    'Equal to',
    'Not equal to',
    'Contains',
    'Does not contain'
  ];

  const frequencyOptions = [
    'Immediate',
    'Every 5 minutes',
    'Every 15 minutes',
    'Every 30 minutes',
    'Hourly',
    'Daily',
    'Weekly'
  ];

  const handleTagSelection = (tag) => {
    setSelectedTags(prev => {
      if (prev.find(t => t.id === tag.id)) {
        return prev.filter(t => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  const addEmailRule = () => {
    const newRule = {
      id: emailRules.length + 1,
      ruleName: '',
      recipients: [''],
      subject: '',
      emailBody: '',
      triggerTag: '',
      condition: 'Greater than',
      triggerValue: '',
      frequency: 'Immediate'
    };
    setEmailRules([...emailRules, newRule]);
  };

  const removeEmailRule = (id) => {
    setEmailRules(emailRules.filter(rule => rule.id !== id));
  };

  const updateEmailRule = (id, field, value) => {
    setEmailRules(emailRules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const addRecipient = (ruleId) => {
    setEmailRules(emailRules.map(rule => 
      rule.id === ruleId ? { ...rule, recipients: [...rule.recipients, ''] } : rule
    ));
  };

  const updateRecipient = (ruleId, index, value) => {
    setEmailRules(emailRules.map(rule => 
      rule.id === ruleId ? {
        ...rule, 
        recipients: rule.recipients.map((email, i) => i === index ? value : email)
      } : rule
    ));
  };

  const removeRecipient = (ruleId, index) => {
    setEmailRules(emailRules.map(rule => 
      rule.id === ruleId ? {
        ...rule, 
        recipients: rule.recipients.filter((_, i) => i !== index)
      } : rule
    ));
  };

  const saveEmailRules = () => {
    console.log('Saving email rules:', emailRules);
    alert('Email rules saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Select Data Tags Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Select Data Tags</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Choose which configured tags to include in your email notification. Showing {availableTags.length} of {availableTags.length} available tags.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {availableTags.map(tag => (
              <div 
                key={tag.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTags.find(t => t.id === tag.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => handleTagSelection(tag)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{tag.name}</h3>
                    <p className="text-sm text-gray-500">{tag.protocol}</p>
                    <p className="text-sm font-mono text-gray-700 mt-1">{tag.value}</p>
                  </div>
                  <div className={`w-4 h-4 rounded border-2 ${
                    selectedTags.find(t => t.id === tag.id) 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedTags.find(t => t.id === tag.id) && (
                      <div className="text-white text-xs flex items-center justify-center h-full">✓</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedTags.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Selected Tags ({selectedTags.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <span key={tag.id} className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Create Email Rules Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">Create Email Rules</h2>
            </div>
            <button
              onClick={addEmailRule}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Create automated email notifications with trigger conditions based on tag values.
          </p>

          <div className="space-y-6">
            {emailRules.map((rule, ruleIndex) => (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800">Email Rule #{rule.id}</h3>
                  {emailRules.length > 1 && (
                    <button
                      onClick={() => removeEmailRule(rule.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
                    <input
                      type="text"
                      placeholder="Enter rule name"
                      value={rule.ruleName}
                      onChange={(e) => updateEmailRule(rule.id, 'ruleName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <select
                      value={rule.frequency}
                      onChange={(e) => updateEmailRule(rule.id, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {frequencyOptions.map(freq => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                  {rule.recipients.map((email, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="email"
                        placeholder="Enter recipient email address"
                        value={email}
                        onChange={(e) => updateRecipient(rule.id, index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {rule.recipients.length > 1 && (
                        <button
                          onClick={() => removeRecipient(rule.id, index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addRecipient(rule.id)}
                    className="text-blue-500 text-sm hover:text-blue-600"
                  >
                    + Add Recipient
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="Enter email subject"
                    value={rule.subject}
                    onChange={(e) => updateEmailRule(rule.id, 'subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Body</label>
                  <textarea
                    rows={4}
                    placeholder="Write your email message here. The selected data tags and their current values will be automatically included in the email..."
                    value={rule.emailBody}
                    onChange={(e) => updateEmailRule(rule.id, 'emailBody', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Automatic Trigger Settings */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <h4 className="font-medium text-gray-800">Automatic Trigger Settings</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Tag</label>
                      <select
                        value={rule.triggerTag}
                        onChange={(e) => updateEmailRule(rule.id, 'triggerTag', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select tag to monitor</option>
                        {availableTags.map(tag => (
                          <option key={tag.id} value={tag.name}>{tag.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                      <select
                        value={rule.condition}
                        onChange={(e) => updateEmailRule(rule.id, 'condition', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {conditionOptions.map(condition => (
                          <option key={condition} value={condition}>{condition}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Value</label>
                      <input
                        type="text"
                        placeholder="Enter trigger value"
                        value={rule.triggerValue}
                        onChange={(e) => updateEmailRule(rule.id, 'triggerValue', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-3">
                    Email will be sent automatically when the selected tag value meets the specified condition.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={saveEmailRules}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Save Email Rules
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-medium text-gray-800 mb-4">Configuration Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="font-medium text-blue-800">Selected Tags</div>
              <div className="text-blue-600">{selectedTags.length} tags selected</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="font-medium text-green-800">Email Rules</div>
              <div className="text-green-600">{emailRules.length} rules configured</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="font-medium text-purple-800">Total Recipients</div>
              <div className="text-purple-600">
                {emailRules.reduce((total, rule) => total + rule.recipients.filter(email => email.trim()).length, 0)} recipients
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
