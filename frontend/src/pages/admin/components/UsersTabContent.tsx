import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from 'lucide-react';
// import AddAlbumDialog from "./AddAlbumDialog";
import UsersTable from "./UsersTable";
const UsersTabContent = () => {
	return (
		<Card className='bg-zinc-800/50 border-zinc-700/50'>
			<CardHeader>
				<div className='flex items-start justify-between max-sm:flex-col max-sm:gap-3'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<User className='h-5 w-5 text-violet-500' />
							Users Library
						</CardTitle>
						<CardDescription>Manage Users</CardDescription>
					</div>
					{/* <AddAlbumDialog /> */}
				</div>
			</CardHeader>

			<CardContent>
				<UsersTable />
			</CardContent>
		</Card>
	);
};
export default UsersTabContent;
