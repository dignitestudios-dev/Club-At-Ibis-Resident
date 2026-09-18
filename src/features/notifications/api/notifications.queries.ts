import { useQuery } from "@tanstack/react-query";
import { getNotificationsForResident } from "./notifications.service";

export function useNotificationsQuery(residentId: string | undefined) {
  return useQuery({
    queryKey: ["notifications", residentId],
    queryFn: () => getNotificationsForResident(residentId as string),
    enabled: !!residentId,
  });
}
