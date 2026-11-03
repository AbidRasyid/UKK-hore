import { executeToogleStatus } from "./toogleStatus";

export const handleBlock = async (user, setUsers, endpoint) => {
  const isBlocked = user.status === "blocked";
  const nextStatus = isBlocked ? "active" : "blocked";
  const isSuccess = await executeToogleStatus(endpoint, user.id, nextStatus);

  if (isSuccess) {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
  }
};

