import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import axios from "@/lib/axios";
import { useCategoriestore } from "@/hooks/category";
import { enqueueSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

type Props = {
  open: boolean;
  currentTotalCategory: number;
  redirect?: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
};

interface FormCategoryData {
  name: string;
}

const categorySchema = yup.object().shape({
  name: yup.string().required(),
});

const AddCategoryModal = ({
  open,
  currentTotalCategory,
  redirect,
  onOpenModal,
  onCloseModal,
}: Props) => {
  const router = useRouter();
  const [disable, setDisable] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormCategoryData>({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmitHandler = async (values: FormCategoryData) => {
    try {
      setDisable(true);

      axios
        .post(
          `/categories`,
          {
            name: values.name,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((res) => {
          if (res.status === 201) {
            // update categories state
            useCategoriestore.getState().fetchCategories();

            setTimeout(() => {
              onCloseModal();
              setDisable(false);
              reset({
                name: "",
              });
              mutate("/categories");

              if (currentTotalCategory === 0 || redirect) {
                router.push("/dashboard/todos/category/" + res.data.id);
              }
            }, 1000);
            enqueueSnackbar(`New category has been added successfully`, {
              variant: "success",
              anchorOrigin: { horizontal: "center", vertical: "bottom" },
            });
          } else {
            setDisable(false);
            enqueueSnackbar(
              `Failed to create new singleton. Please try again`,
              {
                variant: "error",
                anchorOrigin: { horizontal: "center", vertical: "bottom" },
              }
            );
          }
        })
        .catch((err) => {
          setDisable(false);
          err;
        });
    } catch (e) {
      setDisable(false);
      console.log(e);
    }
  };

  return (
    <div>
      <input
        type="checkbox"
        id="show_add_category_modal"
        className="modal-toggle"
        checked={open}
        onChange={onOpenModal}
      />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onCloseModal}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg mb-4">Add New Category</h3>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                placeholder="Category Name"
                className="input input-bordered w-full"
                {...field}
              />
            )}
          />
          <div className="modal-action">
            <button
              className="btn btn-primary"
              onClick={handleSubmit(onSubmitHandler)}
            >
              {disable && <span className="loading loading-spinner"></span>}
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;
