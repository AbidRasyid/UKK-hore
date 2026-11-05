import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { MAJORS } from "../../utils/majors";

export default function SearchableMajorSelect({
  id,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState(value ? String(value).toUpperCase() : "");
  const [isOpen, setIsOpen] = useState(false);

  const filteredMajors = useMemo(() => {
    const search = query.trim().toLowerCase();
    return MAJORS.filter((major) => major.includes(search));
  }, [query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery(value ? String(value).toUpperCase() : "");
    }
  }, [isOpen, value]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const selectMajor = (major) => {
    onChange(major);
    setQuery(major.toUpperCase());
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={`${id}-options`}
        autoComplete="off"
        value={query}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value.toUpperCase());
          onChange("");
          setIsOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setIsOpen(false);
        }}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
      />
      {isOpen && (
        <ul
          id={`${id}-options`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filteredMajors.length ? (
            filteredMajors.map((major) => (
              <li key={major} role="option" aria-selected={value === major}>
                <button
                  type="button"
                  onClick={() => selectMajor(major)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  {major.toUpperCase()}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500">{t("no_majors_found")}</li>
          )}
        </ul>
      )}
    </div>
  );
}
