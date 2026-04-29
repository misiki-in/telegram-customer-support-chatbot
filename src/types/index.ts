import type { UserRole } from '@/db/schema';

export type HonoApp = {
	Variables: {
		user?: {
			id: string;
			role: UserRole;
		};
	};
};
