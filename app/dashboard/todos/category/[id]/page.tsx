"use client";
import AddCategoryModal from "@/app/components/shared/AddCategoryModal";
import AddTodoModal from "@/app/components/shared/AddTodoModal";
import TodoListCheckbox from "@/app/components/shared/Checkbox";
import CollapsedTodosCard from "@/app/components/shared/CollapsedTodosCard";
import Navbar from "@/app/components/shared/Navbar";
import TodoCard from "@/app/components/shared/TodoCard";
import { useCategoriestore } from "@/hooks/category";
import axios from "@/lib/axios";
import { Category, ListData, Todo } from "@/type/api";
import moment from "moment";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";

export default function Todos({ params }: { params: { id: string } }) {
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>();

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleOpenCategoryModal = () => {
    setOpenCategoryModal(true);
  };

  useEffect(() => {
    useCategoriestore
      .getState()
      .fetchCategories()
      .then(() => {
        const findCurrentCategory = useCategoriestore
          .getState()
          .categories.find((category) => category.id === parseInt(params.id));
        setActiveCategory(findCurrentCategory);
      });
  }, []);

  const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");
  const today = moment().format("YYYY-MM-DD");
  const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

  const todosYesterdayMutateKey =
    "/todos?filter=" +
    JSON.stringify([
      { field: "category_id", value: params.id, operator: "=" },
      { field: "assign_date", value: yesterday, operator: "=" },
    ]);
  const todosTodayMutateKey =
    "/todos?filter=" +
    JSON.stringify([
      { field: "category_id", value: params.id, operator: "=" },
      { field: "assign_date", value: today, operator: "=" },
    ]);
  const todosTomorrowMutateKey =
    "/todos?filter=" +
    JSON.stringify([
      { field: "category_id", value: params.id, operator: "=" },
      { field: "assign_date", value: tomorrow, operator: "=" },
    ]);

  const {
    data: categories,
    error: categoriesError,
    isLoading: categoriesIsLoading,
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

  const {
    data: todosYesterday,
    error: todosYesterdayError,
    isLoading: todosYesterdayIsLoading,
  } = useSWR<ListData<Todo>>(
    "/todo-yesterday",
    () =>
      axios
        .get(todosYesterdayMutateKey, {
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

  const {
    data: todosToday,
    error: todosTodayError,
    isLoading: todosTodayIsLoading,
  } = useSWR<ListData<Todo>>(
    "/todo-today",
    () =>
      axios
        .get(todosTodayMutateKey, {
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

  const {
    data: todosTomorrow,
    error: todosTomorrowError,
    isLoading: todosTomorrowIsLoading,
  } = useSWR<ListData<Todo>>(
    "/todo-tomorrow",
    () =>
      axios
        .get(todosTomorrowMutateKey, {
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

  const handleUpdateTodos = (id: number, state: boolean, mutateKey: string) => {
    console.log("🚀 ~ handleUpdateTodos ~ state:", state);
    try {
      axios
        .put(
          `/todos/${id}`,
          {
            status: state ? "done" : "active",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((res) => {
          if (res.status === 200) {
            mutate(mutateKey);
          } else {
            enqueueSnackbar(`Failed to update todo. Please try again`, {
              variant: "error",
              anchorOrigin: { horizontal: "center", vertical: "bottom" },
            });
          }
        })
        .catch((err) => {
          console.log("🚀 ~ handleUpdateTodos ~ err:", err);
        });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="bg-base-100">
      <Navbar
        categories={categories?.data || []}
        activeId={params.id}
        onOpenAddCategoryModal={() => handleOpenCategoryModal()}
      ></Navbar>

      <div className="container mx-auto px-6">
        <div
          className="hero h-32 rounded-xl"
          style={{
            backgroundImage: "url(/images/header.jpeg)",
          }}
        >
          <div className="hero-overlay bg-opacity-50"></div>
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-3xl font-bold">{activeCategory?.name}</h1>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div>
            <CollapsedTodosCard
              title="Yesterday"
              open={
                todosYesterday && todosYesterday.data.length > 0 ? true : false
              }
            >
              {todosYesterday && todosYesterday.data.length > 0 ? (
                <div>
                  {todosYesterday?.data.map((todo) => (
                    <TodoListCheckbox
                      key={todo.id}
                      name={todo.title}
                      checked={todo.status === "done" ? true : false}
                      onChange={() =>
                        handleUpdateTodos(
                          todo.id,
                          todo.status === "done" ? false : true,
                          "/todo-yesterday"
                        )
                      }
                    ></TodoListCheckbox>
                  ))}
                </div>
              ) : (
                <div>
                  <p>No Todos</p>
                </div>
              )}
            </CollapsedTodosCard>
          </div>
          <div>
            <CollapsedTodosCard
              title="Today"
              open={todosToday && todosToday.data.length > 0 ? true : false}
            >
              {todosToday && todosToday.data.length > 0 ? (
                <div>
                  {todosToday?.data.map((todo) => (
                    <TodoListCheckbox
                      key={todo.id}
                      name={todo.title}
                      checked={todo.status === "done" ? true : false}
                      onChange={() =>
                        handleUpdateTodos(
                          todo.id,
                          todo.status === "done" ? false : true,
                          "/todo-today"
                        )
                      }
                    ></TodoListCheckbox>
                  ))}
                </div>
              ) : (
                <div>
                  <p>No Todos</p>
                </div>
              )}
            </CollapsedTodosCard>
          </div>
          <div>
            <CollapsedTodosCard
              title="Tomorrow"
              open={
                todosTomorrow && todosTomorrow.data.length > 0 ? true : false
              }
            >
              {todosTomorrow && todosTomorrow.data.length > 0 ? (
                <div>
                  {todosTomorrow?.data.map((todo) => (
                    <TodoListCheckbox
                      key={todo.id}
                      name={todo.title}
                      checked={todo.status === "done" ? true : false}
                      onChange={() =>
                        handleUpdateTodos(
                          todo.id,
                          todo.status === "done" ? false : true,
                          "/todo-tomorrow"
                        )
                      }
                    ></TodoListCheckbox>
                  ))}
                </div>
              ) : (
                <div>
                  <p>No Todos</p>
                </div>
              )}
            </CollapsedTodosCard>
          </div>
        </div>
      </div>

      <button
        className="btn btn-circle btn-primary fixed bottom-6 right-6"
        onClick={() => handleOpenModal()}
      >
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
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>

      <AddTodoModal
        open={openModal}
        categoryId={params.id}
        onOpenModal={() => handleOpenModal}
        onCloseModal={() => setOpenModal(false)}
      ></AddTodoModal>

      <AddCategoryModal
        open={openCategoryModal}
        currentTotalCategory={categories ? categories.data.length : 0}
        redirect={true}
        onOpenModal={() => handleOpenCategoryModal}
        onCloseModal={() => setOpenCategoryModal(false)}
      ></AddCategoryModal>

      <SnackbarProvider maxSnack={1} autoHideDuration={2000}></SnackbarProvider>
    </div>
  );
}
