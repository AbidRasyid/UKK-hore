import { Pen, Ban, LockOpen } from "lucide-react";
import {  Link } from "react-router-dom";


export default function UserRow({user= {}, index = 0, onBlock}){
        const isBlocked = user.status === "blocked";

    return(
        <tr className="border-t border-gray-200">
            <td className="px-6 py-4 text-sm text-gray-900">{ index + 1 }</td>
            <td className="px-6 py-4 text-sm text-gray-900">{ user.fullname  }</td>
            <td className="px-6 py-4 text-sm text-gray-900">{ user.role }</td>
            <td className="px-6 py-4 text-sm text-gray-900">{ user.status }</td>
            <td className="px-6 py-4 text-sm text-gray-900 flex gap-2">
                <Link to={`/user/${user.id}/edit`}><span><Pen size={16}/></span></Link>
                <button onClick={() => onBlock(user)}> <span> {isBlocked ? <LockOpen size={ 16 }/> : <Ban size={ 16 }/> }</span></button>
            </td>
        </tr>
    )
}