import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, CircleUserRound, LogOut, LogIn, UserPlus, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { logoutUser } from "../store/authSlice";
import "./HomeAccountMenu.css";

function HomeAccountMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!menuRef.current || menuRef.current.contains(event.target)) {
        return;
      }

      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await dispatch(logoutUser());
    setOpen(false);
    navigate("/", { replace: true });
  }

  return (
    <div className="rt-home-account" ref={menuRef}>
      <button
        type="button"
        className="rt-home-account-button"
        onClick={() => setOpen((current) => !current)}
      >
        <CircleUserRound size={18} />
        <span>{isAuthenticated ? user?.name?.split(" ")[0] || "الحساب" : "الحساب"}</span>
        <ChevronDown size={16} />
      </button>

      {open ? (
        <div className="rt-home-account-menu">
          {isAuthenticated ? (
            <div className="rt-home-account-label">{user?.email}</div>
          ) : null}

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="rt-home-account-link"
                onClick={() => setOpen(false)}
              >
                <LogIn size={16} />
                <span>تسجيل الدخول</span>
              </Link>
              <Link
                to="/register"
                className="rt-home-account-link"
                onClick={() => setOpen(false)}
              >
                <UserPlus size={16} />
                <span>إنشاء حساب</span>
              </Link>
            </>
          ) : null}

          <Link
            to="/profile"
            className="rt-home-account-link"
            onClick={() => setOpen(false)}
          >
            <UserRound size={16} />
            <span>الملف الشخصي</span>
          </Link>

          {isAuthenticated ? (
            <button type="button" className="rt-home-account-logout" onClick={handleLogout}>
              <LogOut size={16} />
              <span>تسجيل الخروج</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default HomeAccountMenu;
