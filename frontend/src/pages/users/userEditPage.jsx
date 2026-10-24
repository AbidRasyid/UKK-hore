import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";

export default function UserEditPage(){
    const { user_id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async() => {
            try {
                const response = await api.get(`/api/user/${user_id}/edit`);
                setUser(response.data?.data ?? response.data);
            } catch {
                navigate('/404');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, user_id]);

    if (loading) {
        return <div className="p-8">Loading user...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
            <p className="mt-4 text-sm text-gray-600">
                {user?.name ?? user?.fullname ?? `User ${user_id}`}
            </p>
        </div>
    );
}