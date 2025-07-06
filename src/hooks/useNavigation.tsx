import { useLocation } from "react-router-dom";

export const useNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? "bg-gray-200 text-gray-900 font-medium" 
      : "hover:bg-gray-100 hover:text-gray-900";
  };

  return {
    currentPath,
    isActive,
    getNavClassName,
  };
};