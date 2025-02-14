import { UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Header = () => {
	return (
		<div className='flex items-center justify-between'>
			<div className='flex items-center gap-3 mb-8 justify-center'>
				<Link to='/' className='rounded-lg text-3xl'>
                <span className='font-bold text-white'>B</span>eat<span className='font-bold text-white'>B</span>uzz
				</Link>
				<div>
					<h1 className='text-sm font-bold'>Music Manager</h1>
					<p className='text-zinc-400 mt-1'>Manage your music catalog</p>
				</div>
			</div>
            <div className="mt-[-40px]">
			<UserButton />
            </div>
		</div>
	);
};
export default Header;
