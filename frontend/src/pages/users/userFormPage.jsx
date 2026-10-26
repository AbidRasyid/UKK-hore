import { useEffect, useState } from "react";
import api from "../../api/axios";
import { ArrowLeft, BriefcaseBusiness, Check, LockKeyhole, Mail, ShieldCheck, UserRound, Eye, EyeClosed } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function UserFormPage(){
    const { user_id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(user_id);

    const [id, setId] = useState('');
    const [isLoading, setIsLoading] = useState(isEdit);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [role, setRole] = useState('administrator');
    const [status, setStatus] = useState('active');

    useEffect(() => {
        if(!isEdit) return;

        const fetchData = async() => {
            try {
                const response = await api.get(`/api/user/${user_id}`);
                setId(response.data.user.id)
                setFullname(response.data.user.fullname)
                setPassword(response.data.user.password)
                setUsername(response.data.user.username)
                setRole(response.data.user.role)
                setStatus(response.data.user.status)
            } catch {
                navigate('/404');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate, user_id, isEdit]);

    const handleFormUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try{
            if(isEdit) {
                await api.patch(`/api/user/${id}/edit`, { 
                    username, 
                    password, 
                    fullname, 
                    role, 
                    status 
                });
            }else{
                const response = await api.post(`/api/user`, { 
                    username, 
                    password, 
                    fullname, 
                    role, 
                    status 
                });

                console.log(response)
            }
            navigate('/users')
        } catch (err) {
            console.error(err);
            if (err.response?.data?.error) {
                alert("Backend Error: " + err.response.data.error);
            } else if (err.response?.data?.message) {
                alert(err.response.data.message);
            } else {
            alert("Data gagal dikirim");
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const passwordVisibility = () => {
        setShowPassword((prev) => !prev)
    }

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="mt-8 h-9 w-64 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-gray-100" />
                <div className="mt-8 h-96 animate-pulse rounded-lg border border-gray-200 bg-white" />
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#f8f9fa]">
            <div className="border-b border-[#e5e7eb] bg-white px-6 py-3.5 lg:px-8">
                <Link
                    to="/users"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to users
                </Link>
            </div>

            <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">User management</p>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">Edit user</h1>
                        <p className="mt-1 text-sm text-gray-500">Update access details and account status.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                </header>

                <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">

                    <form className="divide-y divide-[#e5e7eb]" onSubmit={ handleFormUser }>
                        <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 lg:px-8">
                            <div className="sm:col-span-2">
                                <div className="flex items-center gap-2">
                                    <UserRound className="h-4 w-4 text-gray-500" />
                                    <h3 className="text-sm font-semibold text-gray-900">Profile details</h3>
                                </div>
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Full name</span>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    placeholder="Enter full name"
                                    className="h-11 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Username</span>
                                <div className="relative">
                                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="username"
                                        className="h-11 w-full rounded-md border border-[#d1d5db] bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                                    />
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Password</span>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="*****"
                                        className="h-11 w-full rounded-md border border-[#d1d5db] bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                                    />
                                </div>
                            </label>
                            <button type="button" onClick={passwordVisibility}><span>{showPassword ? <EyeClosed/> : <Eye/> }</span></button>
                        </div>

                        <div className="grid gap-6 px-6 py-7 sm:grid-cols-2 lg:px-8">
                            <div className="sm:col-span-2">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-gray-500" />
                                    <h3 className="text-sm font-semibold text-gray-900">Access and security</h3>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Control the staff role and whether this account can sign in.</p>
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Role</span>
                                <div className="relative">
                                    <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <select
                                        name="role"
                                        value={String(role).toLowerCase()}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="h-11 w-full appearance-none rounded-md border border-[#d1d5db] bg-white pl-9 pr-3 text-sm capitalize text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                                    >
                                        <option value="administrator">Administrator</option>
                                        <option value="supervisor">Supervisor</option>
                                        <option value="teller">Teller</option>
                                    </select>
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Account status</span>
                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <select
                                        name="status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="h-11 w-full appearance-none rounded-md border border-[#d1d5db] bg-white pl-9 pr-3 text-sm capitalize text-gray-900 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
                                    >
                                        <option value="active">Active</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </div>
                            </label>
                        </div>

                        <div className="flex flex-col-reverse gap-3 bg-[#fafafa] px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                            <div className="flex gap-3 sm:justify-end">
                                <Link
                                    to="/users"
                                    className="inline-flex h-10 items-center justify-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={ isSubmitting }
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-black px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
                                >
                                    <Check className="h-4 w-4" />
                                    { isSubmitting ? "saving . ." : isEdit ? "Save Change" : "Create user" }
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}