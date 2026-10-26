import { Pen, Ban, LockOpen } from "lucide-react";
import {  Link } from "react-router-dom";
import api from "../../api/axios";


export default function UserRow({user= {}, index = 0}){
        const isBlocked = user.status === "blocked";

        const onBlock = async(user_id) => {
            const nextStatus = isBlocked ? "active" : "blocked";
            const actionText = isBlocked ? "buka blokir" : "blokir";
            if (!confirm(`apakah anda yakin ingin ${actionText} orang ini?`)) return;
            try{
                await api.patch(`/api/user/${user_id}/edit`, {"status": nextStatus})

                alert(`user berhasil di-${isBlocked ? 'unblock' : 'block'}`)
                window.location.reload();
            }catch (error) {
                console.error("gagal memblokir user", error)
            }
        }
    return(
        <tr className="border-t border-gray-200">
            <td className="px-6 py-4 text-sm text-gray-900">{ index + 1 }</td>
            <td className="px-6 py-4 text-sm text-gray-900">{ user.fullname  }</td>
            <td className="px-6 py-4 text-sm text-gray-900">{ user.role }</td>
            <td className="px-6 py-4 text-sm text-gray-900">{ user.status }</td>
            <td className="px-6 py-4 text-sm text-gray-900 flex gap-2">
                <Link to={`/user/${user.id}/edit`}><span><Pen size={16}/></span></Link>
                <button onClick={() => { onBlock(user.id) }}> <span> {isBlocked ? <LockOpen size={ 16 }/> : <Ban size={ 16 }/> }</span></button>
            </td>
        </tr>
    )
}