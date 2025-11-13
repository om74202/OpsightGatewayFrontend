
import React, { useEffect, useMemo, useState } from 'react';
import { Plus, X, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { useNotify } from '../../context/ConfirmContext';

export default function ShiftManager({ value, onChange,TotalShifts=[] }) {
  const [shifts, setShifts] = useState(TotalShifts);
  const notify = useNotify();

  // Form model (names arrays for tags/customTags)
  const [currentShift, setCurrentShift] = useState({
    id: '',
    name: '',
    startTime: '',
    endTime: '',
    tags: [],
    customTags: [],
  });
  const isEditing = Boolean(currentShift.id);

  // Table sources (rows: { name, serverName, serverType })
  const [availableTagsRows, setAvailableTagsRows] = useState([]);
  const [availableCustomTagsRows, setAvailableCustomTagsRows] = useState([]);

  // Selected rows (we mirror these to currentShift.* as name arrays)
  const [selectedTagRows, setSelectedTagRows] = useState([]);
  const [selectedCustomTagRows, setSelectedCustomTagRows] = useState([]);

  // Filters
  const [protocolFilterTags, setProtocolFilterTags] = useState('');
  const [protocolFilterCustom, setProtocolFilterCustom] = useState('');
  const [tagsCollapsed, setTagsCollapsed] = useState(true);
  const [customTagsCollapsed, setCustomTagsCollapsed] = useState(true);

  const [error, setError] = useState('');

  const resetShiftForm = () => {
    setCurrentShift({
      id: '',
      name: '',
      startTime: '',
      endTime: '',
      tags: [],
      customTags: [],
    });
    setSelectedTagRows([]);
    setSelectedCustomTagRows([]);
    setError('');
  };

  const toNameList = (items) =>
    (items || [])
      .map((item) => (typeof item === 'string' ? item : item?.name))
      .filter(Boolean);

  const mapNamesToRows = (names, rows) => {
    if (!names?.length) return [];
    const lookup = new Set(names);
    return rows.filter((row) => lookup.has(row.name));
  };

  // -------------------- Utilities --------------------
  const timeToMinutes = (time) => {
    const [hours, minutes] = (time || '0:0').split(':').map(Number);
    return hours * 60 + minutes;
  };

  const shiftsOverlap = (s1, s2) => {
    const start1 = timeToMinutes(s1.startTime);
    const end1 = timeToMinutes(s1.endTime);
    const start2 = timeToMinutes(s2.startTime);
    const end2 = timeToMinutes(s2.endTime);
    return start1 < end2 && end1 > start2;
  };

  // For the table: build rows from servers list
  const toRows = (servers, path) => {
    const rows = servers.flatMap((srv) =>
      (srv[path] ?? []).map((t) => ({
        name: t.name,
        serverName: srv.name || srv.serverName || 'Unknown',
        serverType: srv.protocol || srv.type || 'N/A',
      }))
    );
    // dedupe by name (first occurrence wins)
    const out = [];
    const seen = new Set();
    for (const r of rows) {
      if (!seen.has(r.name)) {
        seen.add(r.name);
        out.push(r);
      }
    }
    return out;
  };

  // -------------------- Data load --------------------
  useEffect(() => {
    onChange?.({ shifts });
  }, [shifts, onChange]);

  const getShift = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/database/getShifts`);
      setShifts(response.data?.shifts || []);

      const responseServer = await axios.get(`${process.env.REACT_APP_API_URL}/allServers/all`);
      const serverLists = responseServer.data?.servers || [];

      const tagsRows = toRows(serverLists, 'tags');
      const customRows = toRows(serverLists, 'customTags');

      setAvailableTagsRows(tagsRows);
      setAvailableCustomTagsRows(customRows);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getShift();
  }, []);

  // -------------------- Availability (custom tags) --------------------
  const isCustomTagAvailable = (tagName) => {
    if (!currentShift.startTime || !currentShift.endTime) return true;

    for (const shift of shifts) {
      // When editing, allow keeping already-assigned same name if it's on this shift
      const shiftCustomNames = (shift.customTags || []).map((x) => (typeof x === 'string' ? x : x?.name));
      if (isEditing && shift.id === currentShift.id) continue;

      if (shiftsOverlap(currentShift, shift) && shiftCustomNames.includes(tagName)) {
        return false;
      }
    }
    return true;
  };

  // -------------------- Sync rows selection -> names in currentShift --------------------
  useEffect(() => {
    setCurrentShift((prev) => ({
      ...prev,
      tags: selectedTagRows.map((r) => r.name),
      customTags: selectedCustomTagRows.map((r) => r.name),
    }));
  }, [selectedTagRows, selectedCustomTagRows]);
  // When going into edit mode, reflect the existing names to selected rows (once tables are ready)
  useEffect(() => {
    if (isEditing) {
      setSelectedTagRows(
        availableTagsRows.filter((r) => (currentShift.tags || []).includes(r.name))
      );
      setSelectedCustomTagRows(
        availableCustomTagsRows.filter((r) => (currentShift.customTags || []).includes(r.name))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, availableTagsRows.length, availableCustomTagsRows.length]);

  // -------------------- Filtering --------------------
  const filteredTagRows = useMemo(
    () =>
      availableTagsRows.filter((r) => !protocolFilterTags || r.serverType === protocolFilterTags),
    [availableTagsRows, protocolFilterTags]
  );
  const filteredCustomRows = useMemo(
    () =>
      availableCustomTagsRows.filter(
        (r) => !protocolFilterCustom || r.serverType === protocolFilterCustom
      ),
    [availableCustomTagsRows, protocolFilterCustom]
  );

  // -------------------- Toggle helpers --------------------
  const toggleRow = (row, kind /* 'tags' | 'custom' */) => {
    if (kind === 'tags') {
      setSelectedTagRows((prev) => {
        const exists = prev.some((p) => p.name === row.name);
        return exists ? prev.filter((p) => p.name !== row.name) : [...prev, row];
      });
    } else {
      const checked = selectedCustomTagRows.some((p) => p.name === row.name);
      const available = isCustomTagAvailable(row.name) || checked; // can uncheck if already checked
      if (!available) return;

      setSelectedCustomTagRows((prev) => {
        const exists = prev.some((p) => p.name === row.name);
        return exists ? prev.filter((p) => p.name !== row.name) : [...prev, row];
      });
      setError('');
    }
  };

  const selectAllFiltered = (kind, filteredRows) => {
    if (kind === 'tags') {
      const allSelected = filteredRows.every((r) => selectedTagRows.some((p) => p.name === r.name));
      setSelectedTagRows(
        allSelected
          ? selectedTagRows.filter((p) => !filteredRows.some((r) => r.name === p.name))
          : Array.from(new Set([...selectedTagRows, ...filteredRows].map((r) => r.name))).map(
              (name) => filteredRows.find((r) => r.name === name) || selectedTagRows.find((r) => r.name === name)
            )
      );
    } else {
      // Custom tags: obey availability
      const allowed = filteredRows.filter(
        (r) => isCustomTagAvailable(r.name) || selectedCustomTagRows.some((p) => p.name === r.name)
      );
      const allSelected = allowed.every((r) => selectedCustomTagRows.some((p) => p.name === r.name));
      setSelectedCustomTagRows(
        allSelected
          ? selectedCustomTagRows.filter((p) => !allowed.some((r) => r.name === p.name))
          : Array.from(new Set([...selectedCustomTagRows, ...allowed].map((r) => r.name))).map(
              (name) => allowed.find((r) => r.name === name) || selectedCustomTagRows.find((r) => r.name === name)
            )
      );
    }
  };

  // -------------------- Validation + Save --------------------
  const checkCustomTagConflict = (newShift) => {
    for (const customTag of newShift.customTags) {
      for (const existingShift of shifts) {
        if (isEditing && existingShift.id === newShift.id) continue;
        const exCustomNames = (existingShift.customTags || []).map((x) =>
          typeof x === 'string' ? x : x?.name
        );
        if (shiftsOverlap(newShift, existingShift) && exCustomNames.includes(customTag)) {
          return `Custom tag "${customTag}" is already assigned to "${existingShift.name}" which overlaps with this shift time`;
        }
      }
    }
    return null;
  };

  const handleAddOrUpdateShift = async () => {
    if (!currentShift.name || !currentShift.startTime || !currentShift.endTime) {
      setError('Please fill in all required fields');
      return;
    }
  

    const conflict = checkCustomTagConflict(currentShift);
    if (conflict) {
      setError(conflict);
      return;
    }

    try {
      if (isEditing) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/database/updateShift/${currentShift.id}`,
          currentShift
        );
        await notify.success('Shift Updated Successfully');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/database/createShift`, currentShift);
        await notify.success('Shift Added Successfully');
      }
      await getShift();
    } catch (e) {
      console.log(e);
      await notify.error('Failed to save the Shift');
    }
    resetShiftForm();
  };
  

  const handleDeleteShift = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/database/deleteShift/${id}`);
      await notify.success('Shift deleted successfully');
      await getShift();
    } catch (e) {
      console.log(e);
      await notify.error('Failed to delete Shift, Internal Server Error');
    }
  };

  const handleEditShift = (shift) => {
    const tagNames = toNameList(shift.tags);
    const customNames = toNameList(shift.customTags);
    setSelectedTagRows(mapNamesToRows(tagNames, availableTagsRows));
    setSelectedCustomTagRows(mapNamesToRows(customNames, availableCustomTagsRows));
    setError('');
    setCurrentShift({
      id: shift.id,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      tags: tagNames,
      customTags: customNames,
    });

    // Selections will be matched by the effect when rows are loaded
  };

  const handleCancelEdit = () => {
    resetShiftForm();
  };

  // -------------------- Render --------------------
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add/Edit Shift Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {isEditing ? 'Edit Shift' : 'Add New Shift'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift Name *</label>
                <input
                  type="text"
                  value={currentShift.name}
                  onChange={(e) => setCurrentShift({ ...currentShift, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Morning Shift"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={currentShift.startTime}
                    onChange={(e) => setCurrentShift({ ...currentShift, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                  <input
                    type="time"
                    value={currentShift.endTime}
                    onChange={(e) => setCurrentShift({ ...currentShift, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* TAGS TABLE */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Tags</h3>
                  <button
                    type="button"
                    onClick={() => setTagsCollapsed((prev) => !prev)}
                    className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                    aria-label={tagsCollapsed ? 'Expand tags table' : 'Collapse tags table'}
                  >
                    {tagsCollapsed ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronUp className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {!tagsCollapsed && (
                  <>
                    <div className="flex items-center gap-6 mb-3">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600"
                          checked={
                            filteredTagRows.length > 0 &&
                            filteredTagRows.every((r) =>
                              selectedTagRows.some((p) => p.name === r.name)
                            )
                          }
                          onChange={() => selectAllFiltered('tags', filteredTagRows)}
                        />
                        <span className="text-gray-700 font-medium">Select all the tags</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-medium">| Filter by Protocol:</span>
                        <select
                          value={protocolFilterTags}
                          onChange={(e) => setProtocolFilterTags(e.target.value)}
                          className="border border-gray-300 rounded-lg text-[15px] px-3 py-1"
                        >
                          <option value="">All</option>
                          {[...new Set(availableTagsRows.map((r) => r.serverType))].map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 border text-left">Select</th>
                            <th className="px-4 py-2 border text-left">Tag Name</th>
                            <th className="px-4 py-2 border text-left">Connection Name</th>
                            <th className="px-4 py-2 border text-left">Protocol</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTagRows.map((row) => {
                            const checked = selectedTagRows.some((p) => p.name === row.name);
                            return (
                              <tr key={`tag-${row.name}`} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600"
                                    checked={checked}
                                    onChange={() => toggleRow(row, 'tags')}
                                  />
                                </td>
                                <td className="px-4 py-2 border">{row.name}</td>
                                <td className="px-4 py-2 border">{row.serverName}</td>
                                <td className="px-4 py-2 border">{row.serverType}</td>
                              </tr>
                            );
                          })}
                          {filteredTagRows.length === 0 && (
                            <tr>
                              <td className="px-4 py-3 border text-sm text-gray-500" colSpan={4}>
                                No tags match your filter
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* CUSTOM TAGS TABLE */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Custom Tags</h3>
                  <button
                    type="button"
                    onClick={() => setCustomTagsCollapsed((prev) => !prev)}
                    className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                    aria-label={customTagsCollapsed ? 'Expand custom tags table' : 'Collapse custom tags table'}
                  >
                    {customTagsCollapsed ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronUp className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {!customTagsCollapsed && (
                  <>
                    <div className="flex items-center gap-6 mb-3">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600"
                          checked={
                            filteredCustomRows.length > 0 &&
                            filteredCustomRows.every((r) =>
                              selectedCustomTagRows.some((p) => p.name === r.name)
                            )
                          }
                          onChange={() => selectAllFiltered('custom', filteredCustomRows)}
                        />
                        <span className="text-gray-700 font-medium">
                          Select all the custom tags
                        </span>
                      </label>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-medium">| Filter by Protocol:</span>
                        <select
                          value={protocolFilterCustom}
                          onChange={(e) => setProtocolFilterCustom(e.target.value)}
                          className="border border-gray-300 rounded-lg text-[15px] px-3 py-1"
                        >
                          <option value="">All</option>
                          {[...new Set(availableCustomTagsRows.map((r) => r.serverType))].map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 border text-left">Select</th>
                            <th className="px-4 py-2 border text-left">Custom Tag</th>
                            <th className="px-4 py-2 border text-left">Connection Name</th>
                            <th className="px-4 py-2 border text-left">Protocol</th>
                            <th className="px-4 py-2 border text-left">Availability</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCustomRows.map((row) => {
                            const checked = selectedCustomTagRows.some((p) => p.name === row.name);
                            const available = isCustomTagAvailable(row.name) || checked;
                            return (
                              <tr key={`ctag-${row.name}`} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600"
                                    checked={checked}
                                    disabled={!available}
                                    onChange={() => available && toggleRow(row, 'custom')}
                                  />
                                </td>
                                <td className="px-4 py-2 border">{row.name}</td>
                                <td className="px-4 py-2 border">{row.serverName}</td>
                                <td className="px-4 py-2 border">{row.serverType}</td>
                                <td className="px-4 py-2 border">
                                  {available ? (
                                    <span className="text-green-700">Available</span>
                                  ) : (
                                    <span className="text-gray-400">
                                      In use in overlapping shift
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {filteredCustomRows.length === 0 && (
                            <tr>
                              <td className="px-4 py-3 border text-sm text-gray-500" colSpan={5}>
                                No custom tags match your filter
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Actions */}
              {isEditing ? (
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleAddOrUpdateShift}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Update Shift
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddOrUpdateShift}
                  className="w-full mt-2 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Shift
                </button>
              )}
            </div>
          </div>

          {/* Shifts List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Scheduled Shifts ({shifts.length})
            </h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {shifts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No shifts added yet</p>
              ) : (
                shifts.map((shift) => {
                  const tagNames = (shift.tags || []).map((x) => (typeof x === 'string' ? x : x?.name));
                  const customNames = (shift.customTags || []).map((x) =>
                    typeof x === 'string' ? x : x?.name
                  );
                  return (
                    <div
                      key={shift.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{shift.name}</h3>
                          <p className="text-sm text-gray-600">
                            {shift.startTime} - {shift.endTime}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditShift(shift)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteShift(shift.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Display Tags and Custom Tags */}
                      {/* {tagNames.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">Tags:</p>
                          <div className="flex flex-wrap gap-1">
                            {tagNames.map((n) => (
                              <span
                                key={n}
                                className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {customNames.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Custom Tags:</p>
                          <div className="flex flex-wrap gap-1">
                            {customNames.map((n) => (
                              <span
                                key={n}
                                className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        </div>
                      )} */}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
