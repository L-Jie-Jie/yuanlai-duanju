type UploadItem = {
	url?: string;
	id?: string;
	key?: string;
	name?: string;
	status?: string;
};

const getNameFromUrl = (url: string) => {
	const parts = url.split("/");
	return parts[parts.length - 1] || "file";
};

export const buildUploadFileList = (value: unknown) => {
	if (!value) return value;
	if (Array.isArray(value)) {
		return value
			.map((item) => {
				if (!item) return null;
				if (typeof item === "string") {
					return {
						id: item,
						name: getNameFromUrl(item),
						status: "finished",
						url: item,
					};
				}
				if (typeof item === "object") {
					const obj = item as UploadItem;
					const url = obj.url;
					if (!url) return item;
					return {
						...obj,
						id: obj.id || obj.key || url,
						name: obj.name || getNameFromUrl(url),
						status: obj.status || "finished",
						url,
					};
				}
				return item as UploadItem;
			})
			.filter(Boolean);
	}
	if (typeof value === "string") {
		return [
			{
				id: value,
				name: getNameFromUrl(value),
				status: "finished",
				url: value,
			},
		];
	}
	if (typeof value === "object") {
		const obj = value as UploadItem;
		if (!obj.url) return value;
		return [
			{
				...obj,
				id: obj.id || obj.key || obj.url,
				name: obj.name || getNameFromUrl(obj.url),
				status: obj.status || "finished",
				url: obj.url,
			},
		];
	}
	return value;
};

export const normalizeUploadValue = (value: unknown) => {
	if (!value) return value;
	if (Array.isArray(value)) {
		return value
			.map((item) => {
				if (!item) return undefined;
				if (typeof item === "string") return item;
				if (typeof item === "object") {
					const obj = item as UploadItem;
					return obj.url || undefined;
				}
				return undefined;
			})
			.filter(Boolean);
	}
	if (typeof value === "object") {
		const obj = value as UploadItem;
		return obj.url || value;
	}
	return value;
};
