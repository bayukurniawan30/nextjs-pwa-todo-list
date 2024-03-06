type Props = {
  title: string;
  open: boolean;
  children: React.ReactNode;
};

const CollapsedTodosCard = ({ title, open, children }: Props) => {
  return (
    <div
      className={`collapse border border-base-300 bg-base-200 ${
        open ? "collapse-open" : "collapse-close"
      }`}
    >
      <input type="checkbox" />
      <div className="collapse-title text-lg font-medium text-center">
        {title}
      </div>
      <div className="collapse-content">{children}</div>
    </div>
  );
};

export default CollapsedTodosCard;
