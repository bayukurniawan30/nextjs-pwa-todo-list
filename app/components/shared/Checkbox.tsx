import { useState } from "react";

type Props = {
  checked?: boolean;
  name: string;
  onChange: () => void;
};

const TodoListCheckbox = ({ checked, name, onChange }: Props) => {
  const [check, setCheck] = useState(checked);

  const handleChange = () => {
    onChange();
    setCheck(!check);
  };

  return (
    <div className="form-control">
      <label className="cursor-pointer label">
        <input
          type="checkbox"
          defaultChecked={checked}
          onChange={handleChange}
          className="checkbox checkbox-error"
        />
        <span className="label-text">
          {checked || check ? <s>{name}</s> : name}
        </span>
      </label>
    </div>
  );
};

export default TodoListCheckbox;
