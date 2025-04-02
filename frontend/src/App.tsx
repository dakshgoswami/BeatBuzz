import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import Mainlayout from "./layout/Mainlayout";
import ChatPage from "./pages/chat/ChatPage";
import AlbumPage from "./pages/album/AlbumPage";
import AdminPage from "./pages/admin/AdminPage";
import { Toaster } from "react-hot-toast";
import Premium from "./pages/premium/Premium";
import SignUp from "./pages/signup/Signup";
import Login from "./pages/login/Login";
import Authenticate from "./pages/auth/Authenticate";
import MyProfile from "./pages/myprofile/MyProfile";
import EditProfile from "./pages/myprofile/EditProfile";
import ForgotPassword from "./pages/login/ForgotPassword";
import ResetPassword from "./pages/login/ResetPassword";
const App = () => {
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/admin"
          element={
            <Authenticate>
              <AdminPage />
            </Authenticate>
          }
        />
        <Route
          path="/premium"
          element={
            <Authenticate>
              <Premium />
            </Authenticate>
          }
        />
        <Route element={<Mainlayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/chat"
            element={
              <Authenticate>
                <ChatPage />
              </Authenticate>
            }
          />
          <Route path="/albums/:albumId" element={<AlbumPage />} />
          <Route
            path="/myprofile"
            element={
              <Authenticate>
                <MyProfile />
              </Authenticate>
            }
          />
          <Route
            path="/editprofile"
            element={
              <Authenticate>
                <EditProfile />
              </Authenticate>
            }
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
