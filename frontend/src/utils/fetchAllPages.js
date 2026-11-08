export async function fetchAllPages(api, endpoint, params = {}, pageSize = 100) {
  const rows = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await api.get(endpoint, {
      params: { ...params, page, per_page: pageSize },
    });
    const data = response.data;
    if (!Array.isArray(data?.data) || !Number.isInteger(data?.current_page)) {
      throw new Error("Invalid paginated response.");
    }

    rows.push(...data.data);
    lastPage = Math.max(1, Number(data.last_page) || 1);
    page += 1;
  } while (page <= lastPage);

  return rows;
}