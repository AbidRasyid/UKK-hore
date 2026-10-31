import { useOutletContext } from "react-router-dom";
import ReportPage from "./reports/reportPage";
import TellerReportPage from "./reports/tellerReportPage";

export default function Reports(){
    const { user } = useOutletContext()

    const activeRoleView = (user?.role || '').toLowerCase().trim();

    const isTeller = activeRoleView === 'teller';

    return (
        <div>
            {isTeller ? <TellerReportPage/> : <ReportPage/>}
        </div>
    )
}