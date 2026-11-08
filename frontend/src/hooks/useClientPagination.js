import { useState } from "react";

export default function useClientPagination(items, pageSize = 10) {
  const [pageState, setPageState] = useState({ items, page: 1 });
  const requestedPage = pageState.items === items ? pageState.page : 1;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  const setCurrentPage = (nextPage) => {
    const page = typeof nextPage === "function" ? nextPage(currentPage) : nextPage;
    setPageState({
      items,
      page: Math.min(totalPages, Math.max(1, Number(page) || 1)),
    });
  };

  return { currentPage, setCurrentPage, pageItems, pageSize, startIndex };
}