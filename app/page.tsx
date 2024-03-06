"use client";

import { useAuth } from "@/hooks/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import { SnackbarProvider } from "notistack";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

interface FormData {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [errorData, setErrorData] = useState([""]);

  const { login } = useAuth({
    middleware: "guest",
    redirectIfAuthenticated: "/dashboard",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmitHandler = async (values: FormData) => {
    try {
      login({
        email: values.email,
        password: values.password,
        setErrors: setErrorData,
        setLoading,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="bg-base-100">
      <div className="container mx-auto">
        <div className="h-screen flex justify-center items-center">
          <div className="card w-96 bg-neutral text-neutral-content">
            <div className="card-body items-center text-center">
              <Image
                src="/images/icons/icon-128x128.png"
                alt="logo"
                width={50}
                height={50}
              ></Image>
              <h2 className="card-title">Now ToDo</h2>
              <p className="mb-5">Sign in to organize your list</p>

              <form onSubmit={handleSubmit(onSubmitHandler)}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <label className="input input-bordered flex items-center gap-2 mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="w-4 h-4 opacity-70"
                      >
                        <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                        <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                      </svg>

                      <input
                        type="text"
                        className={`grow ${errors.email ? "input-error" : ""}`}
                        placeholder="Email"
                        {...field}
                      />
                    </label>
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <label className="input input-bordered flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="w-4 h-4 opacity-70"
                      >
                        <path
                          fillRule="evenodd"
                          d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <input
                        type="password"
                        className={`grow ${
                          errors.password ? "input-error" : ""
                        }`}
                        placeholder="Password"
                        {...field}
                      />
                    </label>
                  )}
                />

                <div className="w-full mt-3">
                  <button
                    className="btn btn-block btn-primary"
                    disabled={loading ? true : false}
                  >
                    {loading && (
                      <span className="loading loading-spinner"></span>
                    )}
                    {loading ? "Signing you in..." : "Sign In"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <SnackbarProvider maxSnack={1}></SnackbarProvider>
    </div>
  );
}
