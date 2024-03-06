import useSWR from "swr";
import axios from "@/lib/axios";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/type/api";
import { enqueueSnackbar } from "notistack";
import { useCategoriestore } from "./category";

declare type AuthMiddleware = "auth" | "guest";

interface IUseAuth {
  middleware: AuthMiddleware;
  redirectIfAuthenticated?: string;
}

interface IApiRequest {
  setErrors: React.Dispatch<React.SetStateAction<string[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  // setStatus: React.Dispatch<React.SetStateAction<any | null>>
  [key: string]: any;
}

export const useAuth = ({ middleware, redirectIfAuthenticated }: IUseAuth) => {
  const router = useRouter();

  const {
    data: user,
    error,
    mutate,
  } = useSWR<User>("/me", () =>
    axios
      .get("/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          localStorage.setItem("user", JSON.stringify(res.data));
          return res.data;
        }
      })
      .catch((error) => {
        if (error.response.status !== 409) throw error;
      })
  );

  const register = async (args: IApiRequest) => {
    const { setErrors, ...props } = args;

    // await csrf();

    setErrors([]);

    axios
      .post("/register", props)
      .then(() => mutate())
      .catch((error) => {
        if (error.response.status !== 422) throw error;

        setErrors(error.response.data.errors);
      });
  };

  const login = async (args: IApiRequest) => {
    const { setErrors, setLoading, ...props } = args;

    // await csrf();

    setErrors([]);
    setLoading(true);
    // setStatus(null);

    axios
      .post("/login", props)
      .then((response) => {
        if (response.status === 200) {
          const token = response.data.token.token;
          localStorage.setItem("token", token);

          // get categories data created by user
          useCategoriestore.getState().fetchCategories();

          mutate();
        } else {
          setErrors(["Can't sign in. Please try again."]);
          setLoading(false);
        }
        mutate();
      })
      .catch((error) => {
        enqueueSnackbar("Failed to sign in. Invalid credentials", {
          variant: "error",
          anchorOrigin: { horizontal: "center", vertical: "bottom" },
        });

        setErrors(["Can't sign in. User is not exist."]);
        setLoading(false);
      });
  };

  const logout = async () => {
    if (!error) {
      await axios
        .get("/logout", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then(() => {
          localStorage.removeItem("token");
          mutate();
        });
    }

    window.location.pathname = "/";
  };

  useEffect(() => {
    if (middleware === "guest" && redirectIfAuthenticated && user)
      router.push(redirectIfAuthenticated);
    if (window.location.pathname === "/verify-email" && user)
      router.push(redirectIfAuthenticated || "/");
    if (middleware === "auth" && error) logout();
  }, [user, error]);

  return {
    user,
    register,
    login,
    logout,
  };
};
