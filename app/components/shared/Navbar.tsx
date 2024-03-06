import { useAuth } from "@/hooks/auth";
import { Category } from "@/type/api";
import { useRouter } from "next/navigation";

type Props = {
  categories: Category[];
  activeId?: string;
  onOpenAddCategoryModal: () => void;
};

const Navbar = ({ categories, onOpenAddCategoryModal, activeId }: Props) => {
  const router = useRouter();
  const { logout } = useAuth({ middleware: "auth" });
  const active = activeId ? parseInt(activeId) : 0;

  const handleGotoDashboard = () => {
    router.push(`/dashboard`);
  };

  const handleGotoCategory = (category: Category) => {
    router.push(`/dashboard/todos/category/${category.id}`);
  };

  return (
    <div className="navbar bg-base-100 px-6 mb-6">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a onClick={onOpenAddCategoryModal}>+ Add Category</a>
            </li>
            {categories.length > 0
              ? categories.map((category) => (
                  <li key={category.slug}>
                    <a
                      className={active === category.id ? "active" : ""}
                      onClick={() => handleGotoCategory(category)}
                    >
                      {category.name}
                    </a>
                  </li>
                ))
              : null}
          </ul>
        </div>
      </div>
      <div className="navbar-center">
        <a className="btn btn-ghost text-xl" onClick={handleGotoDashboard}>
          Now ToDo
        </a>
      </div>
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar placeholder"
          >
            <div className="bg-neutral text-neutral-content rounded-full w-12">
              <span className="text-xl">BK</span>
            </div>
          </div>
          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
          >
            <li>
              <a onClick={logout}>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
