// import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import useUserFetchStore from "@/stores/fetchUserStore";
// import { useAuth } from "@clerk/clerk-react";
const UsersTable = () => {
  const { fetchUser, users } = useUserFetchStore();
  console.log("For Mapping", users);
  // const { getToken } = useAuth();
  const token = localStorage.getItem("token"); // Get token from local storage

  useEffect(() => {
    const fetchTokenAndUsers = async () => {
      if (token) {
        fetchUser(token);
      }
    };
    fetchTokenAndUsers();
  }, []);
  console.log(users);
  return (
    <div className="max-sm:max-h-[400px] max-sm:overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-zinc-800/50">
            <TableHead className="w-[50px]">Picture</TableHead>
            <TableHead>Fullname</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>IsPremium</TableHead>
            {/* <TableHead className="text-right">Actions</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id} className="hover:bg-zinc-800/50">
              <TableCell>
                <img
                  src={user.imageUrl || "./default-avatar.png"}
                  alt={user.username}
                  className="size-8 rounded-full object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">{user.fullName}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-zinc-400">
                  {/* <Calendar className="h-4 w-4" /> */}
                  {user.email}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-zinc-400">
                  {/* <Music className="h-4 w-4" /> */}
                  {user.isPremiumUser ? "Yes" : "No"}
                </span>
              </TableCell>
              {/* <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  // onClick={() => deleteAlbum(album._id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
export default UsersTable;
