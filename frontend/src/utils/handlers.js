import { executeToogleStatus } from "./toogleStatus";

export const handleBlock = async (user, setUsers, endpoint, onSuccess, onError) => {
  const isBlocked = user.status === "blocked";
  const nextStatus = isBlocked ? "active" : "blocked";
  const isSuccess = await executeToogleStatus(endpoint, user.id, nextStatus, onSuccess, onError);

  if (isSuccess) {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
  }
};
