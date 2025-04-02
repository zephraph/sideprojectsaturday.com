import { FC, PropsWithChildren } from "hono/jsx";

export const PageShell: FC<PropsWithChildren> = ({ children }) => (
	<html lang="en">
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Side Project Saturdays</title>
			<script src="https://cdn.twind.style" crossorigin="anonymous"></script>
		</head>
		<body class="font-sans antialiased">{children}</body>
	</html>
);
