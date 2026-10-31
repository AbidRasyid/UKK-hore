import { useOutletContext } from "react-router-dom";
import TellerCustomerPage from "./customers/tellerCustomerPage";
import CustomerPage from "./customers/customerPage";

export default function Customers(){
    const { user } = useOutletContext();

    const activeRoleView = (user?.role || '').toLowerCase().trim()

    const isTeller = activeRoleView === 'teller';

    return(
        <div>
            { isTeller ? <TellerCustomerPage /> : <CustomerPage/> }
        </div>
    )
}