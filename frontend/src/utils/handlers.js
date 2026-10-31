import { executeToogleStatus } from "./toogleStatus";

export const handleBlock = async(user, setUsers, endpoint) => {
    const isBlocked = user.status === 'blocked'
    const nextStatus = isBlocked ? "active" : "blocked";
    const actionText = isBlocked ? "buka blokir" : "blokir";    
    const isSuccess = await executeToogleStatus(endpoint, user.id, nextStatus, actionText)

    if (isSuccess){
      setUsers(prev => prev.map(u => u.id === user.id ? {...u, status: nextStatus} : u))
    }
}

