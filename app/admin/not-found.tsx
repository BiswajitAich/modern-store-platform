import Link from "next/link";

export default function NotFound({
  message,
  path,
}: {
  message?: string;
  path?: string;
}) {
  return (
    <div>
      <h2>Not Found</h2>
      <p>{message ? message : "Could not find requested resource"}</p>
      <Link href={path ? path : "/"}>Return to {path ? path : "Home"}</Link>
    </div>
  );
}
