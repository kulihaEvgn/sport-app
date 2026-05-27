type ApiFetchOptions = RequestInit & {
  initData?: string;
};

export async function apiFetch(path: string, options: ApiFetchOptions = {}) {
  const { initData, headers, ...rest } = options;

  if (!initData) {
    throw new Error("initData is required for API requests");
  }

  const response = await fetch(path, {
    ...rest,
    headers: {
      ...headers,
      Authorization: `tma ${initData}`,
    },
  });

  return response;
}
