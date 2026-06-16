import axios from "axios";

const sanitizeFileSafeValue = (value = "") =>
  String(value)
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") || "template";

const normalizeProtocolKey = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildEdgeConnectionTemplatePayload = (server) => ({
  templateType: "edge-connection",
  templateName: `${sanitizeFileSafeValue(server?.name)}-template`,
  protocol: server?.type || "unknown",
  connection: {
    id: server?.id,
    name: server?.name,
    type: server?.type,
    frequency: server?.frequency,
    Active: server?.Active,
    data: server?.data || {},
  },
  tags: Array.isArray(server?.tags) ? server.tags : [],
  customTags: Array.isArray(server?.customTags) ? server.customTags : [],
  exportedAt: new Date().toISOString(),
});

export const exportEdgeConnectionTemplate = async (server, notify) => {
  try {
    const payload = buildEdgeConnectionTemplatePayload(server);
    const templateName = payload.templateName || "edge-connection-template";
    const fileName = `${templateName}.json`;
    const templateBlob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const downloadUrl = window.URL.createObjectURL(templateBlob);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);

    notify.success("Template downloaded");
  } catch (error) {
    console.error(error);
    notify.error("Failed to download template");
  }
};

export const importEdgeConnectionTemplate = async ({ expectedProtocol, notify, onSuccess }) => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json,application/json";

  fileInput.onchange = async (event) => {
    try {
      const file = event.target?.files?.[0];
      if (!file) {
        return;
      }

      const rawText = await file.text();
      const payload = JSON.parse(rawText);
      const templateProtocol = payload?.protocol || payload?.connection?.type;

      if (payload?.templateType !== "edge-connection") {
        notify.error("Invalid edge connection template");
        return;
      }

      if (
        expectedProtocol &&
        normalizeProtocolKey(templateProtocol) !== normalizeProtocolKey(expectedProtocol)
      ) {
        notify.error(`This template is for ${templateProtocol || "another protocol"}`);
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/allServers/template/import`,
        payload,
      );

      if (response.status === 201 || response.data?.status === "success") {
        notify.success("Template imported successfully");
        await onSuccess?.(response.data);
        return;
      }

      notify.error(response.data?.error || "Failed to import template");
    } catch (error) {
      console.error(error);
      notify.error(error?.response?.data?.error || "Failed to import template");
    }
  };

  fileInput.click();
};
