import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/utils";

export const useSearchWithDebounce = (initialValue = "", delay = 300) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  return {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    setSearchTerm,
  };
};
