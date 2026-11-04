import { useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';
import api from '../../api/axios';
import { useLanguage } from '../../hooks/useLanguage';
import { QrCode, Search } from 'lucide-react';
import QrScannerModal from '../accounts/QrScannerModal';

export default function TellerDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // State untuk input pencarian dan hasil pencarian
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);


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

      <main className="mx-auto flex min-h-[calc(100vh-4.25rem)] w-full max-w-3xl flex-col items-center px-5 py-20 sm:px-8">
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
            setErrorMessage(error.message || t("qr_scanner_error"));
          }}
          onAccountDetected={handleQrSuccess}
        />
      )}
    </div>
  );
}
