import { useRouter } from "next/navigation";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import moment from "moment";
import axios from "@/lib/axios";
import { mutate } from "swr";
import { enqueueSnackbar } from "notistack";

type Props = {
  open: boolean;
  categoryId: string;
  onOpenModal: () => void;
  onCloseModal: () => void;
};

interface FormTodoData {
  title: string;
  assignDate: string;
  categoryId?: number;
}

const todoSchema = yup.object().shape({
  title: yup.string().required(),
  categoryId: yup.number(),
  assignDate: yup.string().required(),
});

const AddTodoModal = ({
  open,
  categoryId,
  onOpenModal,
  onCloseModal,
}: Props) => {
  const [disable, setDisable] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormTodoData>({
    resolver: yupResolver(todoSchema),
    defaultValues: {
      title: "",
      assignDate: moment().format("YYYY-MM-DD"),
    },
  });

  const onSubmitHandler = async (values: FormTodoData) => {
    console.log();
    try {
      setDisable(true);

      axios
        .post(
          `/todos`,
          {
            title: values.title,
            categoryId: parseInt(categoryId),
            assignDate: moment(values.assignDate).format("YYYY-MM-DD"),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((res) => {
          if (res.status === 201) {
            setTimeout(() => {
              onCloseModal();
              setDisable(false);
              reset({
                title: "",
                assignDate: moment().format("YYYY-MM-DD"),
              });
              mutate("/todo-yesterday");
              mutate("/todo-today");
              mutate("/todo-tomorrow");
            }, 1000);
            enqueueSnackbar(`Todo has been added successfully`, {
              variant: "success",
              anchorOrigin: { horizontal: "center", vertical: "bottom" },
            });
          } else {
            setDisable(false);
            enqueueSnackbar(`Failed to create new todo. Please try again`, {
              variant: "error",
              anchorOrigin: { horizontal: "center", vertical: "bottom" },
            });
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
          <h3 className="font-bold text-lg mb-4">Add Todo</h3>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                placeholder="Title"
                className="input input-bordered w-full mb-3"
                {...field}
              />
            )}
          />

          <Controller
            name="assignDate"
            control={control}
            render={({ field }) => (
              <input
                type="date"
                placeholder="Assign Date"
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

export default AddTodoModal;
