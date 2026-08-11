import { Badge } from "#/components/ui/badge";

type ClientStatusBadgeProps = {
	isActive: boolean;
};

export const ClientStatusBadge = ({ isActive }: ClientStatusBadgeProps) => {
	return (
		<Badge variant={isActive ? "success" : "neutral"}>
			{isActive ? "Ativo" : "Inativo"}
		</Badge>
	);
};
