import { useAuth } from "../contexts/AuthContext";

export default function RoleToggle() {
  const { role, setRole } = useAuth();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setRole("editor")}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          role === "editor"
            ? "bg-blue-100 text-blue-700"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        }`}
      >
        Editor
      </button>
      <button
        onClick={() => setRole("admin")}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          role === "admin"
            ? "bg-blue-100 text-blue-700"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        }`}
      >
        Admin
      </button>
    </div>
  );
}
