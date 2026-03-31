import axios from "axios";
import { Play, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { applyScaling } from "../../functions/tags";
import { useConfirm, useNotify } from "../../context/ConfirmContext";

const DATA_TYPE_OPTIONS = [
  { label: "Integer", value: "integer", prefix: "N7:", placeholder: "0" },
  { label: "Float", value: "float", prefix: "F8:", placeholder: "0" },
  { label: "Boolean", value: "boolean", prefix: "B3:", placeholder: "0/0" },
  { label: "Input", value: "input", prefix: "I:", placeholder: "0/0" },
  { label: "Output", value: "output", prefix: "O:", placeholder: "0/0" },
  {
    label: "Timer",
    value: "timer",
    prefix: "T4:",
    placeholder: "0",
    fields: [
      { label: "ACC", value: "ACC" },
      { label: "PRE", value: "PRE" },
      { label: "EN", value: "EN" },
      { label: "TT", value: "TT" },
      { label: "DN", value: "DN" },
    ],
  },
  {
    label: "Counter",
    value: "counter",
    prefix: "C5:",
    placeholder: "0",
    fields: [
      { label: "ACC", value: "ACC" },
      { label: "PRE", value: "PRE" },
      { label: "CU", value: "CU" },
      { label: "DN", value: "DN" },
    ],
  },
  { label: "Status", value: "status", prefix: "S:", placeholder: "1/0" },
];

const getOptionByValue = (value) =>
  DATA_TYPE_OPTIONS.find((option) => option.value === value) || DATA_TYPE_OPTIONS[0];

const buildBaseAddress = (typeValue, index) => {
  const option = getOptionByValue(typeValue);
  return `${option.prefix}${String(index || "").trim()}`;
};

const buildDisplayAddress = (typeValue, index, field) => {
  const baseAddress = buildBaseAddress(typeValue, index);
  return field ? `${baseAddress}.${field}` : baseAddress;
};

const resolveValueFromResponse = (responseData, request) => {
  if (!responseData || typeof responseData !== "object") return undefined;

  const bucket = responseData?.[request.dataType];
  if (!bucket || typeof bucket !== "object") return undefined;

  if (request.field) {
    const nested = bucket?.[request.baseAddress];
    if (nested && typeof nested === "object" && request.field in nested) {
      return nested[request.field];
    }
    return bucket?.[request.displayAddress];
  }

  return bucket?.[request.baseAddress];
};

export const EthernetIPBrowseTags = ({ selectedServer }) => {
  const notify = useNotify();
  const confirm = useConfirm();
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState([]);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      requests: [{ dataType: "integer", index: "", field: "" }],
    },
    mode: "onSubmit",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requests",
  });

  const watchedRequests = watch("requests");

  useEffect(() => {
    setTags([]);
    reset({
      requests: [{ dataType: "integer", index: "", field: "" }],
    });
  }, [selectedServer?.id, selectedServer?.serverId, reset]);

  const updateTagProperties = (address, updatedFields) => {
    setTags((prevTags) =>
      prevTags.map((tag) =>
        tag.address === address ? { ...tag, ...updatedFields } : tag
      )
    );
  };

  const bulkUpdateTagStatus = (nextStatus) => {
    setTags((prevTags) =>
      prevTags.map((tag) =>
        tag.status === nextStatus ? tag : { ...tag, status: nextStatus }
      )
    );
  };

  const allTagsSelected = tags.length > 0 && tags.every((tag) => tag.status === "pass");
  const noTagsSelected = tags.length > 0 && tags.every((tag) => tag.status !== "pass");

  const normalizedRequests = useMemo(
    () =>
      (watchedRequests || []).map((request) => {
        const option = getOptionByValue(request?.dataType);
        const requiresField = Boolean(option.fields?.length);
        const baseAddress = buildBaseAddress(request?.dataType, request?.index);
        const field = requiresField ? request?.field : "";

        return {
          dataType: request?.dataType,
          index: String(request?.index || "").trim(),
          field,
          baseAddress,
          displayAddress: buildDisplayAddress(request?.dataType, request?.index, field),
        };
      }),
    [watchedRequests]
  );

  const browseTags = async () => {
    const sanitizedRequests = normalizedRequests.filter((request) => request.index);

    if (!sanitizedRequests.length) {
      notify.error("Add at least one datatype and index pair");
      return;
    }

    const missingTimerField = sanitizedRequests.some((request) => {
      const option = getOptionByValue(request.dataType);
      return option.fields?.length && !request.field;
    });

    if (missingTimerField) {
      notify.error("Please select a field for timer or counter rows");
      return;
    }

    const ok = await confirm(
      "Browsing will temporarily stop any ongoing data logging. Do you want to continue?"
    );
    if (!ok) return;

    setIsLoading(true);
    try {
      const payload = {
        serverInfo: {
          id: selectedServer?.serverId || selectedServer?.id,
          name: selectedServer?.name || selectedServer?.serverName,
          ip: selectedServer?.data?.ip,
          protocol: selectedServer?.type || selectedServer?.protocol,
        },
        requests: sanitizedRequests.map((request) => ({
          dataType: request.dataType,
          index: request.index,
          field: request.field || undefined,
          baseAddress: request.baseAddress,
          address: request.displayAddress,
        })),
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/ethernet-ip/browseTags`,
        payload
      );

      const responseData = response?.data?.result || response?.data?.data || response?.data;
      const nextTags = sanitizedRequests
        .map((request) => {
          const value = resolveValueFromResponse(responseData, request);
          if (value === undefined) return null;

          return {
            serverId: selectedServer?.serverId || selectedServer?.id,
            name: request.displayAddress,
            address: request.displayAddress,
            scaling: "",
            status: "fail",
            value,
          };
        })
        .filter(Boolean);

      setTags(nextTags);

      if (!nextTags.length) {
        notify.error("No matching EtherNet/IP tags were returned");
        return;
      }

      notify.success("EtherNet/IP tags loaded successfully");
    } catch (e) {
      console.error(e);
      notify.error("Failed to browse EtherNet/IP tags");
    } finally {
      setIsLoading(false);
    }
  };

  const saveTags = async () => {
    try {
      const selectedTags = tags
        .filter((tag) => tag.status === "pass")
        .map((tag) => ({
          name: tag.name,
          scaling: tag.scaling,
          address: tag.address,
          serverId: tag.serverId,
        }));

      if (!selectedTags.length) {
        notify.error("Select at least one tag to save");
        return;
      }

      const hasEmptyName = selectedTags.some((tag) => !String(tag.name || "").trim());
      if (hasEmptyName) {
        notify.error("Please provide a name for all selected tags");
        return;
      }

      await axios.post(`${process.env.REACT_APP_API_URL}/allServers/tags/add`, {
        tags: selectedTags,
      });
      notify.success("Tags saved successfully");
    } catch (e) {
      console.error(e);
      notify.error("Failed to save tags, make sure selected tag names are unique");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Browse EtherNet/IP Tags</h2>
            <p className="text-sm text-gray-500">
              Choose a data type and index. Timer and counter reads also require a field.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit(browseTags)}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              <Play className="h-4 w-4" />
              Browse Tags
            </button>
            <button
              onClick={saveTags}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
              Save Tags
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Browse Requests</h3>
              <p className="text-sm text-gray-500">
                Example: `Integer` + index `1` becomes `N7:1`
              </p>
            </div>
            <button
              type="button"
              onClick={() => append({ dataType: "integer", index: "", field: "" })}
              className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Add Row
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((fieldItem, index) => {
              const selectedType = watchedRequests?.[index]?.dataType || "integer";
              const option = getOptionByValue(selectedType);
              const previewAddress = buildDisplayAddress(
                selectedType,
                watchedRequests?.[index]?.index,
                watchedRequests?.[index]?.field
              );

              return (
                <div
                  key={fieldItem.id}
                  className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 lg:grid-cols-12"
                >
                  <div className="lg:col-span-3">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Data Type<span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register(`requests.${index}.dataType`, {
                        required: "Data type is required",
                      })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      {DATA_TYPE_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-3">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Index<span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`requests.${index}.index`, {
                        required: "Index is required",
                      })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder={option.placeholder}
                    />
                    {errors?.requests?.[index]?.index && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.requests[index].index.message}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-3">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Field{option.fields?.length ? <span className="text-red-500">*</span> : null}
                    </label>
                    {option.fields?.length ? (
                      <select
                        {...register(`requests.${index}.field`, {
                          required: "Field is required for this data type",
                        })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="">Select Field</option>
                        {option.fields.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value="Not required"
                        disabled
                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400"
                      />
                    )}
                    {errors?.requests?.[index]?.field && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.requests[index].field.message}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                    <input
                      value={previewAddress}
                      disabled
                      className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-500"
                    />
                  </div>

                  <div className="flex items-end lg:col-span-1">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="w-full rounded-md border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="mx-auto h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">Tag Data</h3>
            <div className="flex gap-4 text-sm text-gray-600">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allTagsSelected}
                  onChange={() =>
                    allTagsSelected ? bulkUpdateTagStatus("fail") : bulkUpdateTagStatus("pass")
                  }
                />
                Select All
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={noTagsSelected}
                  onChange={() =>
                    noTagsSelected ? bulkUpdateTagStatus("pass") : bulkUpdateTagStatus("fail")
                  }
                />
                Deselect All
              </label>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              Browsing EtherNet/IP tags...
            </div>
          ) : tags.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Check
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Scaling
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tags.map((tag) => (
                    <tr key={tag.address} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={tag.status === "pass"}
                          onChange={(e) =>
                            updateTagProperties(tag.address, {
                              status: e.target.checked ? "pass" : "fail",
                            })
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={tag.name}
                          onChange={(e) =>
                            updateTagProperties(tag.address, { name: e.target.value })
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">{tag.address}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={tag.scaling}
                          onChange={(e) =>
                            updateTagProperties(tag.address, { scaling: e.target.value })
                          }
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        {String(applyScaling(tag.scaling || "", tag.value))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-md border-2 border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              No tags available. Click `Browse Tags` to load EtherNet/IP values.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
