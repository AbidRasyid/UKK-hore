import { useCallback, useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';
import api from '../../api/axios';
import { useLanguage } from '../../hooks/useLanguage';
import { QrCode, Search } from 'lucide-react';
import QrScannerModal from '../accounts/QrScannerModal';
import CurrencyInput from 'react-currency-input-field';
import { getSafeApiMessage } from '../../utils/getSafeApiMessage';

export default function TellerDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // State untuk input pencarian dan hasil pencarian
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [shiftInfo, setShiftInfo] = useState(null);
  const [shiftLoading, setShiftLoading] = useState(true);
  const [shiftError, setShiftError] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [selectedTellerIds, setSelectedTellerIds] = useState([]);
  const [isOpeningShift, setIsOpeningShift] = useState(false);

  const applyShiftInfo = useCallback((data) => {
    setShiftInfo(data);
    if (!data?.data) {
      setSelectedTellerIds(data?.teller_id ? [String(data.teller_id)] : []);
    }
  }, []);

  const loadShift = useCallback(async () => {
    try {
      const response = await api.get("/api/teller/shift");
      applyShiftInfo(response.data);
    } catch (error) {
      console.error("Failed to load teller shift", error);
      setShiftError(getSafeApiMessage(error, "Unable to load your shift."));
    } finally {
      setShiftLoading(false);
    }
  }, [applyShiftInfo]);

  useEffect(() => {
    let isMounted = true;

    api.get("/api/teller/shift")
      .then((response) => {
        if (isMounted) applyShiftInfo(response.data);
      })
      .catch((error) => {
        console.error("Failed to load teller shift", error);
        if (isMounted) {
          setShiftError(getSafeApiMessage(error, "Unable to load your shift."));
        }
      })
      .finally(() => {
        if (isMounted) setShiftLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [applyShiftInfo]);

  const handleOpenShift = async (event) => {
    event.preventDefault();
    const balance = Number(openingBalance);
    if (!Number.isSafeInteger(balance) || balance < 0 || !shiftInfo?.teller_id) {
      setShiftError("Enter a valid opening balance.");
      return;
    }
    if (!selectedTellerIds.includes(String(shiftInfo.teller_id))) {
      setShiftError(t("shift_team_required"));
      return;
    }

    setIsOpeningShift(true);
    setShiftError("");
    try {
      await api.post("/api/teller/shift/open", {
        opening_balance: balance,
        teller_ids: selectedTellerIds.map(Number),
      });
      setOpeningBalance("");
      await loadShift();
    } catch (error) {
      console.error("Failed to open teller shift", error);
      setShiftError(getSafeApiMessage(error, "Unable to open your shift."));
    } finally {
      setIsOpeningShift(false);
    }
  };


  // 1. debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const query = searchInput.trim();
      
      if (!query) {
        setSearchResult([]);
        return;
      }

      const fetchSearchResult = async () => {
        setIsSearching(true);
        setErrorMessage("");
        try {
          const res = await api.get(`/api/customer?s=${query}`);
          setSearchResult(res.data.data || []);
        } catch (e) {
          console.error("Failed to search customer", e);
          setErrorMessage(t("failed_search_customer"));
          setSearchResult([]);
        } finally {
          setIsSearching(false);
        }
      };

      fetchSearchResult();
    }, 500); // 500ms

    // Cleanup
    return () => clearTimeout(timer);
  }, [searchInput, t]); // Jalan setiap kali searchInput berubah

  // 2. manual search button
  const handleManualSearch = () => {
    const query = searchInput.trim();
    if (!query) return;

    setIsSearching(true);
    setErrorMessage("");
    api.get(`/api/customer?s=${query}`)
      .then((res) => {
        setSearchResult(res.data.data || []);
      })
      .catch((e) => {
        console.error(e);
        setErrorMessage(t("failed_search_customer"));
        setSearchResult([]);
      })
      .finally(() => {
        setIsSearching(false);
      });
  };


  const handleQrSuccess = (scannedAccountNumber) => {
    setSearchInput(scannedAccountNumber);
    api.get(`/api/customer?s=${encodeURIComponent(scannedAccountNumber)}`)
      .then((res) => {
        const customers = res.data.data || []

        const firstCustomer = customers[0]
        if(firstCustomer) {
          navigate(`/account/${firstCustomer.id}/transactions`, {
            state: { customer: firstCustomer }
          });
        }else{
          setErrorMessage(t("no_accounts"));
        }
      }).finally(() => {
        setIsScannerOpen(false);
      })
  };

  // 3. RENDER UI
  return (
    <div className="min-h-full bg-transparent">
      {shiftLoading ? (
        <p className="mx-auto max-w-xl px-5 py-20 text-center text-sm text-gray-500">Checking shift status...</p>
      ) : shiftError && !shiftInfo ? (
        <section className="mx-auto mt-16 max-w-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p>{shiftError}</p>
          <button type="button" onClick={() => { setShiftLoading(true); setShiftError(""); loadShift(); }} className="mt-4 font-medium underline">Retry</button>
        </section>
      ) : !shiftInfo?.data ? (
        <main className="mx-auto flex min-h-[calc(100vh-4.25rem)] w-full max-w-xl flex-col justify-center px-5 py-16 sm:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Open your teller shift</h1>
          <p className="mt-2 text-sm text-gray-600">You must open a shift before processing customer transactions.</p>
          {shiftError && <p className="mt-4 bg-red-50 p-3 text-sm text-red-700">{shiftError}</p>}
          <form onSubmit={handleOpenShift} className="mt-6 space-y-4 border border-gray-200 bg-white p-6">
            <label className="block text-sm font-medium text-gray-700" htmlFor="opening-balance">Opening balance</label>
            <CurrencyInput
              id="opening-balance"
              name='opening_balance'
              placeholder='Rp 0'
              prefix='Rp '
              decimalsLimit={0}
              min="10000"
              required
              value={openingBalance}
              onValueChange={(value) => setOpeningBalance(value)}
              className="h-11 w-full border border-gray-300 px-3 text-sm outline-none focus:border-gray-600"
            />
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-gray-700">{t("shift_tellers")}</legend>
              <p className="text-xs text-gray-500">{t("select_shift_tellers")}</p>
              <div className="max-h-56 divide-y divide-gray-100 overflow-y-auto border border-gray-200">
                {(shiftInfo?.available_tellers ?? []).map((teller) => {
                  const tellerId = String(teller.id);
                  const isCurrentTeller = tellerId === String(shiftInfo?.teller_id);
                  return (
                    <label key={teller.id} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedTellerIds.includes(tellerId)}
                        disabled={isCurrentTeller}
                        onChange={(event) => {
                          setSelectedTellerIds((current) => event.target.checked
                            ? [...current, tellerId]
                            : current.filter((id) => id !== tellerId));
                        }}
                        className="h-4 w-4 accent-black"
                      />
                      <span>{teller.name}{isCurrentTeller ? ` (${t("you")})` : ""}</span>
                    </label>
                  );
                })}
                {!shiftInfo?.available_tellers?.length && (
                  <p className="px-3 py-2.5 text-sm text-gray-500">{t("no_available_tellers")}</p>
                )}
              </div>
            </fieldset>
            <button
              type="submit"
              disabled={
                isOpeningShift
                || !shiftInfo?.teller_id
                || !selectedTellerIds.includes(String(shiftInfo.teller_id))
                || !selectedTellerIds.length
              }
              className="h-11 w-full bg-black text-sm font-medium text-white disabled:opacity-60"
            >
              {isOpeningShift ? "Opening shift..." : "Open Shift"}
            </button>
          </form>
        </main>
      ) : (
      <>
      <main className="mx-auto flex min-h-[calc(100vh-4.25rem)] w-full max-w-3xl flex-col items-center px-5 py-20 sm:px-8">
        <div className="mb-8 flex w-full max-w-xl items-center justify-between border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>Shift open · Opening balance: {Number(shiftInfo.data.opening_balance).toLocaleString()}</span>
          <button type="button" onClick={() => navigate("/reports/create")} className="font-semibold underline">Close shift</button>
        </div>
        <section className="mb-8 w-full max-w-xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">{t("shift_tellers")}</h2>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            {(shiftInfo.data.tellers ?? []).map((teller) => (
              <li key={teller.id}>{teller.name}</li>
            ))}
          </ul>
        </section>
        <p className="text-center text-sm text-gray-400">
          {t("enter_account_number")}
        </p>

        <section className="mt-9 w-full max-w-xl bg-white p-6 sm:p-7">
          <div className="flex h-15 items-center border border-gray-300 bg-gray-50">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                  handleManualSearch();
                }
              }}
              placeholder="000 000"
              aria-label={t("account_number")}
              className="min-w-0 flex-1 bg-transparent px-4 text-center font-mono text-lg tracking-[0.18em] text-gray-900 outline-none placeholder:text-gray-300"
            />
            <button
              type="button"
              onClick={() => {
                setErrorMessage("");
                setIsScannerOpen(true);
              }}
              className="mr-2 inline-flex h-10 items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 transition hover:border-gray-500 hover:text-gray-900"
            >
              <QrCode className="h-4 w-4" />
              Scan QR
            </button>
          </div>
          <button
            type="button"
            onClick={handleManualSearch}
            disabled={isSearching}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 bg-black text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {isSearching ? t("searching") : t("search")}
          </button>
        </section>

        <section className="mt-6 w-full max-w-xl overflow-hidden border border-gray-300 bg-white">
          <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50 px-3 py-3">
            <h2 className="text-[11px] font-semibold uppercase text-gray-600">{t("search_result")}</h2>
            {searchResult.length > 0 && (
              <span className="bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white">
                {t("active")}
              </span>
            )}
          </div>

          {isSearching ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">{t("searching")}</p>
          ) : errorMessage ? (
            <p className="px-5 py-8 text-center text-sm text-red-600">{errorMessage}</p>
          ) : searchResult.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-500">
              {searchInput ? t("no_accounts") : t("search_account_begin")}
            </p>
          ) : (
            searchResult.map((customer) => (
              <button
                type="button"
                key={customer.id}
                onClick={() => navigate(`/account/${customer.id}/transactions`, { state: { customer } })}
                className="block w-full border-b border-gray-300 text-left transition hover:bg-gray-50 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-5 px-5 py-5">
                  <div>
                    <p className="text-[11px] text-gray-500">{t("customer_name")}</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {customer.student_name || "-"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-gray-500">{t("account_number")}</p>
                    <p className="mt-1 font-mono text-sm font-semibold tracking-wide text-gray-900">
                      {customer.account_number || "-"}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 text-right text-xs font-medium text-gray-600">
                  {t("open_transactions")}
                </div>
              </button>
            ))
          )}
        </section>
      </main>
      {isScannerOpen && (
        <QrScannerModal
          onClose={() => setIsScannerOpen(false)}
          onError={(error) => {
            console.error("QR scanner error", error);
            setErrorMessage(t("qr_scanner_error"));
          }}
          onAccountDetected={handleQrSuccess}
        />
      )}
      </>
      )}
    </div>
  );
}
