import { useUser } from "@clerk/nextjs";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type LayoutProps = {
  children: ReactNode;
};

const authRequest = async (data: any) => {
  try {
    const response = await fetch("/api/hello", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const userData = await response.json();
    return userData;
  } catch (e) {
    console.log("error");
  }
};

const Layout = ({ children }: LayoutProps) => {
  const { user: clerkUser, isLoaded } = useUser();

  const [user, setUser] = useState(null);
  const [backendLoaded, setBackendLoaded] = useState(false);

  const logoutUser = () => {
    setUser(null);
    setBackendLoaded(true);
  };

  const authenticateUser = async () => {
    try {
      if (!clerkUser) throw new Error("no clerk user");
      console.log("calling api to update user");
      const userData = await authRequest({
        username: clerkUser.emailAddresses?.[0]?.emailAddress.split("@")[0],
        email: clerkUser.emailAddresses?.[0]?.emailAddress,
        firstName: clerkUser.firstName ?? "",
        lastName: clerkUser.lastName ?? "",
        clerkUID: clerkUser.id,
        avatar: clerkUser.imageUrl ?? "",
      });

      setUser(userData);
      setBackendLoaded(true);
    } catch (e: any) {
      console.error("Error authenticating user", e);
      logoutUser();
    }
  };

  useEffect(() => {
    console.log("useEffect called, isLoaded = ", isLoaded);
    if (isLoaded) authenticateUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // isLoaded is false until clerk is initialized
  // render after clerk is initialized and user is loaded

  if (!isLoaded && !backendLoaded) {
    return "loading...";
  }

  return <div>{children}</div>;
};

export default Layout;
