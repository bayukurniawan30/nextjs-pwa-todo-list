type Props = {
  children: React.ReactNode;
};

const TodoCard = ({ children }: Props) => {
  return (
    <div className="card w-full bg-base-300 shadow-xl border-primary-content border">
      <div className="card-body">{children}</div>
    </div>
  );
};

export default TodoCard;
