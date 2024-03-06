"use client";
import TodoListCheckbox from "../components/shared/Checkbox";
import TodoCard from "../components/shared/TodoCard";
import { SnackbarProvider } from "notistack";
import { useEffect, useState } from "react";
import { useCategoriestore } from "@/hooks/category";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "../components/shared/Navbar";
import AddCategoryModal from "../components/shared/AddCategoryModal";
import axios from "@/lib/axios";
import useSWR from "swr";
import { Category, ListData } from "@/type/api";

export default function Dashboard() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);

  const {
    data: categories,
    error,
    isLoading,
  } = useSWR<ListData<Category>>(
    "/categories",
    () =>
      axios
        .get("/categories", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => err),
    {
      fallbackData: {
        data: [],
        meta: {
          total: 0,
        },
      },
    }
  );

  const [todoCounts, setTodoCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (categories && categories.data) {
      const fetchTodoCounts = async () => {
        const counts: { [key: string]: number } = {};

        for (const category of categories.data) {
          try {
            const todoListResponse = await axios.get(
              "/todos?filter=" +
                JSON.stringify([
                  { field: "category_id", value: category.id, operator: "=" },
                ]),
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            counts[category.id] = todoListResponse.data.meta.total;
          } catch (error) {
            console.error(
              `Error fetching todos for category ${category.id}`,
              error
            );
            counts[category.id] = 0; // Set count to 0 if there's an error
          }
        }

        // Compare the new counts with the previous state before updating
        if (JSON.stringify(counts) !== JSON.stringify(todoCounts)) {
          setTodoCounts(counts);
        }
      };

      fetchTodoCounts();
    }
  }, [categories?.data]);

  if (error)
    return (
      <div className="bg-base-100 text-center">
        <p>Failed to load. Please refresh the page.</p>
      </div>
    );
  if (isLoading)
    return (
      <div className="bg-base-100 text-center">
        <span className="loading loading-spinner loading-lg text-primary mt-10"></span>
      </div>
    );

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleGotoCategory = (category: Category) => {
    router.push(`/dashboard/todos/category/${category.id}`);
  };

  return (
    <div className="bg-base-100">
      <Navbar
        categories={categories?.data || []}
        onOpenAddCategoryModal={() => handleOpenModal()}
      ></Navbar>
      <div className="container mx-auto px-6">
        {categories && categories.data.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8 mt-6">
            {categories.data.map((category) => (
              <div
                key={category.id}
                className="cursor-pointer"
                onClick={() => handleGotoCategory(category)}
              >
                <div className="indicator w-full">
                  <div className="indicator-item indicator-top">
                    {todoCounts[category.id] ? (
                      <span className="indicator-item badge badge-accent">
                        {todoCounts[category.id] || 0}
                      </span>
                    ) : null}
                  </div>
                  <div className="card w-full bg-primary shadow-xl">
                    <div className="card-body text-center">
                      <h2 className="card-title">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                          />
                        </svg>
                        {category.name}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-1 gap-4 mt-20">
            <div className="flex justify-center">
              <Image
                src="/images/empty.svg"
                alt="Empty Category"
                width={250}
                height={191}
              ></Image>
            </div>
            <div className="flex flex-col justify-center items-center text-center mt-6 px-20">
              <p className="my-4">
                Ups, you dont have category, click the button below to create.
              </p>
              <button
                className="btn btn-primary max-w-60"
                onClick={() => handleOpenModal()}
              >
                Add Category
              </button>
            </div>
          </div>
        )}
      </div>

      <AddCategoryModal
        open={openModal}
        currentTotalCategory={categories ? categories.data.length : 0}
        onOpenModal={() => handleOpenModal}
        onCloseModal={() => setOpenModal(false)}
      ></AddCategoryModal>

      <SnackbarProvider maxSnack={1} autoHideDuration={2000}></SnackbarProvider>
    </div>
  );
}
