import { UserNotification } from "@/types/global";
import { notifications } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

const fetchNotifications = async () => {
  const response = await fetch("/api/fetch/notification/PollNotifications");
  const data = await response.json();

  return data;
};

const MarkAsRead = (data: any) => {
  fetch("/api/fetch/notification/RemoveNotification", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const UserNotifications = () => {

  // const { data: session, status } = useSession()
  // if(status !== 'authenticated') return <></>

  // const { data, error, isLoading } = useQuery(
  //   ["notificationData"],
  //   fetchNotifications,
  //   {
  //   //  staleTime: 65000,
  //    // refetchInterval: 65000,
  //     //refetchIntervalInBackground: true,
  //   }
  // );

  // if (isLoading || error || !data) return <></>;

  // data.forEach((element: UserNotification) => {
  //   notifications.show({
  //     id: "load-data" + element.id,
  //     loading: true,
  //     title: element.name,
  //     message: "Task has been scheduled for now",
  //     autoClose: false,
  //     withCloseButton: true,
  //     onClose(props) {
  //       const notif = data.find((e: UserNotification) => 'load-data' + e.id === props.id);
  //       if(notif)
  //       MarkAsRead(element);
  //     },
  //   })
  // });

  return (
    <>
    </>
  );
};

export default UserNotifications;
